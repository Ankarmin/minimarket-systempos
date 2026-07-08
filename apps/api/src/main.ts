import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { registerSoap } from './modules/soap/soap.bootstrap';
import { SoapService } from './modules/soap/soap.service';

async function bootstrap() {
  // Instancia Express propia para montar el web service SOAP con prioridad
  // sobre el router de Nest (evita el 404 del "not found" de Nest).
  const adapter = new ExpressAdapter();
  let soapService: SoapService;
  registerSoap(adapter.getInstance(), () => soapService);

  const app = await NestFactory.create(AppModule, adapter);

  app.enableCors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Ya existe el contenedor DI: se resuelve el servicio usado por SOAP.
  soapService = app.get(SoapService);

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
