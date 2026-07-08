# Guía de instalación asistida por IA

Este documento contiene un **prompt listo para copiar y pegar** a un asistente de IA
(como **Claude Code**) que te guiará en la instalación y configuración completa del
proyecto **MiniMarket SystemPOS** desde cero, **incluso si no tienes Docker ni SoapUI
instalados**.

## ¿Para quién es?

Para alguien que:

- Acaba de recibir/clonar este proyecto.
- **No tiene Docker Desktop** instalado.
- **No tiene SoapUI** instalado.
- Quiere levantar la base de datos, la aplicación y probar el web service SOAP,
  guiado paso a paso.

## Cómo usarlo

1. Instala un asistente de IA con acceso a terminal en tu equipo. Recomendado:
   **Claude Code** (`npm install -g @anthropic-ai/claude-code`, luego ejecuta `claude`
   dentro de la carpeta del proyecto).
2. Abre el asistente **dentro de la carpeta del proyecto** (`minimarket-systempos/`).
3. **Copia todo el bloque del prompt de abajo** y pégalo como tu primer mensaje.
4. Sigue las instrucciones que te dé la IA, confirmando cada paso.

> 💡 En **Windows**, `docker` a veces no aparece en el PATH de Git Bash pero sí en
> **PowerShell**. Si la IA dice que "docker no se encuentra", pídele que use PowerShell.

---

## 📋 Prompt (copia todo lo que está entre las líneas)

---

Actúa como mi guía técnico paso a paso. Estoy configurando el proyecto **"MiniMarket
SystemPOS"** (un punto de venta con arquitectura MVC en N capas) en mi computadora y
**tengo poca experiencia** con estas herramientas. **No tengo instalado Docker Desktop
ni SoapUI.** Ve despacio, en orden, y **espera mi confirmación antes de cada paso**.

### Contexto del proyecto (para que sepas con qué trabajas)

- Es un **monorepo** con **pnpm + Turbo**. Backend **NestJS** en `apps/api` (puerto
  **3001**) y frontend **Next.js** en `apps/web` (puerto **3000**).
- La base de datos es **PostgreSQL 17 en Docker**, definida en `docker-compose.yml`,
  con **3 servicios**:
  - `postgres-primary` — base principal, puerto **5434**.
  - `postgres-replica` — réplica de solo lectura (mirror), puerto **5435**.
  - `ftp` — servidor FTP para reportes, puerto **21**.
- Los **datos de ejemplo** (seed) están en `apps/api/init/init.sql`: tablas OLTP, el
  Data Warehouse (schema `dwh`) y procedimientos **PL/pgSQL**. Se cargan solos la
  primera vez que se levanta Docker.
- Credenciales de la BD: usuario **`minimarket`**, contraseña **`minimarket_dev`**,
  base **`minimarket_db`**.
- El backend expone **dos web services**: una **API REST** en `/api/*` y un **web
  service SOAP** en `http://localhost:3001/soap/minimarket` (WSDL en
  `http://localhost:3001/soap/minimarket?wsdl`). Operaciones SOAP: `ListarProductos`,
  `ObtenerProducto`, `CalcularIgv`, `ConsultarStock`.

### Lo que necesito que hagas, EN ESTE ORDEN

**1. Verificar requisitos.** Revisa si tengo instalados **Node.js (>= 18)**, **pnpm
(>= 9)**, **Git** y **Docker**. Dime cuáles faltan. Para lo que falte, guíame para
instalarlo (dame enlaces oficiales y los pasos según mi sistema operativo).

**2. Instalar Docker Desktop.** Como no lo tengo, guíame para descargarlo e instalarlo
(enlace oficial + pasos). Luego ayúdame a **verificar que el motor esté corriendo** con
`docker version` y `docker ps`. No sigas hasta que Docker responda.

**3. Preparar el proyecto.** En la carpeta del proyecto, instala las dependencias con
`pnpm install`. Avísame si hay errores y cómo resolverlos.

**4. Subir la base de datos a Docker.** Con Docker ya corriendo, levanta la BD con
`pnpm db:up` (equivale a `docker compose up -d`). Luego:
   - Verifica que los **3 contenedores** estén arriba y que `minimarket-db` esté
     **`healthy`**.
   - La réplica clona al primario automáticamente; **si se reinicia en bucle**, revisa
     sus logs (`docker logs minimarket-db-mirror`) y ayúdame a solucionarlo.
   - Confirma que el **seed cargó** consultando, por ejemplo, la tabla `productos`
     (deberían ser **45**):
     `docker exec minimarket-db psql -U minimarket -d minimarket_db -c "SELECT COUNT(*) FROM productos;"`

**5. Arrancar la aplicación.** Ejecuta `pnpm dev` para levantar la API (**:3001**) y el
frontend (**:3000**). Verifica que ambos respondan:
   - API: `GET http://localhost:3001/api/dashboard/kpis`
   - POS: abre `http://localhost:3000` en el navegador.

**6. Configurar y probar el web service SOAP.**
   - **a.** Verifica que el **WSDL** responda: abre en el navegador
     `http://localhost:3001/soap/minimarket?wsdl` (debe mostrar XML).
   - **b.** Guíame para **descargar e instalar SoapUI Open Source** (gratis) desde
     **soapui.org**, con los pasos para mi sistema operativo.
   - **c.** Explícame cómo crear un **"New SOAP Project"** en SoapUI pegando la URL del
     WSDL, y cómo **probar la operación `CalcularIgv`** con `subtotal = 100`
     (debe devolver `igv = 18` y `total = 118`).
   - **d.** Si algo falla (puerto ocupado, WSDL no carga, error de conexión), ayúdame a
     diagnosticarlo y arreglarlo.

### Reglas de trabajo

- **Ve paso a paso** y **espera mi "ok"** antes de avanzar al siguiente.
- Antes de cada comando, dime en una línea **qué hace** y **qué debería ver si sale
  bien**.
- Si un comando debo ejecutarlo **yo manualmente** (instaladores, logins, cosas
  interactivas), márcalo claramente como "ejecuta esto tú".
- Si aparece un error, explícame **la causa y la solución en lenguaje sencillo**.
- En Windows, si `docker` no se encuentra en la terminal, usa **PowerShell**.

---

## Después de instalar

Una vez todo funcione, para el día a día:

```bash
pnpm db:up   # levanta la base de datos (Docker)
pnpm dev     # levanta API (:3001) + frontend (:3000)
pnpm db:down # detiene los contenedores (los datos persisten)
```

- **POS:** http://localhost:3000
- **API REST:** http://localhost:3001/api
- **Web service SOAP (WSDL):** http://localhost:3001/soap/minimarket?wsdl
