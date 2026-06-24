import { Entity, Column } from 'typeorm';

@Entity('dim_producto', { schema: 'dwh' })
export class DimProducto {
  @Column({ primary: true, name: 'id_producto' })
  idProducto: number;

  @Column({ type: 'varchar', length: 200 })
  nombre: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  categoria: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'precio_unitario' })
  precioUnitario: number;
}
