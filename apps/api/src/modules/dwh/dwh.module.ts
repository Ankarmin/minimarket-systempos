import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DimProducto } from './entities/dim-producto.entity';
import { DimCliente } from './entities/dim-cliente.entity';
import { DimTiempo } from './entities/dim-tiempo.entity';
import { DimSucursal } from './entities/dim-sucursal.entity';
import { FactVenta } from './entities/fact-venta.entity';
import { EtlService } from './etl.service';
import { DwhService } from './dwh.service';
import { DwhController } from './dwh.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DimProducto, DimCliente, DimTiempo, DimSucursal, FactVenta])],
  controllers: [DwhController],
  providers: [EtlService, DwhService],
  exports: [EtlService, DwhService],
})
export class DwhModule {}
