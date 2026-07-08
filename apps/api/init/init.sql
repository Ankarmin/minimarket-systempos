-- ============================================================
-- MiniMarket SystemPOS — Seed Data Completo
-- ============================================================

-- ============================================================
-- SUCURSALES (8)
-- ============================================================
CREATE TABLE IF NOT EXISTS sucursales (
    id_sucursal SERIAL PRIMARY KEY,
    nombre      VARCHAR(200) NOT NULL,
    direccion   VARCHAR(300),
    activo      BOOLEAN NOT NULL DEFAULT TRUE
);

INSERT INTO sucursales (id_sucursal, nombre, direccion) VALUES
  (1,  'Lima Centro',      'Av. Abancay 1234, Cercado de Lima')
, (2,  'Lima Norte',       'Av. Universitaria 5678, Los Olivos')
, (3,  'Lima Este',        'Jr. Las Flores 901, Ate Vitarte')
, (4,  'Arequipa',         'Calle Mercaderes 345, Cercado')
, (5,  'Trujillo',         'Av. España 678, Centro Histórico')
, (6,  'Cusco',            'Av. El Sol 890, Wanchaq')
, (7,  'Piura',            'Jr. Lima 234, Castilla')
, (8,  'Chiclayo',         'Av. Balta 456, José Leonardo Ortiz')
ON CONFLICT (id_sucursal) DO NOTHING;

-- ============================================================
-- PRODUCTOS (45)
-- ============================================================
CREATE TABLE IF NOT EXISTS productos (
    id        SERIAL PRIMARY KEY,
    nombre    VARCHAR(200) NOT NULL,
    precio    DECIMAL(10,2) NOT NULL CHECK (precio >= 0),
    stock     INTEGER NOT NULL CHECK (stock >= 0),
    categoria VARCHAR(100) DEFAULT '',
    estado    BOOLEAN NOT NULL DEFAULT TRUE
);

INSERT INTO productos (id, nombre, precio, stock, categoria) VALUES
-- Abarrotes
  (1,  'Arroz Extra 1kg',               4.50, 150, 'Abarrotes')
, (2,  'Arroz Integral 1kg',            5.20, 80,  'Abarrotes')
, (3,  'Azúcar Rubia 1kg',              3.80, 200, 'Abarrotes')
, (4,  'Azúcar Blanca 1kg',             4.00, 170, 'Abarrotes')
, (5,  'Aceite Vegetal 1L',             9.90, 95,  'Abarrotes')
, (6,  'Aceite de Oliva 500ml',         18.50, 30, 'Abarrotes')
, (7,  'Sal Yodada 1kg',                1.20, 300, 'Abarrotes')
, (8,  'Harina de Trigo 1kg',           3.50, 140, 'Abarrotes')
, (9,  'Fideos Spaghetti 500g',         3.20, 180, 'Abarrotes')
, (10, 'Fideos Tallarín 500g',          3.20, 160, 'Abarrotes')
, (11, 'Lentejas 500g',                 4.80, 70,  'Abarrotes')
, (12, 'Frejol Canario 500g',           5.50, 60,  'Abarrotes')
, (13, 'Café Instantáneo 200g',         8.90, 55,  'Abarrotes')
, (14, 'Café Molido 250g',              7.50, 40,  'Abarrotes')
, (15, 'Té Filtrante x100un',           6.90, 75,  'Abarrotes')

-- Lácteos y Huevos
, (16, 'Leche Evaporada 400g',          4.20, 220, 'Lácteos')
, (17, 'Leche Fresca 1L',               5.50, 90,  'Lácteos')
, (18, 'Yogurt Natural 1L',             7.80, 50,  'Lácteos')
, (19, 'Queso Fresco 400g',             12.00, 35, 'Lácteos')
, (20, 'Mantequilla con Sal 200g',      8.50, 60,  'Lácteos')
, (21, 'Huevos x15un',                  8.90, 100, 'Lácteos')

-- Bebidas
, (22, 'Gaseosa Cola 1.5L',             7.50, 120, 'Bebidas')
, (23, 'Gaseosa Naranja 1.5L',          7.50, 110, 'Bebidas')
, (24, 'Agua Mineral 1L',               2.50, 250, 'Bebidas')
, (25, 'Agua Mineral 2.5L',             4.50, 180, 'Bebidas')
, (26, 'Jugo de Naranja 1L',            6.90, 65,  'Bebidas')
, (27, 'Cerveza Rubia Lata 355ml',      5.50, 200, 'Bebidas')
, (28, 'Bebida Energizante 500ml',      8.00, 70,  'Bebidas')

-- Panadería
, (29, 'Pan de Molde Blanco',           6.90, 45,  'Panadería')
, (30, 'Pan de Molde Integral',          7.50, 35,  'Panadería')
, (31, 'Galletas de Soda x6paq',        3.20, 130, 'Panadería')

-- Limpieza
, (32, 'Detergente en Polvo 780g',      12.50, 50,  'Limpieza')
, (33, 'Lavavajilla Líquido 500ml',     6.80, 85,  'Limpieza')
, (34, 'Desinfectante 1L',              9.90, 60,  'Limpieza')
, (35, 'Papel Higiénico x4rollos',      7.50, 140, 'Limpieza')
, (36, 'Servilletas x100un',            3.90, 110, 'Limpieza')

-- Conservas y Enlatados
, (37, 'Atún en Aceite 170g',           5.50, 95,  'Conservas')
, (38, 'Sardina en Tomate 425g',        6.20, 55,  'Conservas')
, (39, 'Durazno en Almíbar 820g',       8.90, 40,  'Conservas')
, (40, 'Leche Condensada 400g',         6.50, 70,  'Conservas')

-- Cuidado Personal
, (41, 'Jabón de Tocador x3un',         4.50, 160, 'Cuidado Personal')
, (42, 'Shampoo 400ml',                 12.90, 45, 'Cuidado Personal')
, (43, 'Pasta Dental 120g',             5.80, 80,  'Cuidado Personal')
, (44, 'Desodorante Roll-On 50ml',      11.50, 55, 'Cuidado Personal')

-- Snacks y Golosinas
, (45, 'Chocolate con Leche 100g',      4.90, 100, 'Golosinas')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- CLIENTES (15)
-- ============================================================
CREATE TABLE IF NOT EXISTS clientes (
    id       SERIAL PRIMARY KEY,
    nombre   VARCHAR(200) NOT NULL,
    dni      VARCHAR(20) NOT NULL UNIQUE,
    telefono VARCHAR(20) DEFAULT '',
    email    VARCHAR(200) DEFAULT '',
    estado   BOOLEAN NOT NULL DEFAULT TRUE
);

INSERT INTO clientes (id, nombre, dni, telefono, email) VALUES
  (1,  'Cliente General',          '00000000', '',                '')
, (2,  'María López Huamán',       '71234567', '987654321',       'maria.lopez@email.com')
, (3,  'Juan Carlos Pérez Ríos',   '45678901', '912345678',       'juanc.perez@email.com')
, (4,  'Rosa Elena García Díaz',   '33445566', '998877665',       'rosa.garcia@email.com')
, (5,  'Luis Alberto Torres Vega', '55443322', '977566433',       'luis.torres@email.com')
, (6,  'Ana María Sánchez León',   '22334455', '966355422',       'ana.sanchez@email.com')
, (7,  'Pedro Pablo Quispe Nina',  '66778899', '955144311',       'pedro.quispe@email.com')
, (8,  'Carmen Rosa Flores Apaza', '44556677', '944033200',       'carmen.flores@email.com')
, (9,  'José Antonio Ramos Mora',  '88990011', '933922199',       'jose.ramos@email.com')
, (10, 'Gladys Mery Condori Tito', '99887766', '922811088',       'gladys.condori@email.com')
, (11, 'Miguel Ángel Castro Pino', '11223344', '911700977',       'miguel.castro@email.com')
, (12, 'Sofía Isabel Ruiz León',   '55667788', '900699866',       'sofia.ruiz@email.com')
, (13, 'Jorge Enrique Díaz Peréz', '99001122', '988766655',       'jorge.diaz@email.com')
, (14, 'Patricia Mery Luna Chávez','87654321', '977655544',       'patricia.luna@email.com')
, (15, 'Walter Hugo Arapa Mamani', '76543210', '966544433',       'walter.arapa@email.com')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- VENTAS Y DETALLES (25 ventas de muestra)
-- ============================================================
CREATE TABLE IF NOT EXISTS ventas (
    id          SERIAL PRIMARY KEY,
    cliente_id  INTEGER DEFAULT NULL,
    id_sucursal INTEGER NOT NULL DEFAULT 1,
    fecha       TIMESTAMP NOT NULL DEFAULT NOW(),
    subtotal    DECIMAL(10,2) NOT NULL,
    igv         DECIMAL(10,2) NOT NULL,
    total       DECIMAL(10,2) NOT NULL,
    estado      BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_ventas_sucursal FOREIGN KEY (id_sucursal) REFERENCES sucursales(id_sucursal)
);

CREATE TABLE IF NOT EXISTS detalle_ventas (
    id              SERIAL PRIMARY KEY,
    venta_id        INTEGER NOT NULL,
    producto_id     INTEGER NOT NULL,
    cantidad        INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal        DECIMAL(10,2) NOT NULL,
    estado          BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_detalle_ventas_venta FOREIGN KEY (venta_id) REFERENCES ventas(id),
    CONSTRAINT fk_detalle_ventas_producto FOREIGN KEY (producto_id) REFERENCES productos(id)
);

-- VENTA 1 — Lima Centro, Cliente María López
INSERT INTO ventas (id, cliente_id, id_sucursal, fecha, subtotal, igv, total, estado)
VALUES (1, 2, 1, '2026-06-20 09:15:00', 25.40, 4.57, 29.97, TRUE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
  (1, 1, 2, 4.50, 9.00)
, (1, 22, 1, 7.50, 7.50)
, (1, 16, 2, 4.20, 8.40)
ON CONFLICT DO NOTHING;

-- VENTA 2 — Lima Centro, Cliente General (anónimo)
INSERT INTO ventas (id, cliente_id, id_sucursal, fecha, subtotal, igv, total, estado)
VALUES (2, NULL, 1, '2026-06-20 10:30:00', 16.40, 2.95, 19.35, TRUE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
  (2, 29, 1, 6.90, 6.90)
, (2, 35, 1, 7.50, 7.50)
ON CONFLICT DO NOTHING;

-- VENTA 3 — Lima Norte, Juan Pérez
INSERT INTO ventas (id, cliente_id, id_sucursal, fecha, subtotal, igv, total, estado)
VALUES (3, 3, 2, '2026-06-20 11:45:00', 47.30, 8.51, 55.81, TRUE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
  (3, 5,  2, 9.90, 19.80)
, (3, 32, 1, 12.50, 12.50)
, (3, 19, 1, 12.00, 12.00)
, (3, 24, 2, 2.50, 5.00)
ON CONFLICT DO NOTHING;

-- VENTA 4 — Arequipa, Rosa García
INSERT INTO ventas (id, cliente_id, id_sucursal, fecha, subtotal, igv, total, estado)
VALUES (4, 4, 4, '2026-06-21 08:20:00', 32.50, 5.85, 38.35, TRUE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
  (4, 3,  3, 3.80, 11.40)
, (4, 13, 2, 8.90, 17.80)
, (4, 24, 1, 2.50, 2.50)
ON CONFLICT DO NOTHING;

-- VENTA 5 — Trujillo, Luis Torres
INSERT INTO ventas (id, cliente_id, id_sucursal, fecha, subtotal, igv, total, estado)
VALUES (5, 5, 5, '2026-06-21 09:10:00', 18.90, 3.40, 22.30, TRUE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
  (5, 9,  3, 3.20, 9.60)
, (5, 37, 1, 5.50, 5.50)
, (5, 7,  2, 1.20, 2.40)
ON CONFLICT DO NOTHING;

-- VENTA 6 — Lima Este, Cliente General
INSERT INTO ventas (id, cliente_id, id_sucursal, fecha, subtotal, igv, total, estado)
VALUES (6, NULL, 3, '2026-06-21 12:30:00', 12.40, 2.23, 14.63, TRUE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
  (6, 21, 1, 8.90, 8.90)
, (6, 31, 1, 3.20, 3.20)
ON CONFLICT DO NOTHING;

-- VENTA 7 — Lima Centro, Ana Sánchez
INSERT INTO ventas (id, cliente_id, id_sucursal, fecha, subtotal, igv, total, estado)
VALUES (7, 6, 1, '2026-06-21 14:00:00', 56.80, 10.22, 67.02, TRUE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
  (7, 1,  4, 4.50, 18.00)
, (7, 17, 2, 5.50, 11.00)
, (7, 32, 1, 12.50, 12.50)
, (7, 42, 1, 12.90, 12.90)
, (7, 24, 1, 2.50, 2.50)
ON CONFLICT DO NOTHING;

-- VENTA 8 — Cusco, Pedro Quispe
INSERT INTO ventas (id, cliente_id, id_sucursal, fecha, subtotal, igv, total, estado)
VALUES (8, 7, 6, '2026-06-21 15:20:00', 22.70, 4.09, 26.79, TRUE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
  (8, 2,  2, 5.20, 10.40)
, (8, 11, 1, 4.80,  4.80)
, (8, 41, 1, 4.50,  4.50)
ON CONFLICT DO NOTHING;

-- VENTA 9 — Piura, Carmen Flores
INSERT INTO ventas (id, cliente_id, id_sucursal, fecha, subtotal, igv, total, estado)
VALUES (9, 8, 7, '2026-06-21 16:45:00', 15.30, 2.75, 18.05, TRUE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
  (9, 9,  2, 3.20,  6.40)
, (9, 25, 2, 4.50,  9.00)
, (9, 45, 1, 4.90,  4.90)
ON CONFLICT DO NOTHING;

-- VENTA 10 — Lima Norte, José Ramos
INSERT INTO ventas (id, cliente_id, id_sucursal, fecha, subtotal, igv, total, estado)
VALUES (10, 9, 2, '2026-06-22 07:45:00', 41.20, 7.42, 48.62, TRUE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
  (10, 1,  3, 4.50, 13.50)
, (10, 16, 4, 4.20, 16.80)
, (10, 35, 1, 7.50,  7.50)
, (10, 29, 1, 6.90,  6.90)
ON CONFLICT DO NOTHING;

-- VENTA 11 — Chiclayo, Cliente General
INSERT INTO ventas (id, cliente_id, id_sucursal, fecha, subtotal, igv, total, estado)
VALUES (11, NULL, 8, '2026-06-22 09:30:00', 8.90, 1.60, 10.50, TRUE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
  (11, 43, 1, 5.80, 5.80)
, (11, 31, 1, 3.20, 3.20)
ON CONFLICT DO NOTHING;

-- VENTA 12 — Lima Centro, Gladys Condori
INSERT INTO ventas (id, cliente_id, id_sucursal, fecha, subtotal, igv, total, estado)
VALUES (12, 10, 1, '2026-06-22 11:10:00', 35.60, 6.41, 42.01, TRUE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
  (12, 6,  1, 18.50, 18.50)
, (12, 37, 2,  5.50, 11.00)
, (12, 29, 1,  6.90,  6.90)
ON CONFLICT DO NOTHING;

-- VENTA 13 — Arequipa, Miguel Castro
INSERT INTO ventas (id, cliente_id, id_sucursal, fecha, subtotal, igv, total, estado)
VALUES (13, 11, 4, '2026-06-22 13:25:00', 28.50, 5.13, 33.63, TRUE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
  (13, 22, 3, 7.50, 22.50)
, (13, 21, 1, 8.90,  8.90)
ON CONFLICT DO NOTHING;

-- VENTA 14 — Lima Este, Sofía Ruiz — ANULADA
INSERT INTO ventas (id, cliente_id, id_sucursal, fecha, subtotal, igv, total, estado)
VALUES (14, 12, 3, '2026-06-22 15:00:00', 19.80, 3.56, 23.36, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
  (14, 32, 1, 12.50, 12.50)
, (14, 33, 1,  6.80,  6.80)
ON CONFLICT DO NOTHING;

-- VENTA 15 — Trujillo, Jorge Díaz
INSERT INTO ventas (id, cliente_id, id_sucursal, fecha, subtotal, igv, total, estado)
VALUES (15, 13, 5, '2026-06-23 08:40:00', 13.60, 2.45, 16.05, TRUE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
  (15, 3,  2, 3.80,  7.60)
, (15, 36, 1, 3.90,  3.90)
, (15, 24, 1, 2.50,  2.50)
ON CONFLICT DO NOTHING;

-- VENTA 16 — Lima Centro, Patricia Luna
INSERT INTO ventas (id, cliente_id, id_sucursal, fecha, subtotal, igv, total, estado)
VALUES (16, 14, 1, '2026-06-23 10:15:00', 52.40, 9.43, 61.83, TRUE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
  (16, 5,  2,  9.90, 19.80)
, (16, 42, 1, 12.90, 12.90)
, (16, 35, 2,  7.50, 15.00)
, (16, 45, 1,  4.90,  4.90)
ON CONFLICT DO NOTHING;

-- VENTA 17 — Cusco, Walter Arapa
INSERT INTO ventas (id, cliente_id, id_sucursal, fecha, subtotal, igv, total, estado)
VALUES (17, 15, 6, '2026-06-23 12:00:00', 14.20, 2.56, 16.76, TRUE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
  (17, 14, 1, 7.50, 7.50)
, (17, 40, 1, 6.50, 6.50)
ON CONFLICT DO NOTHING;

-- VENTA 18 — Lima Norte, María López
INSERT INTO ventas (id, cliente_id, id_sucursal, fecha, subtotal, igv, total, estado)
VALUES (18, 2, 2, '2026-06-23 14:30:00', 27.60, 4.97, 32.57, TRUE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
  (18, 4,  3, 4.00, 12.00)
, (18, 18, 2, 7.80, 15.60)
ON CONFLICT DO NOTHING;

-- VENTA 19 — Piura, Cliente General — ANULADA
INSERT INTO ventas (id, cliente_id, id_sucursal, fecha, subtotal, igv, total, estado)
VALUES (19, NULL, 7, '2026-06-23 16:10:00', 21.30, 3.83, 25.13, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
  (19, 27, 3, 5.50, 16.50)
, (19, 44, 1, 11.50, 11.50)
ON CONFLICT DO NOTHING;

-- VENTA 20 — Lima Centro, Juan Pérez
INSERT INTO ventas (id, cliente_id, id_sucursal, fecha, subtotal, igv, total, estado)
VALUES (20, 3, 1, '2026-06-24 08:20:00', 19.10, 3.44, 22.54, TRUE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
  (20, 1,  2, 4.50,  9.00)
, (20, 37, 1, 5.50,  5.50)
, (20, 31, 1, 3.20,  3.20)
ON CONFLICT DO NOTHING;

-- VENTA 21 — Arequipa, Rosa García
INSERT INTO ventas (id, cliente_id, id_sucursal, fecha, subtotal, igv, total, estado)
VALUES (21, 4, 4, '2026-06-24 09:45:00', 38.70, 6.97, 45.67, TRUE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
  (21, 12, 2,  5.50, 11.00)
, (21, 10, 3,  3.20,  9.60)
, (21, 26, 2,  6.90, 13.80)
, (21, 21, 1,  8.90,  8.90)
ON CONFLICT DO NOTHING;

-- VENTA 22 — Lima Este, Ana Sánchez
INSERT INTO ventas (id, cliente_id, id_sucursal, fecha, subtotal, igv, total, estado)
VALUES (22, 6, 3, '2026-06-24 11:30:00', 10.50, 1.89, 12.39, TRUE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
  (22, 8,  3, 3.50, 10.50)
ON CONFLICT DO NOTHING;

-- VENTA 23 — Lima Centro, Luis Torres
INSERT INTO ventas (id, cliente_id, id_sucursal, fecha, subtotal, igv, total, estado)
VALUES (23, 5, 1, '2026-06-24 13:15:00', 44.60, 8.03, 52.63, TRUE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
  (23, 6,  1, 18.50, 18.50)
, (23, 17, 2,  5.50, 11.00)
, (23, 32, 1, 12.50, 12.50)
, (23, 7,  2,  1.20,  2.40)
ON CONFLICT DO NOTHING;

-- VENTA 24 — Trujillo, Cliente General
INSERT INTO ventas (id, cliente_id, id_sucursal, fecha, subtotal, igv, total, estado)
VALUES (24, NULL, 5, '2026-06-24 15:40:00', 17.80, 3.20, 21.00, TRUE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
  (24, 23, 2,  7.50, 15.00)
, (24, 35, 1,  7.50,  7.50)
ON CONFLICT DO NOTHING;

-- VENTA 25 — Lima Centro, Carmen Flores
INSERT INTO ventas (id, cliente_id, id_sucursal, fecha, subtotal, igv, total, estado)
VALUES (25, 8, 1, '2026-06-24 17:00:00', 24.90, 4.48, 29.38, TRUE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
  (25, 34, 1,  9.90,  9.90)
, (25, 41, 2,  4.50,  9.00)
, (25, 39, 1,  8.90,  8.90)
ON CONFLICT DO NOTHING;

-- ============================================================
-- Actualizar secuencias después de inserts manuales
-- ============================================================
SELECT setval('sucursales_id_sucursal_seq', (SELECT COALESCE(MAX(id_sucursal), 1) FROM sucursales));
SELECT setval('productos_id_seq', (SELECT COALESCE(MAX(id), 1) FROM productos));
SELECT setval('clientes_id_seq', (SELECT COALESCE(MAX(id), 1) FROM clientes));
SELECT setval('ventas_id_seq', (SELECT COALESCE(MAX(id), 1) FROM ventas));
SELECT setval('detalle_ventas_id_seq', (SELECT COALESCE(MAX(id), 1) FROM detalle_ventas));

-- ============================================================
-- DATA WAREHOUSE — Star Schema (OLAP)
-- ============================================================
CREATE SCHEMA IF NOT EXISTS dwh;

CREATE TABLE IF NOT EXISTS dwh.dim_producto (
    id_producto     INTEGER PRIMARY KEY,
    nombre          VARCHAR(200) NOT NULL,
    categoria       VARCHAR(100),
    precio_unitario DECIMAL(10,2)
);

CREATE TABLE IF NOT EXISTS dwh.dim_cliente (
    id_cliente INTEGER PRIMARY KEY,
    nombre     VARCHAR(200) NOT NULL,
    tipo       VARCHAR(20) NOT NULL DEFAULT 'Registrado'
);

CREATE TABLE IF NOT EXISTS dwh.dim_tiempo (
    id_tiempo  INTEGER PRIMARY KEY,
    anio       INTEGER NOT NULL,
    mes        INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
    trimestre  INTEGER NOT NULL CHECK (trimestre BETWEEN 1 AND 4),
    nombre_mes VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS dwh.dim_sucursal (
    id_sucursal INTEGER PRIMARY KEY,
    nombre      VARCHAR(200) NOT NULL,
    region      VARCHAR(200)
);

CREATE TABLE IF NOT EXISTS dwh.fact_ventas (
    id_fact     SERIAL PRIMARY KEY,
    id_producto INTEGER NOT NULL,
    id_cliente  INTEGER NOT NULL,
    id_tiempo   INTEGER NOT NULL,
    id_sucursal INTEGER NOT NULL,
    cantidad    INTEGER NOT NULL DEFAULT 0,
    total_venta DECIMAL(12,2) NOT NULL DEFAULT 0,
    igv         DECIMAL(12,2) NOT NULL DEFAULT 0
);

-- ============================================================
-- LÓGICA EN EL LENGUAJE DEL DBMS (PL/pgSQL)
-- Reglas de negocio y ETL implementadas del lado del servidor
-- de base de datos, equivalente a PL/SQL (Oracle) o T-SQL (SQL Server).
-- ============================================================

-- IGV 18% calculado dentro del DBMS. IMMUTABLE => optimizable e indexable.
CREATE OR REPLACE FUNCTION fn_calcular_igv(p_subtotal NUMERIC)
RETURNS NUMERIC
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    RETURN ROUND(p_subtotal * 0.18, 2);
END;
$$;

-- Total (subtotal + IGV) calculado dentro del DBMS.
CREATE OR REPLACE FUNCTION fn_calcular_total(p_subtotal NUMERIC)
RETURNS NUMERIC
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    RETURN ROUND(p_subtotal + fn_calcular_igv(p_subtotal), 2);
END;
$$;

-- ------------------------------------------------------------
-- Procedimiento almacenado: PIPELINE ETL COMPLETO EN EL DBMS
-- Reemplaza/replica el EtlService (TypeScript) ejecutando las 6
-- etapas del ETL directamente en PostgreSQL. Se invoca con:
--     CALL dwh.sp_refrescar_dwh();
-- ------------------------------------------------------------
CREATE OR REPLACE PROCEDURE dwh.sp_refrescar_dwh()
LANGUAGE plpgsql
AS $$
DECLARE
    v_hechos INTEGER;
BEGIN
    -- 1. Limpiar tablas del DWH (respetando dependencias lógicas)
    DELETE FROM dwh.fact_ventas;
    DELETE FROM dwh.dim_tiempo;
    DELETE FROM dwh.dim_producto;
    DELETE FROM dwh.dim_cliente;
    DELETE FROM dwh.dim_sucursal;

    -- 2. dim_producto
    INSERT INTO dwh.dim_producto (id_producto, nombre, categoria, precio_unitario)
    SELECT id, nombre, categoria, precio FROM productos WHERE estado = TRUE;

    -- 3. dim_cliente (clasificación Anonimo / Registrado)
    INSERT INTO dwh.dim_cliente (id_cliente, nombre, tipo)
    SELECT id, nombre,
           CASE WHEN dni = '00000000' THEN 'Anonimo' ELSE 'Registrado' END
    FROM clientes WHERE estado = TRUE;

    -- 4. dim_sucursal
    INSERT INTO dwh.dim_sucursal (id_sucursal, nombre, region)
    SELECT id_sucursal, nombre, nombre FROM sucursales WHERE activo = TRUE;

    -- 5. dim_tiempo (derivada de las fechas de ventas activas, clave YYYYMM).
    -- Nombre de mes en español mediante arreglo (independiente del locale del motor).
    INSERT INTO dwh.dim_tiempo (id_tiempo, anio, mes, trimestre, nombre_mes)
    SELECT DISTINCT
        EXTRACT(YEAR FROM fecha)::int * 100 + EXTRACT(MONTH FROM fecha)::int,
        EXTRACT(YEAR FROM fecha)::int,
        EXTRACT(MONTH FROM fecha)::int,
        CEIL(EXTRACT(MONTH FROM fecha) / 3.0)::int,
        (ARRAY['Enero','Febrero','Marzo','Abril','Mayo','Junio',
               'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
        )[EXTRACT(MONTH FROM fecha)::int]
    FROM ventas WHERE estado = TRUE;

    -- 6. fact_ventas (agregación de detalle_ventas + ventas, IGV vía función)
    INSERT INTO dwh.fact_ventas (id_producto, id_cliente, id_tiempo, id_sucursal, cantidad, total_venta, igv)
    SELECT
        dv.producto_id,
        COALESCE(v.cliente_id, 1),
        EXTRACT(YEAR FROM v.fecha)::int * 100 + EXTRACT(MONTH FROM v.fecha)::int,
        v.id_sucursal,
        SUM(dv.cantidad),
        SUM(dv.subtotal),
        fn_calcular_igv(SUM(dv.subtotal))
    FROM detalle_ventas dv
    JOIN ventas v ON v.id = dv.venta_id
    WHERE dv.estado = TRUE AND v.estado = TRUE
    GROUP BY dv.producto_id, v.cliente_id,
             EXTRACT(YEAR FROM v.fecha)::int * 100 + EXTRACT(MONTH FROM v.fecha)::int,
             v.id_sucursal;

    SELECT COUNT(*) INTO v_hechos FROM dwh.fact_ventas;
    RAISE NOTICE 'ETL DBMS completado: % hechos cargados en dwh.fact_ventas', v_hechos;
END;
$$;
