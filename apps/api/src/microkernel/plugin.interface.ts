/**
 * Contrato base del MICROKERNEL.
 *
 * El microkernel (núcleo mínimo) sólo conoce esta interfaz; no conoce
 * ninguna implementación concreta. Las capacidades del sistema se agregan
 * como PLUGINS que implementan este contrato y se registran en el
 * `PluginRegistry` en tiempo de arranque, sin modificar el núcleo.
 */
export interface SystemPlugin {
  /** Identificador único y estable del plugin (usado para resolverlo). */
  readonly id: string;
  /** Nombre legible. */
  readonly name: string;
  /** Versión del plugin (independiente del core). */
  readonly version: string;
  /** Categoría de extensión que implementa este plugin. */
  readonly kind: PluginKind;
  /** Descripción corta de la capacidad que aporta. */
  readonly description: string;
}

export type PluginKind = 'export';

/**
 * Plugin de EXPORTACIÓN: convierte un conjunto de filas (por ejemplo, un
 * reporte del Data Warehouse) a un formato serializado concreto.
 * Cada formato (CSV, JSON, ...) es un plugin distinto e intercambiable.
 */
export interface ExportPlugin extends SystemPlugin {
  readonly kind: 'export';
  /** Extensión de archivo (sin punto), p. ej. "csv". */
  readonly extension: string;
  /** MIME type asociado. */
  readonly mimeType: string;
  /** Serializa las filas al formato del plugin. */
  serialize(rows: Record<string, unknown>[]): string;
}

/** Token de inyección donde se recolectan TODOS los plugins descubiertos. */
export const SYSTEM_PLUGINS = Symbol('SYSTEM_PLUGINS');
