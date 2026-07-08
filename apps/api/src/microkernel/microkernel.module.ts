import { Module } from '@nestjs/common';
import { PluginRegistry } from './plugin-registry.service';
import { MicrokernelController } from './microkernel.controller';
import { CsvExportPlugin } from './plugins/csv-export.plugin';
import { JsonExportPlugin } from './plugins/json-export.plugin';
import { SYSTEM_PLUGINS } from './plugin.interface';

/**
 * MICROKERNEL: ensambla el núcleo (PluginRegistry) con los plugins
 * descubiertos. Para añadir una capacidad nueva basta con crear una clase
 * que implemente `SystemPlugin`, declararla como provider y sumarla al
 * factory `SYSTEM_PLUGINS`. El núcleo permanece intacto.
 */
@Module({
  controllers: [MicrokernelController],
  providers: [
    CsvExportPlugin,
    JsonExportPlugin,
    {
      provide: SYSTEM_PLUGINS,
      useFactory: (csv: CsvExportPlugin, json: JsonExportPlugin) => [csv, json],
      inject: [CsvExportPlugin, JsonExportPlugin],
    },
    PluginRegistry,
  ],
  exports: [PluginRegistry],
})
export class MicrokernelModule {}
