import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class DwhService {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async ventasPorMes() {
    return this.dataSource.query(`
      SELECT
        t.id_tiempo,
        t.anio,
        t.nombre_mes,
        SUM(f.cantidad)::int AS unidades,
        ROUND(SUM(f.total_venta), 2) AS total_venta,
        ROUND(SUM(f.igv), 2) AS total_igv
      FROM dwh.fact_ventas f
      JOIN dwh.dim_tiempo t ON t.id_tiempo = f.id_tiempo
      GROUP BY t.id_tiempo, t.anio, t.nombre_mes
      ORDER BY t.id_tiempo
    `);
  }

  async ventasPorProducto() {
    return this.dataSource.query(`
      SELECT
        p.id_producto,
        p.nombre,
        p.categoria,
        SUM(f.cantidad)::int AS unidades,
        ROUND(SUM(f.total_venta), 2) AS total_venta
      FROM dwh.fact_ventas f
      JOIN dwh.dim_producto p ON p.id_producto = f.id_producto
      GROUP BY p.id_producto, p.nombre, p.categoria
      ORDER BY total_venta DESC
    `);
  }

  async ventasPorSucursal() {
    return this.dataSource.query(`
      SELECT
        s.id_sucursal,
        s.nombre,
        s.region,
        SUM(f.cantidad)::int AS unidades,
        ROUND(SUM(f.total_venta), 2) AS total_venta
      FROM dwh.fact_ventas f
      JOIN dwh.dim_sucursal s ON s.id_sucursal = f.id_sucursal
      GROUP BY s.id_sucursal, s.nombre, s.region
      ORDER BY total_venta DESC
    `);
  }

  async topClientes(limit = 10) {
    return this.dataSource.query(`
      SELECT
        c.id_cliente,
        c.nombre,
        c.tipo,
        SUM(f.cantidad)::int AS unidades,
        ROUND(SUM(f.total_venta), 2) AS total_venta
      FROM dwh.fact_ventas f
      JOIN dwh.dim_cliente c ON c.id_cliente = f.id_cliente
      GROUP BY c.id_cliente, c.nombre, c.tipo
      ORDER BY total_venta DESC
      LIMIT $1
    `, [limit]);
  }

  async cuboMultidimensional() {
    return this.dataSource.query(`
      SELECT
        p.nombre AS producto,
        s.nombre AS sucursal,
        t.anio,
        t.nombre_mes,
        SUM(f.cantidad)::int AS unidades,
        ROUND(SUM(f.total_venta), 2) AS total_venta
      FROM dwh.fact_ventas f
      JOIN dwh.dim_producto p ON p.id_producto = f.id_producto
      JOIN dwh.dim_sucursal s ON s.id_sucursal = f.id_sucursal
      JOIN dwh.dim_tiempo t ON t.id_tiempo = f.id_tiempo
      GROUP BY p.nombre, s.nombre, t.anio, t.nombre_mes, t.id_tiempo
      ORDER BY t.anio, t.id_tiempo, s.nombre, total_venta DESC
    `);
  }

  async crossTab() {
    const rows: { producto: string; sucursal: string; total_venta: string }[] = await this.dataSource.query(`
      SELECT
        p.nombre AS producto,
        s.nombre AS sucursal,
        ROUND(SUM(f.total_venta), 2) AS total_venta
      FROM dwh.fact_ventas f
      JOIN dwh.dim_producto p ON p.id_producto = f.id_producto
      JOIN dwh.dim_sucursal s ON s.id_sucursal = f.id_sucursal
      GROUP BY p.nombre, s.nombre
      ORDER BY p.nombre, s.nombre
    `);

    const productos = [...new Set<string>(rows.map((r: { producto: string }) => r.producto))];
    const sucursales = [...new Set<string>(rows.map((r: { sucursal: string }) => r.sucursal))];

    const matrix: Record<string, Record<string, number>> = {};
    for (const p of productos) {
      matrix[p] = {};
      for (const s of sucursales) {
        matrix[p][s] = 0;
      }
    }
    for (const r of rows) {
      matrix[r.producto][r.sucursal] = +r.total_venta;
    }

    return { productos, sucursales, matrix };
  }

  async cubo2D() {
    const productos = await this.dataSource.query(
      `SELECT id_producto, nombre FROM dwh.dim_producto ORDER BY id_producto`,
    ) as { id_producto: number; nombre: string }[];

    const meses = await this.dataSource.query(
      `SELECT id_tiempo, mes, nombre_mes FROM dwh.dim_tiempo ORDER BY id_tiempo`,
    ) as { id_tiempo: number; mes: number; nombre_mes: string }[];

    const prods = productos.map((p) => ({ id: p.id_producto, nombre: p.nombre }));
    const mesLabels = meses.map((m) => `${m.nombre_mes}`);
    const N = meses.length;

    const matrix: number[][] = prods.map(() => new Array(N).fill(0));

    const rows = await this.dataSource.query(
      `SELECT f.id_producto, t.mes, ROUND(SUM(f.total_venta), 2) AS total
       FROM dwh.fact_ventas f
       JOIN dwh.dim_tiempo t ON t.id_tiempo = f.id_tiempo
       GROUP BY f.id_producto, t.mes`,
    ) as { id_producto: number; mes: number; total: string }[];

    for (const r of rows) {
      const i = prods.findIndex((p) => p.id === r.id_producto);
      const j = r.mes - 1;
      if (i >= 0 && j >= 0 && j < N) matrix[i][j] = +r.total;
    }

    return {
      productos: prods.map((p) => p.nombre),
      meses: mesLabels,
      mesesIdx: meses.map((m) => m.mes),
      matrix,
      formula: 'offset2D = ((i-1) * N + (j-1)) * W',
      descripcion: `Cubo 2D: Producto × Mes (${prods.length}×${N}), N=${N}, W=8 bytes`,
      totalVentas: rows.reduce((a, r) => a + +r.total, 0).toFixed(2),
    };
  }

  async cubo3D() {
    const productos = await this.dataSource.query(
      `SELECT id_producto, nombre FROM dwh.dim_producto ORDER BY id_producto`,
    ) as { id_producto: number; nombre: string }[];

    const meses = await this.dataSource.query(
      `SELECT id_tiempo, mes, nombre_mes FROM dwh.dim_tiempo ORDER BY id_tiempo`,
    ) as { id_tiempo: number; mes: number; nombre_mes: string }[];

    const sucursales = await this.dataSource.query(
      `SELECT id_sucursal, nombre FROM dwh.dim_sucursal ORDER BY id_sucursal`,
    ) as { id_sucursal: number; nombre: string }[];

    const rows = await this.dataSource.query(
      `SELECT f.id_producto, t.mes, f.id_sucursal, ROUND(SUM(f.total_venta), 2) AS total
       FROM dwh.fact_ventas f
       JOIN dwh.dim_tiempo t ON t.id_tiempo = f.id_tiempo
       GROUP BY f.id_producto, t.mes, f.id_sucursal`,
    );

    const prods = productos.map((p) => ({ id: +p.id_producto, nombre: p.nombre }));
    const N = meses.length;

    const bySuc: Record<number, Record<number, Record<number, number>>> = {};
    for (const s of sucursales) {
      bySuc[+s.id_sucursal] = {};
    }

    for (const r of rows) {
      const sId = +r.id_sucursal;
      const pId = +r.id_producto;
      if (!bySuc[sId]) bySuc[sId] = {};
      if (!bySuc[sId][pId]) bySuc[sId][pId] = {};
      bySuc[sId][pId][+r.mes] = +r.total;
    }

    const cubicos = sucursales.map((suc) => {
      const map = bySuc[+suc.id_sucursal] ?? {};
      const matrix: number[][] = prods.map(() => new Array(N).fill(0));
      let subtotal = 0;
      for (let i = 0; i < prods.length; i++) {
        const row = map[prods[i].id];
        if (!row) continue;
        for (let j = 0; j < N; j++) {
          const v = row[meses[j].mes] ?? 0;
          matrix[i][j] = v;
          subtotal += v;
        }
      }
      return {
        sucursal: suc.nombre,
        idSucursal: +suc.id_sucursal,
        subtotal: subtotal.toFixed(2),
        matrix,
      };
    });

    const totalVentas = cubicos.reduce((a, c) => a + +c.subtotal, 0);

    return {
      productos: prods.map((p) => p.nombre),
      meses: meses.map((m) => m.nombre_mes),
      mesesIdx: meses.map((m) => m.mes),
      cubicos,
      formula: 'offset3D = ((i1-1) * N * P + (i2-1) * P + (i3-1)) * W',
      descripcion: `Cubo 3D: Producto × Mes × Sucursal (${prods.length}×${N}×${sucursales.length}), N=${N}, P=${sucursales.length}, W=8 bytes`,
      totalVentas: totalVentas.toFixed(2),
    };
  }
}
