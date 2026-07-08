import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class EtlService {
  private readonly MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async ejecutar(): Promise<{ mensaje: string; etapas: string[] }> {
    const etapas: string[] = [];

    await this.dataSource.transaction(async (manager) => {
      etapas.push('⏳ Iniciando ETL...');

      // 1. Limpiar DWH
      await manager.query('DELETE FROM dwh.fact_ventas');
      await manager.query('DELETE FROM dwh.dim_tiempo');
      await manager.query('DELETE FROM dwh.dim_producto');
      await manager.query('DELETE FROM dwh.dim_cliente');
      await manager.query('DELETE FROM dwh.dim_sucursal');
      etapas.push('✅ Tablas DWH limpiadas');

      // 2. Cargar dim_producto
      await manager.query(`
        INSERT INTO dwh.dim_producto (id_producto, nombre, categoria, precio_unitario)
        SELECT id, nombre, categoria, precio FROM productos WHERE estado = true
      `);
      etapas.push('✅ dim_producto cargado');

      // 3. Cargar dim_cliente
      await manager.query(`
        INSERT INTO dwh.dim_cliente (id_cliente, nombre, tipo)
        SELECT id, nombre,
          CASE WHEN dni = '00000000' THEN 'Anonimo' ELSE 'Registrado' END
        FROM clientes WHERE estado = true
      `);
      etapas.push('✅ dim_cliente cargado');

      // 4. Cargar dim_sucursal
      await manager.query(`
        INSERT INTO dwh.dim_sucursal (id_sucursal, nombre, region)
        SELECT id_sucursal, nombre, nombre FROM sucursales WHERE activo = true
      `);
      etapas.push('✅ dim_sucursal cargado');

      // 5. Generar dim_tiempo desde las fechas de ventas
      const tiempos = await manager.query(`
        SELECT DISTINCT
          EXTRACT(YEAR FROM fecha)::int AS anio,
          EXTRACT(MONTH FROM fecha)::int AS mes
        FROM ventas WHERE estado = true
        ORDER BY anio, mes
      `);

      const insertsDimTiempo: string[] = [];
      for (const t of tiempos) {
        const id = t.anio * 100 + t.mes;
        const trimestre = Math.ceil(t.mes / 3);
        const nombreMes = this.MESES[t.mes - 1];
        insertsDimTiempo.push(
          `(${id}, ${t.anio}, ${t.mes}, ${trimestre}, '${nombreMes}')`,
        );
      }
      if (insertsDimTiempo.length > 0) {
        await manager.query(`
          INSERT INTO dwh.dim_tiempo (id_tiempo, anio, mes, trimestre, nombre_mes)
          VALUES ${insertsDimTiempo.join(',\n')}
        `);
      }
      etapas.push(`✅ dim_tiempo cargado (${tiempos.length} periodos)`);

      // 6. Cargar fact_ventas (agregación desde detalle_ventas + ventas)
      const result = await manager.query(`
        INSERT INTO dwh.fact_ventas (id_producto, id_cliente, id_tiempo, id_sucursal, cantidad, total_venta, igv)
        SELECT
          dv.producto_id,
          COALESCE(v.cliente_id, 1),
          EXTRACT(YEAR FROM v.fecha)::int * 100 + EXTRACT(MONTH FROM v.fecha)::int,
          v.id_sucursal,
          SUM(dv.cantidad),
          SUM(dv.subtotal),
          SUM(dv.subtotal * 0.18)
        FROM detalle_ventas dv
        JOIN ventas v ON v.id = dv.venta_id
        WHERE dv.estado = true AND v.estado = true
        GROUP BY dv.producto_id, v.cliente_id, EXTRACT(YEAR FROM v.fecha)::int * 100 + EXTRACT(MONTH FROM v.fecha)::int, v.id_sucursal
      `);

      const count = await manager.query('SELECT COUNT(*) as cnt FROM dwh.fact_ventas');
      etapas.push(`✅ fact_ventas cargado (${count[0].cnt} hechos)`);
    });

    return {
      mensaje: 'ETL completado exitosamente',
      etapas,
    };
  }

  /**
   * Ejecuta el ETL delegando toda la lógica al DBMS mediante el
   * procedimiento almacenado PL/pgSQL `dwh.sp_refrescar_dwh()`.
   * Demuestra el desarrollo "en el lenguaje asociado al DBMS".
   */
  async ejecutarEnDbms(): Promise<{ mensaje: string; motor: string; hechos: number }> {
    await this.dataSource.query('CALL dwh.sp_refrescar_dwh()');
    const count = await this.dataSource.query(
      'SELECT COUNT(*)::int AS cnt FROM dwh.fact_ventas',
    );
    return {
      mensaje: 'ETL ejecutado dentro del DBMS (PL/pgSQL: CALL dwh.sp_refrescar_dwh)',
      motor: 'PL/pgSQL — procedimiento almacenado',
      hechos: count[0].cnt,
    };
  }
}
