import { Module } from '@nestjs/common';
import { SoapService } from './soap.service';

/**
 * Módulo del web service SOAP. Provee `SoapService` para que el bootstrap
 * (`attachSoap`) lo resuelva desde el contenedor de Nest y lo conecte al
 * servidor SOAP montado sobre Express.
 */
@Module({
  providers: [SoapService],
  exports: [SoapService],
})
export class SoapModule {}
