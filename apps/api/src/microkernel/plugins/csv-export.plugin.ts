import { Injectable } from '@nestjs/common';
import { ExportPlugin } from '../plugin.interface';

/**
 * PLUGIN: exportación a CSV.
 * Capacidad enchufable al microkernel — el núcleo no sabe qué es CSV.
 */
@Injectable()
export class CsvExportPlugin implements ExportPlugin {
  readonly id = 'export-csv';
  readonly name = 'Exportador CSV';
  readonly version = '1.0.0';
  readonly kind = 'export' as const;
  readonly description = 'Serializa reportes del DWH a formato CSV (RFC 4180).';
  readonly extension = 'csv';
  readonly mimeType = 'text/csv';

  serialize(rows: Record<string, unknown>[]): string {
    if (rows.length === 0) return '';
    const headers = Object.keys(rows[0]);
    const escape = (value: unknown): string => {
      const s = value === null || value === undefined ? '' : String(value);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = [
      headers.join(','),
      ...rows.map((row) => headers.map((h) => escape(row[h])).join(',')),
    ];
    return lines.join('\r\n');
  }
}
