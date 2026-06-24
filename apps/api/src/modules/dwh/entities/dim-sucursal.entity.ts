import { Entity, Column } from 'typeorm';

@Entity('dim_sucursal', { schema: 'dwh' })
export class DimSucursal {
  @Column({ primary: true, name: 'id_sucursal' })
  idSucursal: number;

  @Column({ type: 'varchar', length: 200 })
  nombre: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  region: string;
}
