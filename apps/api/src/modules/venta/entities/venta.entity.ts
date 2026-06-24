import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Cliente } from '../../cliente/entities/cliente.entity';
import { Sucursal } from '../../sucursal/entities/sucursal.entity';
import { DetalleVenta } from './detalle-venta.entity';

@Entity('ventas')
export class Venta {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Cliente, (cliente) => cliente.ventas, { nullable: true })
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;

  @Column({ name: 'cliente_id', nullable: true })
  clienteId: number;

  @ManyToOne(() => Sucursal, (sucursal) => sucursal.ventas)
  @JoinColumn({ name: 'id_sucursal' })
  sucursal: Sucursal;

  @Column({ name: 'id_sucursal' })
  sucursalId: number;

  @Column({ type: 'timestamp' })
  fecha: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  igv: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ type: 'boolean', default: true })
  estado: boolean;

  @OneToMany(() => DetalleVenta, (detalle) => detalle.venta, { cascade: true })
  detalles: DetalleVenta[];
}
