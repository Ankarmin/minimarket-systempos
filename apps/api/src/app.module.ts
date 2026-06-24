import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { databaseConfig } from './config/database.config';
import { SucursalModule } from './modules/sucursal/sucursal.module';
import { ProductoModule } from './modules/producto/producto.module';
import { ClienteModule } from './modules/cliente/cliente.module';
import { VentaModule } from './modules/venta/venta.module';
import { DwhModule } from './modules/dwh/dwh.module';
import { DashboardController } from './modules/venta/dashboard.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(databaseConfig),
    SucursalModule,
    ProductoModule,
    ClienteModule,
    VentaModule,
    DwhModule,
  ],
  controllers: [DashboardController],
})
export class AppModule {}
