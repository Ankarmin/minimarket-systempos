import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Producto } from './entities/producto.entity';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';

@Injectable()
export class ProductoService {
  constructor(
    @InjectRepository(Producto)
    private productoRepo: Repository<Producto>,
  ) {}

  findAll(): Promise<Producto[]> {
    return this.productoRepo.find({ where: { estado: true } });
  }

  findOne(id: number): Promise<Producto | null> {
    return this.productoRepo.findOneBy({ id, estado: true });
  }

  search(term: string): Promise<Producto[]> {
    return this.productoRepo.find({
      where: [
        { nombre: Like(`%${term}%`), estado: true },
        { categoria: Like(`%${term}%`), estado: true },
      ],
    });
  }

  create(dto: CreateProductoDto): Promise<Producto> {
    const producto = this.productoRepo.create(dto);
    return this.productoRepo.save(producto);
  }

  async update(id: number, dto: UpdateProductoDto): Promise<Producto | null> {
    const producto = await this.productoRepo.findOneBy({ id, estado: true });
    if (!producto) return null;
    Object.assign(producto, dto);
    return this.productoRepo.save(producto);
  }

  async remove(id: number): Promise<boolean> {
    const result = await this.productoRepo.update({ id, estado: true }, { estado: false });
    return (result.affected ?? 0) > 0;
  }
}
