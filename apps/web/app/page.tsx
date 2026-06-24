"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  api,
  type ApiProducto,
  type ApiCliente,
  type ApiSucursal,
  type ApiVenta,
  type ApiDetalleVenta,
} from "@/lib/api";

// ---------- Frontend types (decimals parsed to number) ----------
type Producto = { id: number; nombre: string; precio: number; stock: number; categoria: string };
type Cliente = { id: number; nombre: string; dni: string; telefono: string; email: string };
type Sucursal = { id: number; nombre: string };
type DetalleVenta = { id: number; productoId: number; producto: string; cantidad: number; precio: number };
type Venta = {
  id: number; fecha: string; clienteId: number; sucursalId: number;
  subtotal: number; igv: number; total: number; estado: "Activa" | "Anulada";
  detalles: DetalleVenta[];
};

const fmtDateTime = (d: Date) => {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};
const fmtDateShort = (d: Date) => {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
};
const fmtDateDisplay = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};
const money = (n: number) => `S/ ${Number(n).toFixed(2)}`;

// ---- Normalizers (API decimal strings → number) ----
const toProducto = (p: ApiProducto): Producto => ({ ...p, precio: +p.precio });
const toCliente = (c: ApiCliente): Cliente => c;
const toSucursal = (s: ApiSucursal): Sucursal => ({ id: s.id, nombre: s.nombre });
const toDetalle = (d: ApiDetalleVenta, productos: Producto[]): DetalleVenta => ({
  id: d.id,
  productoId: d.productoId,
  producto: productos.find((p) => p.id === d.productoId)?.nombre ?? `ID#${d.productoId}`,
  cantidad: d.cantidad,
  precio: +d.precioUnitario,
});
const toVenta = (v: ApiVenta, productos: Producto[]): Venta => ({
  id: v.id,
  fecha: fmtDateDisplay(v.fecha),
  clienteId: v.clienteId ?? 0,
  sucursalId: v.sucursalId,
  subtotal: +v.subtotal,
  igv: +v.igv,
  total: +v.total,
  estado: v.estado ? "Activa" : "Anulada",
  detalles: (v.detalles ?? []).map((d) => toDetalle(d, productos)),
});

// ---- App ----
export default function App() {
  const [view, setView] = useState<ViewKey>("dashboard");
  const [productos, setProductos] = useState<Producto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [prod, cli, suc, ven] = await Promise.all([
        api.getProductos(),
        api.getClientes(),
        api.getSucursales(),
        api.getVentas(),
      ]);
      const prods = prod.map(toProducto);
      setProductos(prods);
      setClientes(cli.map(toCliente));
      setSucursales(suc.map(toSucursal));
      setVentas(ven.map((v) => toVenta(v, prods)));
    } catch (e) {
      console.error("Error cargando datos:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-bg text-muted text-[14px]">
        Conectando con el servidor...
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg text-text">
      <Sidebar view={view} setView={setView} />
      <main className="flex-1 overflow-auto p-6">
        {view === "dashboard" && <Dashboard />}
        {view === "productos" && <ProductosView productos={productos} onRefresh={loadData} />}
        {view === "clientes" && <ClientesView clientes={clientes} onRefresh={loadData} />}
        {view === "ventas" && (
          <VentasView productos={productos} clientes={clientes} sucursales={sucursales} onRefresh={loadData} />
        )}
        {view === "historial" && (
          <HistorialView ventas={ventas} onRefresh={loadData} />
        )}
        {view === "analytics" && <AnalyticsView />}
      </main>
    </div>
  );
}

// ---------- Sidebar ----------
const navItems: { key: ViewKey; label: string; icon: string }[] = [
  { key: "dashboard", label: "Dashboard", icon: "\u25A6" },
  { key: "productos", label: "Productos", icon: "\uD83D\uDCE6" },
  { key: "clientes", label: "Clientes", icon: "\uD83D\uDC65" },
  { key: "ventas", label: "Ventas", icon: "\uD83D\uDED2" },
  { key: "historial", label: "Historial", icon: "\uD83E\uDDFE" },
  { key: "analytics", label: "Analítica", icon: "\uD83D\uDCCA" },
];

type ViewKey = "dashboard" | "productos" | "clientes" | "ventas" | "historial" | "analytics";

function Sidebar({ view, setView }: { view: ViewKey; setView: (v: ViewKey) => void }) {
  return (
    <aside className="flex h-full w-[215px] shrink-0 flex-col bg-sidebar text-sidebar-fg">
      <div className="px-5 pt-5 pb-4">
        <div className="text-[20px] font-bold leading-tight text-white">MiniMarket</div>
        <div className="text-[11px] text-sidebar-fg/90">Sistema POS - Thin Client</div>
      </div>
      <div className="mx-4 border-t border-white/10" />
      <nav className="flex-1 px-3 py-3">
        {navItems.map((it) => {
          const active = view === it.key;
          return (
            <button
              key={it.key}
              onClick={() => setView(it.key)}
              className={[
                "mb-1 flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-left text-[14px] transition-colors",
                active ? "bg-accent text-white" : "text-sidebar-fg hover:bg-sidebar-hover",
              ].join(" ")}
            >
              <span className="w-5 text-center">{it.icon}</span>
              <span>{it.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="mx-4 border-t border-white/10" />
      <div className="px-5 py-4 text-[11px] text-sidebar-fg/70">v3.0.0</div>
    </aside>
  );
}

// ---------- Reusable UI ----------
function PageTitle({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <h1 className="text-[22px] font-bold text-text">{children}</h1>
      {right}
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-lg border border-border bg-surface p-4 ${className}`}>{children}</div>;
}

type BtnTone = "accent" | "success" | "danger" | "muted" | "purple";
function Btn({
  children, onClick, tone = "muted", type = "button", disabled,
}: { children: React.ReactNode; onClick?: () => void; tone?: BtnTone; type?: "button" | "submit"; disabled?: boolean }) {
  const tones: Record<BtnTone, string> = {
    accent: "bg-accent hover:brightness-110", success: "bg-success hover:brightness-110",
    danger: "bg-danger hover:brightness-110", muted: "bg-muted hover:brightness-110", purple: "bg-purple hover:brightness-110",
  };
  return (
    <button type={type} disabled={disabled} onClick={onClick}
      className={["inline-flex cursor-pointer items-center justify-center rounded-lg px-[18px] py-2 text-[12px] font-bold text-white transition active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50", tones[tone]].join(" ")}>
      {children}
    </button>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`h-8 w-full rounded-md border border-border bg-white px-3 text-[13px] outline-none focus:border-accent ${props.className ?? ""}`} />;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="mb-2 text-[13px] font-bold text-muted">{children}</div>;
}

function Status({ msg, tone }: { msg: string; tone?: "success" | "danger" | "warning" }) {
  if (!msg) return <div className="h-4" />;
  const color = tone === "success" ? "text-success" : tone === "danger" ? "text-danger" : tone === "warning" ? "text-warning" : "text-muted";
  return <div className={`text-[11px] ${color}`}>{msg}</div>;
}

function Table<T>({
  columns, data, onRowClick, selectedId, getId, emptyMsg = "Sin datos",
}: {
  columns: { key: string; header: string; width?: string; align?: "left" | "right" | "center"; render: (row: T) => React.ReactNode }[];
  data: T[];
  onRowClick?: (row: T) => void;
  selectedId?: number | null;
  getId?: (row: T) => number;
  emptyMsg?: string;
}) {
  return (
    <div className="overflow-auto rounded-md border border-border">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr className="bg-row-alt text-left text-[12px] font-bold text-muted">
            {columns.map((c) => (
              <th key={c.key} style={{ width: c.width }}
                className={`px-3 py-2 ${c.align === "right" ? "text-right" : c.align === "center" ? "text-center" : ""}`}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 && (
            <tr><td colSpan={columns.length} className="px-3 py-6 text-center text-muted">{emptyMsg}</td></tr>
          )}
          {data.map((row, i) => {
            const id = getId ? getId(row) : i;
            const selected = selectedId != null && id === selectedId;
            return (
              <tr key={id} onClick={() => onRowClick?.(row)}
                className={["cursor-pointer border-t border-border", selected ? "bg-row-sel" : i % 2 === 1 ? "bg-row-alt" : "bg-white", "hover:bg-row-sel/60"].join(" ")}
                style={{ height: 30 }}>
                {columns.map((c) => (
                  <td key={c.key} className={`px-3 py-1.5 ${c.align === "right" ? "text-right" : c.align === "center" ? "text-center" : ""}`}>
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12px] text-muted">{label}</span>
      {children}
    </label>
  );
}

function Row({ label, value, big }: { label: string; value: string; big?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className={big ? "text-[16px] font-bold" : "text-[13px] font-bold"}>{label}</span>
      <span className={big ? "text-[16px] font-bold text-success" : "text-[13px] font-bold"}>{value}</span>
    </div>
  );
}

// ---------- Dashboard ----------
function Dashboard() {
  const [kpis, setKpis] = useState<{ ventasHoy: number; ingresosHoy: number; totalProductos: number; totalClientes: number } | null>(null);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const displayDate = useMemo(() => fmtDateShort(new Date()), []);

  useEffect(() => {
    (async () => {
      try {
        const [k, v] = await Promise.all([api.getKpis(), api.getVentas()]);
        setKpis({ ...k, ingresosHoy: +k.ingresosHoy });
        const prods = (await api.getProductos()).map(toProducto);
        setVentas(v.map((x) => toVenta(x, prods)));
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const kpiItems = kpis
    ? [
        { label: "VENTAS HOY", value: String(kpis.ventasHoy), color: "var(--accent)" },
        { label: "INGRESOS HOY", value: money(kpis.ingresosHoy), color: "var(--success)" },
        { label: "PRODUCTOS", value: String(kpis.totalProductos), color: "var(--purple)" },
        { label: "CLIENTES", value: String(kpis.totalClientes), color: "var(--orange)" },
      ]
    : [];

  return (
    <div>
      <PageTitle right={<span className="text-[13px] text-muted">{displayDate}</span>}>Dashboard</PageTitle>
      {kpiItems.length > 0 && (
        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpiItems.map((k) => (
            <div key={k.label} className="overflow-hidden rounded-lg border border-border bg-surface">
              <div className="flex">
                <div style={{ background: k.color }} className="w-1 shrink-0" />
                <div className="flex-1 p-4">
                  <div className="text-[10px] font-bold tracking-wide text-muted">{k.label}</div>
                  <div className="mt-2 text-[26px] font-bold" style={{ color: k.color }}>{k.value}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <Card>
        <SectionLabel>Últimas Ventas</SectionLabel>
        <Table<Venta>
          getId={(r) => r.id}
          columns={[
            { key: "id", header: "ID", width: "60px", render: (r) => r.id },
            { key: "fecha", header: "Fecha", render: (r) => r.fecha },
            { key: "cli", header: "Cliente", width: "80px", render: (r) => r.clienteId ? `C#${r.clienteId}` : "-" },
            { key: "suc", header: "Sucursal", render: (r) => `S#${r.sucursalId}` },
            { key: "sub", header: "Subtotal", align: "right", render: (r) => money(r.subtotal) },
            { key: "igv", header: "IGV", align: "right", render: (r) => money(r.igv) },
            { key: "tot", header: "Total", align: "right", render: (r) => money(r.total) },
            { key: "est", header: "Estado", render: (r) => (
              <span className={r.estado === "Activa" ? "text-success" : "text-danger"}>{r.estado}</span>
            )},
          ]}
          data={ventas.slice().reverse()}
        />
      </Card>
    </div>
  );
}

// ---------- Productos ----------
function ProductosView({ productos, onRefresh }: { productos: Producto[]; onRefresh: () => void }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("");
  const [sel, setSel] = useState<Producto | null>(null);
  const [form, setForm] = useState({ nombre: "", precio: "", stock: "", categoria: "" });
  const [status, setStatus] = useState<{ msg: string; tone?: "success" | "danger" | "warning" }>({ msg: "" });
  const [working, setWorking] = useState(false);

  useEffect(() => {
    if (sel) setForm({ nombre: sel.nombre, precio: String(sel.precio), stock: String(sel.stock), categoria: sel.categoria });
  }, [sel]);

  const data = useMemo(() => {
    const term = filter.trim().toLowerCase();
    if (!term) return productos;
    return productos.filter((p) => p.nombre.toLowerCase().includes(term) || p.categoria.toLowerCase().includes(term));
  }, [productos, filter]);

  const limpiar = () => { setSel(null); setForm({ nombre: "", precio: "", stock: "", categoria: "" }); setStatus({ msg: "" }); };

  const guardar = async () => {
    if (!form.nombre.trim() || form.nombre.includes("|")) return setStatus({ msg: "Nombre invalido.", tone: "danger" });
    const precio = Number(form.precio);
    const stock = Number(form.stock);
    if (!isFinite(precio) || precio < 0) return setStatus({ msg: "Precio invalido.", tone: "danger" });
    if (!Number.isInteger(stock) || stock < 0) return setStatus({ msg: "Stock invalido.", tone: "danger" });
    setWorking(true);
    try {
      if (sel) {
        await api.updateProducto(sel.id, { nombre: form.nombre, precio, stock, categoria: form.categoria });
        setStatus({ msg: `Producto #${sel.id} actualizado.`, tone: "success" });
      } else {
        await api.createProducto({ nombre: form.nombre, precio, stock, categoria: form.categoria });
        setStatus({ msg: "Producto creado.", tone: "success" });
      }
      onRefresh();
    } catch (e: any) {
      setStatus({ msg: e.message, tone: "danger" });
    } finally {
      setWorking(false);
    }
  };

  const eliminar = async () => {
    if (!sel) return setStatus({ msg: "Seleccione un producto.", tone: "warning" });
    if (!window.confirm(`¿Eliminar producto ID=${sel.id}?`)) return;
    setWorking(true);
    try {
      await api.deleteProducto(sel.id);
      setStatus({ msg: `Producto #${sel.id} eliminado.`, tone: "success" });
      onRefresh();
      limpiar();
    } catch (e: any) {
      setStatus({ msg: e.message, tone: "danger" });
    } finally {
      setWorking(false);
    }
  };

  return (
    <div>
      <PageTitle>Productos</PageTitle>
      <div className="mb-4 flex items-center gap-3">
        <span className="text-[13px] text-muted">Buscar:</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar..."
          className="h-8 w-[200px] rounded-md border border-border bg-white px-3 text-[13px] outline-none focus:border-accent" />
        <Btn tone="accent" onClick={() => setFilter(q)}>Buscar</Btn>
        <Btn tone="muted" onClick={() => { setQ(""); setFilter(""); }}>Todos</Btn>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <Card>
          <Table<Producto>
            getId={(r) => r.id} selectedId={sel?.id ?? null} onRowClick={(r) => setSel(r)}
            columns={[
              { key: "id", header: "ID", width: "55px", render: (r) => r.id },
              { key: "n", header: "Nombre", render: (r) => r.nombre },
              { key: "p", header: "Precio", width: "90px", align: "right", render: (r) => money(r.precio) },
              { key: "s", header: "Stock", width: "75px", align: "right", render: (r) => r.stock },
              { key: "c", header: "Categoria", render: (r) => r.categoria },
            ]}
            data={data}
          />
        </Card>
        <Card>
          <SectionLabel>Detalle del Producto</SectionLabel>
          <div className="space-y-3">
            <Field label="Nombre *"><Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></Field>
            <Field label="Precio *"><Input value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} /></Field>
            <Field label="Stock *"><Input value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></Field>
            <Field label="Categoria"><Input value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} /></Field>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Btn tone="muted" onClick={limpiar}>Nuevo</Btn>
            <Btn tone="success" disabled={working} onClick={guardar}>Guardar</Btn>
            <Btn tone="danger" disabled={working} onClick={eliminar}>Eliminar</Btn>
            <Btn tone="purple" onClick={() => setStatus({ msg: "Compactado.", tone: "success" })}>Compactar</Btn>
          </div>
          <div className="mt-3"><Status msg={status.msg} tone={status.tone} /></div>
        </Card>
      </div>
    </div>
  );
}

// ---------- Clientes ----------
function ClientesView({ clientes, onRefresh }: { clientes: Cliente[]; onRefresh: () => void }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("");
  const [sel, setSel] = useState<Cliente | null>(null);
  const [form, setForm] = useState({ nombre: "", dni: "", telefono: "", email: "" });
  const [status, setStatus] = useState<{ msg: string; tone?: "success" | "danger" | "warning" }>({ msg: "" });
  const [working, setWorking] = useState(false);

  useEffect(() => {
    if (sel) setForm({ nombre: sel.nombre, dni: sel.dni, telefono: sel.telefono, email: sel.email });
  }, [sel]);

  const data = useMemo(() => {
    const term = filter.trim().toLowerCase();
    if (!term) return clientes;
    return clientes.filter((c) => c.nombre.toLowerCase().includes(term) || c.dni.includes(term));
  }, [clientes, filter]);

  const limpiar = () => { setSel(null); setForm({ nombre: "", dni: "", telefono: "", email: "" }); setStatus({ msg: "" }); };

  const guardar = async () => {
    if (!form.nombre.trim() || form.nombre.includes("|")) return setStatus({ msg: "Nombre invalido.", tone: "danger" });
    if (!form.dni.trim() || form.dni.includes("|")) return setStatus({ msg: "DNI invalido.", tone: "danger" });
    setWorking(true);
    try {
      if (sel) {
        await api.updateCliente(sel.id, form);
        setStatus({ msg: `Cliente #${sel.id} actualizado.`, tone: "success" });
      } else {
        await api.createCliente(form);
        setStatus({ msg: "Cliente creado.", tone: "success" });
      }
      onRefresh();
    } catch (e: any) {
      setStatus({ msg: e.message, tone: "danger" });
    } finally {
      setWorking(false);
    }
  };

  const eliminar = async () => {
    if (!sel) return setStatus({ msg: "Seleccione un cliente.", tone: "warning" });
    if (!window.confirm(`¿Eliminar cliente ID=${sel.id}?`)) return;
    setWorking(true);
    try {
      await api.deleteCliente(sel.id);
      setStatus({ msg: `Cliente #${sel.id} eliminado.`, tone: "success" });
      onRefresh();
      limpiar();
    } catch (e: any) {
      setStatus({ msg: e.message, tone: "danger" });
    } finally {
      setWorking(false);
    }
  };

  return (
    <div>
      <PageTitle>Clientes</PageTitle>
      <div className="mb-4 flex items-center gap-3">
        <span className="text-[13px] text-muted">Buscar:</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar..."
          className="h-8 w-[200px] rounded-md border border-border bg-white px-3 text-[13px] outline-none focus:border-accent" />
        <Btn tone="accent" onClick={() => setFilter(q)}>Buscar</Btn>
        <Btn tone="muted" onClick={() => { setQ(""); setFilter(""); }}>Todos</Btn>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <Card>
          <Table<Cliente>
            getId={(r) => r.id} selectedId={sel?.id ?? null} onRowClick={(r) => setSel(r)}
            columns={[
              { key: "id", header: "ID", width: "55px", render: (r) => r.id },
              { key: "n", header: "Nombre", render: (r) => r.nombre },
              { key: "d", header: "DNI", width: "100px", render: (r) => r.dni },
              { key: "t", header: "Telefono", width: "110px", render: (r) => r.telefono },
              { key: "e", header: "Email", render: (r) => r.email },
            ]}
            data={data}
          />
        </Card>
        <Card>
          <SectionLabel>Detalle del Cliente</SectionLabel>
          <div className="space-y-3">
            <Field label="Nombre *"><Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></Field>
            <Field label="DNI *"><Input value={form.dni} onChange={(e) => setForm({ ...form, dni: e.target.value })} /></Field>
            <Field label="Telefono"><Input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} /></Field>
            <Field label="Email"><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Btn tone="muted" onClick={limpiar}>Nuevo</Btn>
            <Btn tone="success" disabled={working} onClick={guardar}>Guardar</Btn>
            <Btn tone="danger" disabled={working} onClick={eliminar}>Eliminar</Btn>
          </div>
          <div className="mt-3"><Status msg={status.msg} tone={status.tone} /></div>
        </Card>
      </div>
    </div>
  );
}

// ---------- Ventas (POS) ----------
type CartLine = { productoId: number; producto: string; cantidad: number; precio: number };

function VentasView({
  productos, clientes, sucursales, onRefresh,
}: { productos: Producto[]; clientes: Cliente[]; sucursales: Sucursal[]; onRefresh: () => void }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState(productos);
  const [selProd, setSelProd] = useState<Producto | null>(null);
  const [cant, setCant] = useState(1);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [selLine, setSelLine] = useState<number | null>(null);
  const [sucursalId, setSucursalId] = useState(sucursales[0]?.id ?? 1);
  const [clienteId, setClienteId] = useState(0);
  const [status, setStatus] = useState<{ msg: string; tone?: "success" | "danger" | "warning" }>({ msg: "" });
  const [working, setWorking] = useState(false);

  useEffect(() => { setResults(productos); }, [productos]);

  const subtotal = cart.reduce((a, l) => a + l.cantidad * l.precio, 0);
  const igv = +(subtotal * 0.18).toFixed(2);
  const total = +(subtotal + igv).toFixed(2);

  const buscar = () => {
    const term = q.trim().toLowerCase();
    if (!term) { setResults(productos); return; }
    setResults(productos.filter((p) => p.nombre.toLowerCase().includes(term)));
  };

  const agregar = () => {
    if (!selProd) return setStatus({ msg: "Seleccione un producto de la lista.", tone: "warning" });
    if (cant > selProd.stock) return setStatus({ msg: `Stock insuficiente. Disponible: ${selProd.stock}`, tone: "danger" });
    setCart((c) => {
      const ex = c.find((l) => l.productoId === selProd.id);
      if (ex) return c.map((l) => l.productoId === selProd.id ? { ...l, cantidad: l.cantidad + cant } : l);
      return [...c, { productoId: selProd.id, producto: selProd.nombre, cantidad: cant, precio: selProd.precio }];
    });
    setStatus({ msg: `Agregado: ${selProd.nombre} x${cant}`, tone: "success" });
  };

  const quitar = () => {
    if (selLine == null) return;
    setCart((c) => c.filter((l) => l.productoId !== selLine));
    setSelLine(null);
  };

  const limpiar = () => { setCart([]); setSelLine(null); setStatus({ msg: "Carrito vaciado." }); };

  const registrar = async () => {
    if (cart.length === 0) return setStatus({ msg: "El carrito esta vacio.", tone: "warning" });
    if (!sucursalId) return setStatus({ msg: "Seleccione una sucursal activa.", tone: "warning" });
    setWorking(true);
    try {
      const result = await api.createVenta({
        sucursalId,
        clienteId: clienteId > 0 ? clienteId : undefined,
        detalles: cart.map((l) => ({ productoId: l.productoId, cantidad: l.cantidad })),
      });
      const sucNom = sucursales.find((s) => s.id === sucursalId)?.nombre ?? `S#${sucursalId}`;
      setStatus({ msg: `Venta #${result.id} registrada en ${sucNom}. Total: ${money(total)}`, tone: "success" });
      setCart([]); setSelLine(null);
      onRefresh();
    } catch (e: any) {
      setStatus({ msg: e.message, tone: "danger" });
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <PageTitle>Nueva Venta</PageTitle>
      <div className="grid flex-1 gap-4 lg:grid-cols-[420px_1fr]">
        <Card className="flex flex-col gap-3">
          <SectionLabel>Buscar producto</SectionLabel>
          <div className="flex gap-2">
            <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && buscar()} placeholder="Buscar..."
              className="h-8 flex-1 rounded-md border border-border bg-white px-3 text-[13px] outline-none focus:border-accent" />
            <Btn tone="accent" onClick={buscar}>Buscar</Btn>
          </div>
          <div className="rounded-md border border-border">
            <div className="border-b border-border bg-row-alt px-3 py-1.5 text-[12px] font-bold text-muted">Resultados</div>
            <ul className="max-h-[340px] overflow-auto">
              {results.map((p) => (
                <li key={p.id} onClick={() => setSelProd(p)}
                  className={`cursor-pointer border-b border-border px-3 py-2 text-[13px] ${selProd?.id === p.id ? "bg-row-sel" : "hover:bg-row-alt"}`}>
                  [{p.id}] {p.nombre} - {money(p.precio)} (stock: {p.stock})
                </li>
              ))}
              {results.length === 0 && <li className="px-3 py-4 text-center text-[13px] text-muted">Sin resultados</li>}
            </ul>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[13px] text-muted">Cantidad:</span>
            <input type="number" min={1} max={9999} value={cant}
              onChange={(e) => setCant(Math.max(1, Math.min(9999, Number(e.target.value) || 1)))}
              className="h-8 w-[70px] rounded-md border border-border bg-white px-2 text-[13px] outline-none focus:border-accent" />
            <div className="ml-auto"><Btn tone="success" onClick={agregar}>Agregar al carrito</Btn></div>
          </div>
        </Card>
        <Card className="flex flex-col gap-3">
          <SectionLabel>Carrito de Compras</SectionLabel>
          <Table<CartLine>
            getId={(r) => r.productoId} selectedId={selLine} onRowClick={(r) => setSelLine(r.productoId)}
            columns={[
              { key: "n", header: "Producto", render: (r) => r.producto },
              { key: "c", header: "Cant.", width: "60px", align: "right", render: (r) => r.cantidad },
              { key: "p", header: "Precio", width: "90px", align: "right", render: (r) => money(r.precio) },
              { key: "s", header: "Subtotal", width: "100px", align: "right", render: (r) => money(r.cantidad * r.precio) },
            ]}
            data={cart} emptyMsg="Carrito vacio"
          />
          <div><Btn tone="danger" onClick={quitar}>Quitar seleccionado</Btn></div>
          <div className="rounded-md border border-border bg-row-alt p-3">
            <Row label="Subtotal:" value={money(subtotal)} />
            <Row label="IGV (18%):" value={money(igv)} />
            <Row label="TOTAL:" value={money(total)} big />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-[12px] text-muted">Sucursal:</span>
              <select value={sucursalId} onChange={(e) => setSucursalId(Number(e.target.value))}
                className="h-8 w-full rounded-md border border-border bg-white px-2 text-[13px] outline-none focus:border-accent">
                {sucursales.map((s) => <option key={s.id} value={s.id}>{s.id} - {s.nombre}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-[12px] text-muted">Cliente (opcional):</span>
              <select value={clienteId} onChange={(e) => setClienteId(Number(e.target.value))}
                className="h-8 w-full rounded-md border border-border bg-white px-2 text-[13px] outline-none focus:border-accent">
                <option value={0}>- Sin cliente -</option>
                {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre} ({c.dni})</option>)}
              </select>
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <Btn tone="muted" onClick={limpiar}>Limpiar</Btn>
            <Btn tone="success" disabled={working} onClick={registrar}>Registrar Venta</Btn>
          </div>
          <div className="text-center"><Status msg={status.msg} tone={status.tone} /></div>
        </Card>
      </div>
    </div>
  );
}

// ---------- Historial ----------
function HistorialView({ ventas, onRefresh }: { ventas: Venta[]; onRefresh: () => void }) {
  const [fecha, setFecha] = useState("");
  const [filter, setFilter] = useState("");
  const [sel, setSel] = useState<Venta | null>(null);
  const [status, setStatus] = useState<{ msg: string; tone?: "success" | "danger" | "warning" }>({ msg: "" });
  const [working, setWorking] = useState(false);

  const data = useMemo(() => {
    if (!filter) return ventas;
    return ventas.filter((v) => v.fecha.startsWith(filter));
  }, [ventas, filter]);

  const anular = async () => {
    if (!sel) return setStatus({ msg: "Seleccione una venta.", tone: "warning" });
    if (sel.estado === "Anulada") return setStatus({ msg: "La venta ya esta anulada.", tone: "warning" });
    if (!window.confirm(`¿Anular venta #${sel.id}? Se restaurara el stock.`)) return;
    setWorking(true);
    try {
      await api.anularVenta(sel.id);
      setStatus({ msg: `Venta #${sel.id} anulada.`, tone: "success" });
      onRefresh();
    } catch (e: any) {
      setStatus({ msg: e.message, tone: "danger" });
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <PageTitle>Historial de Ventas</PageTitle>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="text-[13px] text-muted">Fecha (yyyy-MM-dd):</span>
        <input value={fecha} onChange={(e) => setFecha(e.target.value)} placeholder="2026-06-24"
          className="h-8 w-[160px] rounded-md border border-border bg-white px-3 text-[13px] outline-none focus:border-accent" />
        <Btn tone="accent" onClick={() => setFilter(fecha)}>Filtrar</Btn>
        <Btn tone="muted" onClick={() => { setFecha(""); setFilter(""); }}>Todas</Btn>
        <div className="ml-auto"><Btn tone="danger" disabled={working} onClick={anular}>Anular Venta</Btn></div>
      </div>
      <div className="grid flex-1 gap-4 lg:grid-rows-[1fr_1fr]">
        <Card>
          <SectionLabel>Ventas</SectionLabel>
          <Table<Venta>
            getId={(r) => r.id} selectedId={sel?.id ?? null} onRowClick={(r) => setSel(r)}
            columns={[
              { key: "id", header: "ID", width: "55px", render: (r) => r.id },
              { key: "f", header: "Fecha", render: (r) => r.fecha },
              { key: "cli", header: "Cliente", width: "80px", render: (r) => r.clienteId ? `C#${r.clienteId}` : "-" },
              { key: "suc", header: "Sucursal", render: (r) => `S#${r.sucursalId}` },
              { key: "sub", header: "Subtotal", align: "right", render: (r) => money(r.subtotal) },
              { key: "igv", header: "IGV", align: "right", render: (r) => money(r.igv) },
              { key: "tot", header: "Total", align: "right", render: (r) => money(r.total) },
              { key: "est", header: "Estado", render: (r) => (
                <span className={r.estado === "Activa" ? "text-success" : "text-danger"}>{r.estado}</span>
              )},
            ]}
            data={data}
          />
        </Card>
        <Card>
          <SectionLabel>Detalle de Venta Seleccionada</SectionLabel>
          <Table<DetalleVenta>
            getId={(r) => r.id}
            columns={[
              { key: "id", header: "ID Det.", width: "70px", render: (r) => r.id },
              { key: "p", header: "Producto", render: (r) => r.producto },
              { key: "c", header: "Cantidad", width: "90px", align: "right", render: (r) => r.cantidad },
              { key: "pu", header: "Precio Unit.", align: "right", render: (r) => money(r.precio) },
              { key: "sub", header: "Subtotal", align: "right", render: (r) => money(r.cantidad * r.precio) },
            ]}
            data={sel?.detalles ?? []}
            emptyMsg="Seleccione una venta"
          />
          <div className="mt-2"><Status msg={status.msg} tone={status.tone} /></div>
        </Card>
      </div>
    </div>
  );
}

// ---------- Analítica (OLAP Cubes) ----------
function AnalyticsView() {
  const [cubo2d, setCubo2d] = useState<{ productos: string[]; meses: string[]; matrix: number[][]; formula: string; descripcion: string; totalVentas: string } | null>(null);
  const [cubo3d, setCubo3d] = useState<{ productos: string[]; meses: string[]; cubicos: { sucursal: string; subtotal: string; matrix: number[][] }[]; formula: string; descripcion: string; totalVentas: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [d2, d3] = await Promise.all([api.getCubo2D(), api.getCubo3D()]);
        setCubo2d(d2);
        setCubo3d(d3);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="pt-10 text-center text-muted text-[14px]">Cargando cubos OLAP...</div>;

  return (
    <div>
      <PageTitle>Analítica — Cubos OLAP</PageTitle>

      <Card className="mb-6">
        <SectionLabel>{cubo2d?.descripcion ?? 'Cubo 2D'}</SectionLabel>
        <p className="mb-2 text-[10px] text-muted">Fórmula de localización: {cubo2d?.formula}</p>
        <p className="mb-3 text-[12px]">Total ventas acumuladas: <span className="font-bold text-success">{cubo2d?.totalVentas}</span></p>
        {cubo2d && (
          <div className="overflow-auto max-h-[500px] rounded-md border border-border">
            <table className="w-full border-collapse text-[11px]">
              <thead>
                <tr className="bg-row-alt text-left font-bold text-muted sticky top-0">
                  <th className="px-2 py-1.5 sticky left-0 bg-row-alt">Producto \ Mes</th>
                  {cubo2d.meses.map((m) => (
                    <th key={m} className="px-2 py-1.5 text-right w-[60px]">{m.substring(0,3)}</th>
                  ))}
                  <th className="px-2 py-1.5 text-right font-bold w-[70px]">Total</th>
                </tr>
              </thead>
              <tbody>
                {cubo2d.productos.map((prod, i) => {
                  const rowTotal = cubo2d.matrix[i].reduce((a, v) => a + v, 0);
                  return (
                    <tr key={prod} className={i % 2 === 1 ? "bg-row-alt" : "bg-white"}>
                      <td className="px-2 py-1 font-medium sticky left-0 bg-inherit max-w-[180px] truncate">{prod}</td>
                      {cubo2d.matrix[i].map((v, j) => (
                        <td key={j} className={`px-2 py-1 text-right ${v > 0 ? "text-success font-medium" : "text-muted"}`}>
                          {v.toFixed(2)}
                        </td>
                      ))}
                      <td className="px-2 py-1 text-right font-bold">{rowTotal.toFixed(2)}</td>
                    </tr>
                  );
                })}
                <tr className="bg-row-alt font-bold">
                  <td className="px-2 py-1.5">TOTAL</td>
                  {cubo2d.meses.map((_, j) => {
                    const colSum = cubo2d.matrix.reduce((a, row) => a + row[j], 0);
                    return <td key={j} className="px-2 py-1.5 text-right text-success">{colSum.toFixed(2)}</td>;
                  })}
                  <td className="px-2 py-1.5 text-right text-success font-bold">{cubo2d.totalVentas}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <SectionLabel>{cubo3d?.descripcion ?? 'Cubo 3D'}</SectionLabel>
        <p className="mb-2 text-[10px] text-muted">Fórmula de localización: {cubo3d?.formula}</p>
        <p className="mb-3 text-[12px]">Total ventas acumuladas: <span className="font-bold text-success">{cubo3d?.totalVentas}</span></p>
        {cubo3d?.cubicos.map((suc) => (
          <div key={suc.sucursal} className="mb-6">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-[14px] font-bold text-accent">{suc.sucursal}</span>
              <span className="text-[11px] text-muted">Subtotal: {suc.subtotal}</span>
            </div>
            <div className="overflow-auto max-h-[400px] rounded-md border border-border">
              <table className="w-full border-collapse text-[11px]">
                <thead>
                  <tr className="bg-row-alt text-left font-bold text-muted sticky top-0">
                    <th className="px-2 py-1.5 sticky left-0 bg-row-alt">Producto \ Mes</th>
                    {cubo3d.meses.map((m) => (
                      <th key={m} className="px-2 py-1.5 text-right w-[55px]">{m.substring(0,3)}</th>
                    ))}
                    <th className="px-2 py-1.5 text-right w-[65px]">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {cubo3d.productos.map((prod, i) => {
                    const rowTotal = suc.matrix[i].reduce((a, v) => a + v, 0);
                    if (rowTotal === 0) return null;
                    return (
                      <tr key={prod} className={i % 2 === 1 ? "bg-row-alt" : "bg-white"}>
                        <td className="px-2 py-1 font-medium sticky left-0 bg-inherit max-w-[180px] truncate">{prod}</td>
                        {suc.matrix[i].map((v, j) => (
                          <td key={j} className={`px-2 py-1 text-right ${v > 0 ? "text-success font-medium" : "text-muted"}`}>
                            {v.toFixed(2)}
                          </td>
                        ))}
                        <td className="px-2 py-1 text-right font-bold">{rowTotal.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
