const API_BASE = 'http://127.0.0.1:3001/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Error ${res.status}`);
  }
  return res.json();
}

// ---- Raw API types (decimal fields come as strings from PostgreSQL) ----

export interface ApiSucursal {
  id: number;
  nombre: string;
  direccion: string;
  activo: boolean;
}

export interface ApiProducto {
  id: number;
  nombre: string;
  precio: string;
  stock: number;
  categoria: string;
  estado: boolean;
}

export interface ApiCliente {
  id: number;
  nombre: string;
  dni: string;
  telefono: string;
  email: string;
  estado: boolean;
}

export interface ApiDetalleVenta {
  id: number;
  ventaId: number;
  productoId: number;
  cantidad: number;
  precioUnitario: string;
  subtotal: string;
  estado: boolean;
}

export interface ApiVenta {
  id: number;
  clienteId: number | null;
  sucursalId: number;
  fecha: string;
  subtotal: string;
  igv: string;
  total: string;
  estado: boolean;
  sucursal?: ApiSucursal;
  cliente?: ApiCliente;
  detalles?: ApiDetalleVenta[];
}

export interface ApiKpis {
  ventasHoy: number;
  ingresosHoy: string;
  totalProductos: number;
  totalClientes: number;
}

// ---- API methods ----

export const api = {
  // Dashboard
  getKpis: () => request<ApiKpis>('/dashboard/kpis'),

  // Sucursales
  getSucursales: () => request<ApiSucursal[]>('/sucursales'),

  // Productos
  getProductos: (search?: string) =>
    request<ApiProducto[]>(search ? `/productos?search=${encodeURIComponent(search)}` : '/productos'),

  createProducto: (data: { nombre: string; precio: number; stock: number; categoria: string }) =>
    request<ApiProducto>('/productos', { method: 'POST', body: JSON.stringify(data) }),

  updateProducto: (id: number, data: { nombre?: string; precio?: number; stock?: number; categoria?: string }) =>
    request<ApiProducto>(`/productos/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  deleteProducto: (id: number) =>
    request<void>(`/productos/${id}`, { method: 'DELETE' }),

  // Clientes
  getClientes: (search?: string) =>
    request<ApiCliente[]>(search ? `/clientes?search=${encodeURIComponent(search)}` : '/clientes'),

  createCliente: (data: { nombre: string; dni: string; telefono?: string; email?: string }) =>
    request<ApiCliente>('/clientes', { method: 'POST', body: JSON.stringify(data) }),

  updateCliente: (id: number, data: { nombre?: string; dni?: string; telefono?: string; email?: string }) =>
    request<ApiCliente>(`/clientes/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  deleteCliente: (id: number) =>
    request<void>(`/clientes/${id}`, { method: 'DELETE' }),

  // Ventas
  getVentas: (fecha?: string) =>
    request<ApiVenta[]>(fecha ? `/ventas?fecha=${encodeURIComponent(fecha)}` : '/ventas'),

  getVenta: (id: number) =>
    request<ApiVenta>(`/ventas/${id}`),

  createVenta: (data: { sucursalId: number; clienteId?: number; detalles: { productoId: number; cantidad: number }[] }) =>
    request<ApiVenta>('/ventas', { method: 'POST', body: JSON.stringify(data) }),

  anularVenta: (id: number) =>
    request<ApiVenta>(`/ventas/${id}/anular`, { method: 'POST' }),

  // Analytics / DWH
  getEtl: () => request<{ mensaje: string; etapas: string[] }>('/analytics/etl', { method: 'POST' }),

  // ETL ejecutado dentro del DBMS (procedimiento almacenado PL/pgSQL)
  getEtlDb: () =>
    request<{ mensaje: string; motor: string; hechos: number }>('/analytics/etl-db', { method: 'POST' }),

  // Microkernel — plugins cargados
  getPlugins: () =>
    request<{
      arquitectura: string;
      total: number;
      plugins: { id: string; name: string; version: string; kind: string; description: string }[];
    }>('/plugins'),

  // Capa FTP — exportar reporte del DWH y subirlo por FTP
  ftpBackup: (reporte: string, plugin: 'export-csv' | 'export-json' = 'export-csv') =>
    request<{ archivo: string; bytes: number; formato: string; ruta: string }>('/ftp/backup', {
      method: 'POST',
      body: JSON.stringify({ reporte, plugin }),
    }),

  ftpList: () =>
    request<{ nombre: string; tamano: number; fecha: string }[]>('/ftp/list'),

  getCubo2D: () =>
    request<{ productos: string[]; meses: string[]; mesesIdx: number[]; matrix: number[][]; formula: string; descripcion: string; totalVentas: string }>('/analytics/cubo-2d'),

  getCubo3D: () =>
    request<{ productos: string[]; meses: string[]; mesesIdx: number[]; cubicos: { sucursal: string; idSucursal: number; subtotal: string; matrix: number[][] }[]; formula: string; descripcion: string; totalVentas: string }>('/analytics/cubo-3d'),
};
