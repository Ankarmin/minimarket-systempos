import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class CreateSucursalDto {
  @IsString()
  @MaxLength(200)
  nombre: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  direccion?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
