import { Entity, Column } from 'typeorm';

@Entity('dim_tiempo', { schema: 'dwh' })
export class DimTiempo {
  @Column({ primary: true, name: 'id_tiempo' })
  idTiempo: number;

  @Column({ type: 'integer' })
  anio: number;

  @Column({ type: 'integer' })
  mes: number;

  @Column({ type: 'integer' })
  trimestre: number;

  @Column({ type: 'varchar', length: 20, name: 'nombre_mes' })
  nombreMes: string;
}
