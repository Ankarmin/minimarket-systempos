# Sistema POS MiniMarket — Tercer Entregable

La aplicación evolucionó desde una arquitectura Cliente/Servidor Java + TCP + SQLite hacia un monorepo moderno con TypeScript, NestJS, Next.js, PostgreSQL y contenedores Docker. Se conservan todas las reglas de negocio originales (IGV 18%, transacciones, control de stock, anulación con reversión) y se extiende la parte analítica con un Data Warehouse en esquema estrella y cubos OLAP expuestos como endpoints REST JSON.

**Stack del Tercer Entregable:** TypeScript 5, NestJS 11, Next.js 16, TypeORM, PostgreSQL 17 (Docker), Tailwind CSS v4, shadcn/ui, pnpm + Turbo.

## Estructura del Monorepo

```
minimarket-systempos/
├── docker-compose.yml          ← PostgreSQL :5434
├── pnpm-workspace.yaml         ← apps/*
├── turbo.json                  ← build/dev orchestrator
├── apps/
│   ├── api/                    ← NestJS backend REST
│   │   ├── .env                ← DB_HOST, DB_PORT, DB_USER...
│   │   ├── init/init.sql       ← Seed data OLTP + DWH
│   │   └── src/
│   │       ├── main.ts         ← Entry point :3001, CORS, ValidationPipe
│   │       ├── app.module.ts   ← Root module (TypeORM + 5 módulos)
│   │       ├── config/database.config.ts
│   │       └── modules/
│   │           ├── sucursal/   ← CRUD REST
│   │           ├── producto/   ← CRUD REST + búsqueda
│   │           ├── cliente/    ← CRUD REST + búsqueda
│   │           ├── venta/      ← Registro POS + Anulación + KPIs
│   │           └── dwh/        ← ETL + OLAP Cubes
│   │               ├── entities/  (5 entidades DWH)
│   │               ├── etl.service.ts
│   │               ├── dwh.service.ts
│   │               └── dwh.controller.ts
│   └── web/                    ← Next.js frontend
│       ├── app/
│       │   ├── page.tsx        ← POS + Dashboard + Analytics
│       │   ├── layout.tsx      ← Server component, metadata
│       │   └── globals.css     ← Tema POS (45 colores)
│       ├── lib/api.ts          ← Cliente HTTP tipado (15 métodos)
│       ├── lib/utils.ts        ← cn() utility
│       ├── hooks/
│       └── components/ui/      ← 48 componentes shadcn/ui
```

## ¿Cómo ejecutar?

```bash
pnpm install          # instala dependencias del monorepo (una sola vez)
pnpm db:up            # levanta PostgreSQL :5434 con seed data
pnpm dev              # API :3001 + Frontend :3000 simultáneamente
pnpm build            # build de producción de ambos
pnpm db:down          # detiene PostgreSQL
```

## Arquitectura N-Capas

El monorepo implementa una arquitectura por capas desacoplada:

```
┌─────────────────────────┐
│  apps/web  (Next.js)    │  ← Capa Presentación
│  :3000                  │
│  - POS UI               │
│  - Dashboard            │
│  - Cubos OLAP visuales  │
└───────────┬─────────────┘
            │ REST JSON (fetch)
┌───────────▼─────────────┐
│  apps/api  (NestJS)     │  ← Capa Aplicación / Negocio
│  :3001                  │
│  Controllers (HTTP)     │
│  Services (reglas)      │
│  TypeORM (repositorios) │
└───────────┬─────────────┘
            │ SQL
┌───────────▼─────────────┐
│  PostgreSQL :5434       │  ← Capa Datos
│  public.*  (OLTP)       │
│  dwh.*     (OLAP)       │
└─────────────────────────┘
```

**12 endpoints REST:** `sucursales`, `productos`, `clientes`, `ventas` (registro + anulación), `dashboard/kpis`, `analytics/etl`, `ventas-por-mes`, `ventas-por-producto`, `ventas-por-sucursal`, `top-clientes`, `cubo-2d`, `cubo-3d`, `cross-tab`.

## Migración TCP → REST HTTP

El Segundo Entregable usaba sockets TCP con protocolo pipe-delimited (`OPERACION|ENTIDAD|dato1|dato2`). El Tercer Entregable reemplaza esto por una API REST JSON sobre HTTP.

| Segundo Entregable (Java) | Tercer Entregable (TypeScript) |
|---|---|
| `Socket / ServerSocket :9090` | Express HTTP :3001 |
| `PING` | `GET /api/dashboard/kpis` (health check implícito) |
| `LISTAR\|PRODUCTO` | `GET /api/productos?search=` |
| `CREAR\|PRODUCTO` | `POST /api/productos` |
| `REGISTRAR\|VENTA\|1\|2\|3:1;5:2` | `POST /api/ventas` con JSON `{ sucursalId, clienteId, detalles: [...] }` |
| `ANULAR\|VENTA` | `POST /api/ventas/:id/anular` |
| `HISTORIAL\|VENTA` | `GET /api/ventas?fecha=YYYY-MM-DD` |
| `AppServer` multi-thread (Java `Thread`) | NestJS request handlers (event loop + async) |
| `ClientHandler` por conexión | Controllers + Services con DI |
| `DatabaseManager` JDBC | TypeORM `DataSource.transaction()` |
| `synchronized registrarVenta()` | `dataSource.transaction(async manager => ...)` |
| Cliente Swing `MainWindow.java` | Next.js `page.tsx` (7 vistas: Dashboard, Productos, Clientes, Ventas, Historial, Analítica) |

Las reglas de negocio se mantienen idénticas: IGV 18% (`subtotal * 0.18`), redondeo a 2 decimales, validación de sucursal activa, validación de stock suficiente, COMMIT/ROLLBACK atómico, reversión de stock al anular venta.

## Base de Datos

La base SQLite `minimarket.db` del Segundo Entregable fue migrada a PostgreSQL 17 en contenedor Docker. Se ejecuta en el puerto `5434` (mapeado del `5432` interno).

**Esquema OLTP (`public.*`):**

| Tabla | Registros | Descripción |
|---|---|---|
| `sucursales` | 8 | Lima Centro, Lima Norte, Lima Este, Arequipa, Trujillo, Cusco, Piura, Chiclayo |
| `productos` | 45 | 8 categorías: Abarrotes, Lácteos, Bebidas, Panadería, Limpieza, Conservas, Cuidado Personal, Golosinas |
| `clientes` | 15 | 1 genérico ("00000000") + 14 con DNI, teléfono y email realistas |
| `ventas` | 25 | 23 activas + 2 anuladas, distribuidas en 5 días (20-24 Jun 2026), 8 sucursales |
| `detalle_ventas` | 71 | Líneas de cada venta con cantidades, precios históricos y subtotales |

Credenciales: `minimarket` / `minimarket_dev` / `minimarket_db`. Archivo `.env` en `apps/api/.env`.

## Data Warehouse

El DWH usa un esquema estrella en el schema PostgreSQL `dwh`. Se separa del OLTP para no impactar el rendimiento transaccional. Las tablas son:

| Tabla | Tipo | Contenido |
|---|---|---|
| `dim_producto` | Dimensión | id_producto, nombre, categoria, precio_unitario |
| `dim_cliente` | Dimensión | id_cliente, nombre, tipo ('Anonimo' o 'Registrado') |
| `dim_tiempo` | Dimensión | id_tiempo (YYYYMM), anio, mes, trimestre, nombre_mes |
| `dim_sucursal` | Dimensión | id_sucursal, nombre, region |
| `fact_ventas` | Hecho | id_producto, id_cliente, id_tiempo, id_sucursal, cantidad, total_venta, igv (67 hechos cargados) |

**ETL Pipeline:** `POST /api/analytics/etl` ejecuta el proceso completo en 6 etapas:
1. Limpia tablas DWH
2. Carga `dim_producto` desde `productos`
3. Carga `dim_cliente` desde `clientes` (clasifica 'Anonimo'/'Registrado')
4. Carga `dim_sucursal` desde `sucursales`
5. Genera `dim_tiempo` desde las fechas de ventas (YYYYMM)
6. Agrega y carga `fact_ventas` con JOINs de `detalle_ventas` + `ventas`

Equivalencia con el Segundo Entregable:

| Segundo Entregable | Tercer Entregable |
|---|---|
| `GenerarDatawareHouse.java` | `EtlService.ts` — `POST /api/analytics/etl` |
| SQLite → SQLite (misma máquina) | PostgreSQL OLTP → PostgreSQL DWH (mismo contenedor, schema `dwh`) |
| `metadata.properties` (dim1=10, dim2=12, dim3=3 fijos) | Dimensiones dinámicas desde los datos reales del DWH |

## Cubos OLAP (ventas_2d y ventas_3d)

Los cubos binarios `.ctab` del Segundo Entregable (creados con `CreateCrossTab.java` + `RandomAccessFile`) fueron reemplazados por consultas SQL directas al DWH, expuestas como endpoints JSON.

**Cubo 2D — Producto × Mes** (`GET /api/analytics/cubo-2d`):
- Matriz: filas = productos (45), columnas = meses (dinámico, actualmente 1)
- Cada celda = `SUM(total_venta)` para ese producto en ese mes
- Incluye totales por fila, por columna y total general
- Fórmula documentada: `offset2D = ((i-1) * N + (j-1)) * W`

**Cubo 3D — Producto × Mes × Sucursal** (`GET /api/analytics/cubo-3d`):
- Cubo anidado: por cada sucursal (8), una matriz producto × mes
- Cada celda = `SUM(total_venta)` filtrado por sucursal
- Totales individuales por sucursal + total general
- Fórmula documentada: `offset3D = ((i1-1) * N * P + (i2-1) * P + (i3-1)) * W`

Visualización: desde el POS, sidebar → **"Analítica"** → se muestran ambas matrices como tablas HTML estilizadas con celdas coloreadas, totales y las fórmulas de localización.

Equivalencia:

| Segundo Entregable | Tercer Entregable |
|---|---|
| `CreateCrossTab.java` + `ventas_2d.ctab` | `GET /api/analytics/cubo-2d` (JSON) |
| `CreateCrossTab.java` + `ventas_3d.ctab` | `GET /api/analytics/cubo-3d` (JSON) |
| `ViewCrossTab.java` (consola) | Vista "Analítica" en el POS (tablas HTML) |
| `Assign.txt` (simulación cluster) | No aplica — el DWH se consulta directamente |
| 10×12×3 fijo (metadata.properties) | Dimensiones dinámicas desde el contenido real del DWH |

## Entidades y Relaciones

```
┌──────────┐       ┌──────────┐       ┌───────────────┐       ┌──────────┐
│ Sucursal │──<────│  Venta   │──<────│ DetalleVenta  │──>────│ Producto │
└──────────┘       └──────────┘       └───────────────┘       └──────────┘
                        │
                    ┌───┘
                    ▼
               ┌──────────┐
               │ Cliente  │
               └──────────┘

OLAP (Star Schema):
                    ┌─────────────┐
        ┌──────────→│ dim_producto │
        │           └─────────────┘
        │           ┌─────────────┐
┌───────────┐       │ dim_cliente  │
│ FACT_VENTAS│──────→│              │
│  (67 rows) │      └─────────────┘
└───────────┘       ┌─────────────┐
        │           │ dim_tiempo   │
        ├──────────→│              │
        │           └─────────────┘
        │           ┌─────────────┐
        └──────────→│ dim_sucursal │
                    └─────────────┘
```

## API Completa (24 endpoints)

### Operacional
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/dashboard/kpis` | KPIs: ventas hoy, ingresos hoy, total productos, total clientes |
| `GET` | `/api/sucursales` | Listar sucursales activas |
| `POST` | `/api/sucursales` | Crear sucursal |
| `PATCH` | `/api/sucursales/:id` | Actualizar sucursal |
| `DELETE` | `/api/sucursales/:id` | Soft-delete sucursal |
| `GET` | `/api/productos?search=` | Listar/buscar productos |
| `POST` | `/api/productos` | Crear producto |
| `PATCH` | `/api/productos/:id` | Actualizar producto |
| `DELETE` | `/api/productos/:id` | Soft-delete producto |
| `GET` | `/api/clientes?search=` | Listar/buscar clientes |
| `POST` | `/api/clientes` | Crear cliente |
| `PATCH` | `/api/clientes/:id` | Actualizar cliente |
| `DELETE` | `/api/clientes/:id` | Soft-delete cliente |
| `GET` | `/api/ventas?fecha=` | Listar ventas, filtro por fecha |
| `GET` | `/api/ventas/:id` | Ver venta con detalles + relaciones |
| `POST` | `/api/ventas` | Registrar venta (transacción, IGV, descuento stock) |
| `POST` | `/api/ventas/:id/anular` | Anular venta (restaura stock) |

### Analítica — Data Warehouse
| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/analytics/etl` | Ejecutar pipeline ETL (6 etapas) |
| `GET` | `/api/analytics/ventas-por-mes` | Agregado por mes |
| `GET` | `/api/analytics/ventas-por-producto` | Top productos por venta |
| `GET` | `/api/analytics/ventas-por-sucursal` | Ventas por sucursal |
| `GET` | `/api/analytics/top-clientes?limit=` | Top clientes |
| `GET` | `/api/analytics/cubo-2d` | Cubo 2D (Producto × Mes) |
| `GET` | `/api/analytics/cubo-3d` | Cubo 3D (Producto × Mes × Sucursal) |
| `GET` | `/api/analytics/cross-tab` | Tabla cruzada producto × sucursal |

### Cubo 2D — Respuesta de ejemplo

```json
GET /api/analytics/cubo-2d
{
  "productos": ["Arroz Extra 1kg", "Azúcar Rubia 1kg", ...],
  "meses": ["Junio"],
  "mesesIdx": [6],
  "matrix": [
    [36.00],  // Arroz Extra 1kg
    [22.80],  // Azúcar Rubia 1kg
    ...
  ],
  "formula": "offset2D = ((i-1) * N + (j-1)) * W",
  "descripcion": "Cubo 2D: Producto × Mes (45×1), N=1, W=8 bytes",
  "totalVentas": "642.70"
}
```

### Cubo 3D — Respuesta de ejemplo

```json
GET /api/analytics/cubo-3d
{
  "productos": ["Arroz Extra 1kg", ...],
  "meses": ["Junio"],
  "mesesIdx": [6],
  "cubicos": [
    {
      "sucursal": "Lima Centro",
      "subtotal": "275.10",
      "matrix": [[36.00], [0.00], ...]
    },
    {
      "sucursal": "Lima Norte",
      "subtotal": "121.60",
      "matrix": [[0.00], ...]
    },
    ...
  ],
  "formula": "offset3D = ((i1-1) * N * P + (i2-1) * P + (i3-1)) * W",
  "descripcion": "Cubo 3D: Producto × Mes × Sucursal (45×1×8), N=1, P=8, W=8 bytes",
  "totalVentas": "642.70"
}
```

## Uso Recomendado

```bash
# 1. Instalar dependencias
pnpm install

# 2. Iniciar base de datos (Docker debe estar corriendo)
pnpm db:up

# 3. Iniciar API + Frontend en modo desarrollo
pnpm dev
```

- POS: http://localhost:3000
- API: http://localhost:3001
- Base de datos: `postgresql://minimarket:minimarket_dev@localhost:5434/minimarket_db`

### Ejecutar ETL y consultar cubos (una vez haya ventas registradas)

```powershell
# Ejecutar pipeline ETL
Invoke-RestMethod -Method POST http://127.0.0.1:3001/api/analytics/etl

# Ver cubo 2D
Invoke-RestMethod http://127.0.0.1:3001/api/analytics/cubo-2d

# Ver cubo 3D
Invoke-RestMethod http://127.0.0.1:3001/api/analytics/cubo-3d
```

O directamente desde el frontend: sidebar → **Analítica** → cubos visualizados como matrices HTML.

### Requisitos

- Node.js >= 18
- pnpm >= 9 (`corepack enable && corepack prepare pnpm@9 --activate`)
- Docker Desktop (para PostgreSQL)
- Puerto 3000 libre (frontend)
- Puerto 3001 libre (API)
- Puerto 5434 libre (PostgreSQL)
