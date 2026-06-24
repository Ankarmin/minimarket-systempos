import { Controller, Post, Get, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { EtlService } from './etl.service';
import { DwhService } from './dwh.service';

@Controller('api/analytics')
export class DwhController {
  constructor(
    private readonly etlService: EtlService,
    private readonly dwhService: DwhService,
  ) {}

  @Post('etl')
  ejecutarEtl() {
    return this.etlService.ejecutar();
  }

  @Get('ventas-por-mes')
  ventasPorMes() {
    return this.dwhService.ventasPorMes();
  }

  @Get('ventas-por-producto')
  ventasPorProducto() {
    return this.dwhService.ventasPorProducto();
  }

  @Get('ventas-por-sucursal')
  ventasPorSucursal() {
    return this.dwhService.ventasPorSucursal();
  }

  @Get('top-clientes')
  topClientes(@Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number) {
    return this.dwhService.topClientes(limit);
  }

  @Get('cubo')
  cubo() {
    return this.dwhService.cuboMultidimensional();
  }

  @Get('cross-tab')
  crossTab() {
    return this.dwhService.crossTab();
  }

  @Get('cubo-2d')
  cubo2D() {
    return this.dwhService.cubo2D();
  }

  @Get('cubo-3d')
  cubo3D() {
    return this.dwhService.cubo3D();
  }
}
