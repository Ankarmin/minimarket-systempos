import { Body, Controller, Get, Post } from '@nestjs/common';
import { FtpService } from './ftp.service';

@Controller('api/ftp')
export class FtpController {
  constructor(private readonly ftpService: FtpService) {}

  /**
   * Exporta un reporte del DWH y lo sube al servidor FTP remoto.
   * Body: { reporte: 'ventas-por-producto', plugin?: 'export-csv' | 'export-json' }
   */
  @Post('backup')
  backup(
    @Body('reporte') reporte: string,
    @Body('plugin') plugin?: string,
  ) {
    return this.ftpService.subirReporte(reporte as never, plugin);
  }

  @Get('list')
  list() {
    return this.ftpService.listar();
  }
}
