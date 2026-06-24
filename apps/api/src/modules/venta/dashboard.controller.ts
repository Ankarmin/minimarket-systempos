import { Controller, Get } from '@nestjs/common';
import { VentaService } from '../venta/venta.service';

@Controller('api/dashboard')
export class DashboardController {
  constructor(private readonly ventaService: VentaService) {}

  @Get('kpis')
  getKpis() {
    return this.ventaService.getDashboardKpis();
  }
}
