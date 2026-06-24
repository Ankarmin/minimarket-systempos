import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { SucursalService } from './sucursal.service';
import { CreateSucursalDto } from './dto/create-sucursal.dto';
import { UpdateSucursalDto } from './dto/update-sucursal.dto';

@Controller('api/sucursales')
export class SucursalController {
  constructor(private readonly sucursalService: SucursalService) {}

  @Get()
  findAll() {
    return this.sucursalService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const sucursal = await this.sucursalService.findOne(id);
    if (!sucursal) throw new NotFoundException(`Sucursal #${id} no encontrada`);
    return sucursal;
  }

  @Post()
  create(@Body() dto: CreateSucursalDto) {
    return this.sucursalService.create(dto);
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSucursalDto) {
    const sucursal = await this.sucursalService.update(id, dto);
    if (!sucursal) throw new NotFoundException(`Sucursal #${id} no encontrada`);
    return sucursal;
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const deleted = await this.sucursalService.remove(id);
    if (!deleted) throw new NotFoundException(`Sucursal #${id} no encontrada`);
    return { message: `Sucursal #${id} eliminada` };
  }
}
