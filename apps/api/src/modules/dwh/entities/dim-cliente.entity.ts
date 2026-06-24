import { Entity, Column } from 'typeorm';

@Entity('dim_cliente', { schema: 'dwh' })
export class DimCliente {
  @Column({ primary: true, name: 'id_cliente' })
  idCliente: number;

  @Column({ type: 'varchar', length: 200 })
  nombre: string;

  @Column({ type: 'varchar', length: 20, default: 'Registrado' })
  tipo: string;
}
