import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { ProductoService } from './producto.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';

@Controller('api/productos')
export class ProductoController {
  constructor(private readonly productoService: ProductoService) {}

  @Get()
  findAll(@Query('search') search?: string) {
    if (search) return this.productoService.search(search);
    return this.productoService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const producto = await this.productoService.findOne(id);
    if (!producto) throw new NotFoundException(`Producto #${id} no encontrado`);
    return producto;
  }

  @Post()
  create(@Body() dto: CreateProductoDto) {
    return this.productoService.create(dto);
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductoDto) {
    const producto = await this.productoService.update(id, dto);
    if (!producto) throw new NotFoundException(`Producto #${id} no encontrado`);
    return producto;
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const deleted = await this.productoService.remove(id);
    if (!deleted) throw new NotFoundException(`Producto #${id} no encontrado`);
    return { message: `Producto #${id} eliminado` };
  }
}
