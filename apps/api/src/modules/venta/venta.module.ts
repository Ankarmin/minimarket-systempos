import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venta } from './entities/venta.entity';
import { DetalleVenta } from './entities/detalle-venta.entity';
import { Producto } from '../producto/entities/producto.entity';
import { VentaService } from './venta.service';
import { VentaController } from './venta.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Venta, DetalleVenta, Producto])],
  controllers: [VentaController],
  providers: [VentaService],
  exports: [VentaService],
})
export class VentaModule {}
