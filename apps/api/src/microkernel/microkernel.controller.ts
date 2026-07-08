import { Controller, Get } from '@nestjs/common';
import { PluginRegistry } from './plugin-registry.service';

/**
 * Expone el estado del microkernel: qué plugins están cargados en runtime.
 */
@Controller('api/plugins')
export class MicrokernelController {
  constructor(private readonly registry: PluginRegistry) {}

  @Get()
  listar() {
    const plugins = this.registry.manifest();
    return {
      arquitectura: 'Microkernel + Plugins',
      total: plugins.length,
      plugins,
    };
  }
}
