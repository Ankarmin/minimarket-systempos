import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  ParseIntPipe,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { VentaService } from './venta.service';
import { CreateVentaDto } from './dto/create-venta.dto';

@Controller('api/ventas')
export class VentaController {
  constructor(private readonly ventaService: VentaService) {}

  @Get()
  findAll(@Query('fecha') fecha?: string) {
    if (fecha) return this.ventaService.findByDate(fecha);
    return this.ventaService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const venta = await this.ventaService.findOne(id);
    if (!venta) throw new NotFoundException(`Venta #${id} no encontrada`);
    return venta;
  }

  @Post()
  async create(@Body() dto: CreateVentaDto) {
    try {
      return await this.ventaService.registrarVenta(dto);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(error.message);
    }
  }

  @Post(':id/anular')
  async anular(@Param('id', ParseIntPipe) id: number) {
    return this.ventaService.anularVenta(id);
  }
}
