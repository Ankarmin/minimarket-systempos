import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

interface ProductoRow {
  id: number;
  nombre: string;
  precio: string;
  stock: number;
  categoria: string;
}

/**
 * Lógica del web service SOAP. Cada método corresponde a una operación del
 * WSDL (`minimarket.wsdl.ts`). Recibe los argumentos ya parseados por la
 * librería `soap` y devuelve el objeto de respuesta.
 */
@Injectable()
export class SoapService {
  private readonly IGV_RATE = 0.18;

  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  private mapProducto(r: ProductoRow) {
    return {
      id: r.id,
      nombre: r.nombre,
      precio: Number(r.precio),
      stock: r.stock,
      categoria: r.categoria,
    };
  }

  async listarProductos(args: { categoria?: string }) {
    const filtro = args?.categoria ? `%${args.categoria}%` : null;
    const rows: ProductoRow[] = await this.ds.query(
      `SELECT id, nombre, precio, stock, categoria
       FROM productos
       WHERE estado = true AND ($1::text IS NULL OR categoria ILIKE $1)
       ORDER BY id`,
      [filtro],
    );
    return { producto: rows.map((r) => this.mapProducto(r)) };
  }

  async obtenerProducto(args: { id: number | string }) {
    const id = parseInt(String(args?.id), 10);
    const rows: ProductoRow[] = await this.ds.query(
      `SELECT id, nombre, precio, stock, categoria FROM productos WHERE id = $1`,
      [id],
    );
    if (rows.length === 0) {
      return { encontrado: false };
    }
    return { encontrado: true, producto: this.mapProducto(rows[0]) };
  }

  calcularIgv(args: { subtotal: number | string }) {
    const subtotal = Number(args?.subtotal ?? 0);
    const igv = Math.round(subtotal * this.IGV_RATE * 100) / 100;
    const total = Math.round((subtotal + igv) * 100) / 100;
    return { subtotal, igv, total };
  }

  async consultarStock(args: { productoId: number | string }) {
    const id = parseInt(String(args?.productoId), 10);
    const rows: { id: number; nombre: string; stock: number }[] =
      await this.ds.query(
        `SELECT id, nombre, stock FROM productos WHERE id = $1`,
        [id],
      );
    if (rows.length === 0) {
      return { productoId: id, nombre: 'NO ENCONTRADO', stock: 0, disponible: false };
    }
    const r = rows[0];
    return { productoId: r.id, nombre: r.nombre, stock: r.stock, disponible: r.stock > 0 };
  }
}
