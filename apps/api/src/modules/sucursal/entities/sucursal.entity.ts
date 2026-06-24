import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Venta } from '../../venta/entities/venta.entity';

@Entity('sucursales')
export class Sucursal {
  @PrimaryGeneratedColumn({ name: 'id_sucursal' })
  id: number;

  @Column({ type: 'varchar', length: 200 })
  nombre: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  direccion: string;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @OneToMany(() => Venta, (venta) => venta.sucursal)
  ventas: Venta[];
}
