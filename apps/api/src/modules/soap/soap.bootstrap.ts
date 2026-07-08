import { Logger } from '@nestjs/common';
import * as soap from 'soap';
import { SoapService } from './soap.service';
import { MINIMARKET_WSDL } from './minimarket.wsdl';

/**
 * Registra el web service SOAP sobre la instancia Express **antes** de que
 * NestFactory monte su router. Así la ruta SOAP tiene prioridad y no la
 * intercepta el "not found" de Nest.
 *
 * - Endpoint SOAP:  POST http://localhost:3001/soap/minimarket
 * - Contrato WSDL:  GET  http://localhost:3001/soap/minimarket?wsdl
 *
 * Los handlers resuelven `SoapService` de forma perezosa (`getService`)
 * porque el contenedor de Nest todavía no existe en el momento del registro.
 */
export function registerSoap(
  expressApp: unknown,
  getService: () => SoapService,
): void {
  const serviceObject = {
    MiniMarketService: {
      MiniMarketPort: {
        ListarProductos: (args: { categoria?: string }) =>
          getService().listarProductos(args),
        ObtenerProducto: (args: { id: number | string }) =>
          getService().obtenerProducto(args),
        CalcularIgv: (args: { subtotal: number | string }) =>
          getService().calcularIgv(args),
        ConsultarStock: (args: { productoId: number | string }) =>
          getService().consultarStock(args),
      },
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  soap.listen(expressApp as any, '/soap/minimarket', serviceObject, MINIMARKET_WSDL);
  new Logger('SoapWebService').log(
    'Web service SOAP montado en /soap/minimarket (WSDL en ?wsdl)',
  );
}
