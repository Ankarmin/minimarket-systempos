import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('fact_ventas', { schema: 'dwh' })
export class FactVenta {
  @PrimaryGeneratedColumn({ name: 'id_fact' })
  idFact: number;

  @Column({ name: 'id_producto' })
  idProducto: number;

  @Column({ name: 'id_cliente' })
  idCliente: number;

  @Column({ name: 'id_tiempo' })
  idTiempo: number;

  @Column({ name: 'id_sucursal' })
  idSucursal: number;

  @Column({ type: 'integer', default: 0 })
  cantidad: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'total_venta' })
  totalVenta: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  igv: number;
}
