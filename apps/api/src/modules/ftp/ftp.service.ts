import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Client } from 'basic-ftp';
import { Readable } from 'stream';
import { DwhService } from '../dwh/dwh.service';
import { PluginRegistry } from '../../microkernel/plugin-registry.service';

/** Reportes del DWH que pueden exportarse y transferirse por FTP. */
const REPORTES = {
  'ventas-por-mes': 'ventasPorMes',
  'ventas-por-producto': 'ventasPorProducto',
  'ventas-por-sucursal': 'ventasPorSucursal',
  'top-clientes': 'topClientes',
} as const;

type ReporteId = keyof typeof REPORTES;

/**
 * CAPA FTP: transferencia de archivos a un servidor remoto.
 *
 * Toma un reporte del Data Warehouse, lo serializa mediante un PLUGIN de
 * exportación del microkernel (CSV/JSON) y sube el archivo resultante al
 * servidor FTP definido por variables de entorno.
 */
@Injectable()
export class FtpService {
  private readonly logger = new Logger(FtpService.name);

  constructor(
    private readonly dwh: DwhService,
    private readonly plugins: PluginRegistry,
  ) {}

  private accessOptions() {
    return {
      host: process.env.FTP_HOST ?? 'localhost',
      port: parseInt(process.env.FTP_PORT ?? '21', 10),
      user: process.env.FTP_USER ?? 'minimarket',
      password: process.env.FTP_PASSWORD ?? 'minimarket_ftp',
      secure: process.env.FTP_SECURE === 'true',
    };
  }

  private async withClient<T>(fn: (client: Client) => Promise<T>): Promise<T> {
    const client = new Client(15000);
    try {
      await client.access(this.accessOptions());
      return await fn(client);
    } catch (err) {
      this.logger.error(`Error FTP: ${(err as Error).message}`);
      throw new BadRequestException(
        `No se pudo conectar/operar con el servidor FTP: ${(err as Error).message}`,
      );
    } finally {
      client.close();
    }
  }

  private async obtenerFilas(reporte: ReporteId): Promise<Record<string, unknown>[]> {
    const metodo = REPORTES[reporte];
    const rows = (await (this.dwh as unknown as Record<string, () => Promise<unknown>>)[
      metodo
    ]()) as Record<string, unknown>[];
    return rows;
  }

  /**
   * Genera el reporte, lo serializa con el plugin indicado y lo sube por FTP.
   */
  async subirReporte(
    reporte: ReporteId,
    pluginId = 'export-csv',
  ): Promise<{ archivo: string; bytes: number; formato: string; ruta: string }> {
    if (!REPORTES[reporte]) {
      throw new BadRequestException(
        `Reporte inválido "${reporte}". Válidos: ${Object.keys(REPORTES).join(', ')}`,
      );
    }

    const exporter = this.plugins.getExporter(pluginId);
    const rows = await this.obtenerFilas(reporte);
    const contenido = exporter.serialize(rows);
    const buffer = Buffer.from(contenido, 'utf-8');

    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    const carpeta = process.env.FTP_REMOTE_DIR ?? 'reportes';
    const archivo = `${reporte}_${timestamp}.${exporter.extension}`;

    await this.withClient(async (client) => {
      await client.ensureDir(carpeta);
      await client.uploadFrom(Readable.from(buffer), archivo);
    });

    this.logger.log(`Reporte "${archivo}" (${buffer.length} bytes) subido por FTP`);
    return {
      archivo,
      bytes: buffer.length,
      formato: exporter.name,
      ruta: `${carpeta}/${archivo}`,
    };
  }

  /** Lista los archivos disponibles en el directorio remoto de reportes. */
  async listar(): Promise<Array<{ nombre: string; tamano: number; fecha: string }>> {
    const carpeta = process.env.FTP_REMOTE_DIR ?? 'reportes';
    return this.withClient(async (client) => {
      await client.ensureDir(carpeta);
      const list = await client.list();
      return list.map((f) => ({
        nombre: f.name,
        tamano: f.size,
        fecha: f.modifiedAt?.toISOString() ?? '',
      }));
    });
  }
}
