import { Injectable } from '@nestjs/common';
import { ExportPlugin } from '../plugin.interface';

/**
 * PLUGIN: exportación a JSON.
 * Segunda implementación intercambiable del mismo contrato `ExportPlugin`.
 */
@Injectable()
export class JsonExportPlugin implements ExportPlugin {
  readonly id = 'export-json';
  readonly name = 'Exportador JSON';
  readonly version = '1.0.0';
  readonly kind = 'export' as const;
  readonly description = 'Serializa reportes del DWH a JSON indentado.';
  readonly extension = 'json';
  readonly mimeType = 'application/json';

  serialize(rows: Record<string, unknown>[]): string {
    return JSON.stringify(rows, null, 2);
  }
}
