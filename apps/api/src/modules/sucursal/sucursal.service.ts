import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sucursal } from './entities/sucursal.entity';
import { CreateSucursalDto } from './dto/create-sucursal.dto';
import { UpdateSucursalDto } from './dto/update-sucursal.dto';

@Injectable()
export class SucursalService {
  constructor(
    @InjectRepository(Sucursal)
    private sucursalRepo: Repository<Sucursal>,
  ) {}

  findAll(): Promise<Sucursal[]> {
    return this.sucursalRepo.find({ where: { activo: true } });
  }

  findOne(id: number): Promise<Sucursal | null> {
    return this.sucursalRepo.findOneBy({ id, activo: true });
  }

  create(dto: CreateSucursalDto): Promise<Sucursal> {
    const sucursal = this.sucursalRepo.create(dto);
    return this.sucursalRepo.save(sucursal);
  }

  async update(id: number, dto: UpdateSucursalDto): Promise<Sucursal | null> {
    const sucursal = await this.sucursalRepo.findOneBy({ id, activo: true });
    if (!sucursal) return null;
    Object.assign(sucursal, dto);
    return this.sucursalRepo.save(sucursal);
  }

  async remove(id: number): Promise<boolean> {
    const result = await this.sucursalRepo.update({ id, activo: true }, { activo: false });
    return (result.affected ?? 0) > 0;
  }
}
