import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Cliente } from './entities/cliente.entity';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClienteService {
  constructor(
    @InjectRepository(Cliente)
    private clienteRepo: Repository<Cliente>,
  ) {}

  findAll(): Promise<Cliente[]> {
    return this.clienteRepo.find({ where: { estado: true } });
  }

  findOne(id: number): Promise<Cliente | null> {
    return this.clienteRepo.findOneBy({ id, estado: true });
  }

  search(term: string): Promise<Cliente[]> {
    return this.clienteRepo.find({
      where: [
        { nombre: Like(`%${term}%`), estado: true },
        { dni: Like(`%${term}%`), estado: true },
      ],
    });
  }

  create(dto: CreateClienteDto): Promise<Cliente> {
    const cliente = this.clienteRepo.create(dto);
    return this.clienteRepo.save(cliente);
  }

  async update(id: number, dto: UpdateClienteDto): Promise<Cliente | null> {
    const cliente = await this.clienteRepo.findOneBy({ id, estado: true });
    if (!cliente) return null;
    Object.assign(cliente, dto);
    return this.clienteRepo.save(cliente);
  }

  async remove(id: number): Promise<boolean> {
    const result = await this.clienteRepo.update({ id, estado: true }, { estado: false });
    return (result.affected ?? 0) > 0;
  }
}
