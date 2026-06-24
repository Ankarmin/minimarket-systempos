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
import { ClienteService } from './cliente.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Controller('api/clientes')
export class ClienteController {
  constructor(private readonly clienteService: ClienteService) {}

  @Get()
  findAll(@Query('search') search?: string) {
    if (search) return this.clienteService.search(search);
    return this.clienteService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const cliente = await this.clienteService.findOne(id);
    if (!cliente) throw new NotFoundException(`Cliente #${id} no encontrado`);
    return cliente;
  }

  @Post()
  create(@Body() dto: CreateClienteDto) {
    return this.clienteService.create(dto);
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateClienteDto) {
    const cliente = await this.clienteService.update(id, dto);
    if (!cliente) throw new NotFoundException(`Cliente #${id} no encontrado`);
    return cliente;
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const deleted = await this.clienteService.remove(id);
    if (!deleted) throw new NotFoundException(`Cliente #${id} no encontrado`);
    return { message: `Cliente #${id} eliminado` };
  }
}
