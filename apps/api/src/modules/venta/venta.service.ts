import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Venta } from './entities/venta.entity';
import { DetalleVenta } from './entities/detalle-venta.entity';
import { Producto } from '../producto/entities/producto.entity';
import { Sucursal } from '../sucursal/entities/sucursal.entity';
import { CreateVentaDto } from './dto/create-venta.dto';

@Injectable()
export class VentaService {
  private readonly IGV_RATE = 0.18;

  constructor(
    @InjectRepository(Venta)
    private ventaRepo: Repository<Venta>,
    private dataSource: DataSource,
  ) {}

  findAll(): Promise<Venta[]> {
    return this.ventaRepo.find({
      where: { estado: true },
      relations: ['detalles', 'sucursal', 'cliente'],
      order: { fecha: 'DESC' },
    });
  }

  findOne(id: number): Promise<Venta | null> {
    return this.ventaRepo.findOne({
      where: { id },
      relations: ['detalles', 'sucursal', 'cliente'],
    });
  }

  findByDate(fecha: string): Promise<Venta[]> {
    return this.ventaRepo.find({
      where: { estado: true },
      relations: ['detalles', 'sucursal', 'cliente'],
      order: { fecha: 'DESC' },
    });
  }

  async registrarVenta(dto: CreateVentaDto): Promise<Venta> {
    return this.dataSource.transaction(async (manager) => {
      const sucursal = await manager.findOneBy(Sucursal, {
        id: dto.sucursalId,
        activo: true,
      });
      if (!sucursal) {
        throw new BadRequestException('Sucursal no encontrada o inactiva');
      }

      if (dto.clienteId) {
        const cliente = await manager.findOneBy(Sucursal, { id: dto.clienteId });
        if (!cliente) {
          throw new BadRequestException('Cliente no encontrado');
        }
      }

      let subtotal = 0;

      for (const linea of dto.detalles) {
        const producto = await manager.findOneBy(Producto, {
          id: linea.productoId,
          estado: true,
        });
        if (!producto) {
          throw new BadRequestException(
            `Producto ID ${linea.productoId} no encontrado`,
          );
        }
        if (producto.stock < linea.cantidad) {
          throw new BadRequestException(
            `Stock insuficiente para "${producto.nombre}". Disponible: ${producto.stock}`,
          );
        }
        subtotal += linea.cantidad * Number(producto.precio);
      }

      const subtotalRounded = +subtotal.toFixed(2);
      const igv = +(subtotalRounded * this.IGV_RATE).toFixed(2);
      const total = +(subtotalRounded + igv).toFixed(2);

      const savedVenta = await manager.getRepository(Venta).save({
        sucursalId: dto.sucursalId,
        clienteId: dto.clienteId ?? undefined,
        fecha: new Date(),
        subtotal: subtotalRounded,
        igv,
        total,
        estado: true,
      });

      for (const linea of dto.detalles) {
        const producto = await manager.findOneByOrFail(Producto, {
          id: linea.productoId,
        });
        const precioUnitario = Number(producto.precio);
        const lineaSubtotal = +(linea.cantidad * precioUnitario).toFixed(2);

        await manager.insert(DetalleVenta, {
          ventaId: savedVenta.id,
          productoId: linea.productoId,
          cantidad: linea.cantidad,
          precioUnitario,
          subtotal: lineaSubtotal,
          estado: true,
        });

        await manager.decrement(
          Producto,
          { id: linea.productoId },
          'stock',
          linea.cantidad,
        );
      }

      return manager.findOneOrFail(Venta, {
        where: { id: savedVenta.id },
        relations: ['detalles', 'sucursal', 'cliente'],
      });
    });
  }

  async anularVenta(id: number): Promise<Venta> {
    return this.dataSource.transaction(async (manager) => {
      const venta = await manager.findOne(Venta, {
        where: { id },
        relations: ['detalles'],
      });

      if (!venta) {
        throw new NotFoundException(`Venta #${id} no encontrada`);
      }
      if (!venta.estado) {
        throw new BadRequestException('La venta ya está anulada');
      }

      for (const detalle of venta.detalles) {
        await manager.increment(
          Producto,
          { id: detalle.productoId },
          'stock',
          detalle.cantidad,
        );
      }

      venta.estado = false;
      await manager.save(venta);

      await manager.update(
        DetalleVenta,
        { ventaId: id },
        { estado: false },
      );

      return manager.findOneOrFail(Venta, {
        where: { id },
        relations: ['detalles', 'sucursal', 'cliente'],
      });
    });
  }

  async getDashboardKpis(): Promise<{
    ventasHoy: number;
    ingresosHoy: number;
    totalProductos: number;
    totalClientes: number;
  }> {
    const hoy = new Date().toISOString().slice(0, 10);

    const ventasHoy = await this.ventaRepo
      .createQueryBuilder('v')
      .where('v.estado = :estado', { estado: true })
      .andWhere('DATE(v.fecha) = :fecha', { fecha: hoy })
      .getCount();

    const ingresosResult = await this.ventaRepo
      .createQueryBuilder('v')
      .select('COALESCE(SUM(v.total), 0)', 'total')
      .where('v.estado = :estado', { estado: true })
      .andWhere('DATE(v.fecha) = :fecha', { fecha: hoy })
      .getRawOne();

    const totalProductos = await this.dataSource
      .getRepository(Producto)
      .count({ where: { estado: true } });

    const totalClientes = await this.dataSource
      .getRepository('clientes')
      .count();

    return {
      ventasHoy,
      ingresosHoy: +(ingresosResult?.total ?? 0),
      totalProductos,
      totalClientes,
    };
  }
}
