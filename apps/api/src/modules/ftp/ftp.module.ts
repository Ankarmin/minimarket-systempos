import { Module } from '@nestjs/common';
import { FtpService } from './ftp.service';
import { FtpController } from './ftp.controller';
import { DwhModule } from '../dwh/dwh.module';
import { MicrokernelModule } from '../../microkernel/microkernel.module';

/**
 * Capa FTP: depende del DWH (origen de datos) y del microkernel
 * (plugins de exportación) para producir y transferir los archivos.
 */
@Module({
  imports: [DwhModule, MicrokernelModule],
  controllers: [FtpController],
  providers: [FtpService],
})
export class FtpModule {}
