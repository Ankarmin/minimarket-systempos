import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
  ArrayMinSize,
} from 'class-validator';

export class CreateDetalleVentaDto {
  @IsNumber()
  productoId: number;

  @IsNumber()
  @Min(1)
  cantidad: number;
}

export class CreateVentaDto {
  @IsNumber()
  sucursalId: number;

  @IsOptional()
  @IsNumber()
  clienteId?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => CreateDetalleVentaDto)
  detalles: CreateDetalleVentaDto[];
}
