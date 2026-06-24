import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Venta } from '../../venta/entities/venta.entity';

@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  nombre: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  dni: string;

  @Column({ type: 'varchar', length: 20, default: '' })
  telefono: string;

  @Column({ type: 'varchar', length: 200, default: '' })
  email: string;

  @Column({ type: 'boolean', default: true })
  estado: boolean;

  @OneToMany(() => Venta, (venta) => venta.cliente)
  ventas: Venta[];
}
