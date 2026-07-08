import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import {
  ExportPlugin,
  PluginKind,
  SystemPlugin,
  SYSTEM_PLUGINS,
} from './plugin.interface';

/**
 * PluginRegistry = NÚCLEO del microkernel.
 *
 * No contiene lógica de negocio: sólo descubre, registra y resuelve los
 * plugins inyectados a través del token `SYSTEM_PLUGINS`. Agregar una nueva
 * capacidad al sistema no requiere tocar este archivo, únicamente registrar
 * un nuevo proveedor de plugin en `MicrokernelModule`.
 */
@Injectable()
export class PluginRegistry implements OnModuleInit {
  private readonly logger = new Logger(PluginRegistry.name);
  private readonly plugins = new Map<string, SystemPlugin>();

  constructor(
    @Inject(SYSTEM_PLUGINS) private readonly discovered: SystemPlugin[],
  ) {}

  onModuleInit(): void {
    for (const plugin of this.discovered) {
      this.register(plugin);
    }
    this.logger.log(
      `Microkernel iniciado con ${this.plugins.size} plugin(s): ` +
        [...this.plugins.keys()].join(', '),
    );
  }

  register(plugin: SystemPlugin): void {
    if (this.plugins.has(plugin.id)) {
      throw new Error(`Plugin duplicado: ${plugin.id}`);
    }
    this.plugins.set(plugin.id, plugin);
  }

  all(): SystemPlugin[] {
    return [...this.plugins.values()];
  }

  byKind(kind: PluginKind): SystemPlugin[] {
    return this.all().filter((p) => p.kind === kind);
  }

  get(id: string): SystemPlugin {
    const plugin = this.plugins.get(id);
    if (!plugin) {
      throw new NotFoundException(`Plugin no encontrado: "${id}"`);
    }
    return plugin;
  }

  /** Resuelve un plugin de exportación por su id, validando la categoría. */
  getExporter(id: string): ExportPlugin {
    const plugin = this.get(id);
    if (plugin.kind !== 'export') {
      throw new NotFoundException(`El plugin "${id}" no es de exportación`);
    }
    return plugin as ExportPlugin;
  }

  /** Metadatos públicos de los plugins cargados (para exponer vía API). */
  manifest(): Array<
    Pick<SystemPlugin, 'id' | 'name' | 'version' | 'kind' | 'description'>
  > {
    return this.all().map(({ id, name, version, kind, description }) => ({
      id,
      name,
      version,
      kind,
      description,
    }));
  }
}
