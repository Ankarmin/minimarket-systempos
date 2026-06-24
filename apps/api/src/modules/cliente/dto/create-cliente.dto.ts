import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class CreateClienteDto {
  @IsString()
  @MaxLength(200)
  nombre: string;

  @IsString()
  @MaxLength(20)
  dni: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefono?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  email?: string;

  @IsOptional()
  @IsBoolean()
  estado?: boolean;
}
