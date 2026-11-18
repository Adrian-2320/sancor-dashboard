import Link from "next/link";

import { moneda, numero } from "@/lib/format";
import { etiquetaMes, mesDe, slugAsesor, type Grupo } from "@/lib/ventas/metricas";
import type { Venta } from "@/lib/ventas/tipos";

function fecha(iso: string | null): string {
  if (!iso) return "—";
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
}

const th = "px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-tinta-suave whitespace-nowrap";
const td = "px-3 py-2 whitespace-nowrap";

/** Detalle de ventas agrupado por mes, de la más reciente a la más vieja. */
export function TablaDetalleVentas({ ventas, mostrarAsesor = true }: { ventas: Venta[]; mostrarAsesor?: boolean }) {
  const porMes = new Map<string, Venta[]>();
  for (const v of [...ventas].sort((a, b) => b.fecha.localeCompare(a.fecha))) {
    const mes = mesDe(v.fecha);
    porMes.set(mes, [...(porMes.get(mes) ?? []), v]);
  }

  return (
    <div className="-mx-5 overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="border-b border-borde">
          <tr>
            <th className={th}>Fecha</th>
            {mostrarAsesor && <th className={th}>Asesor</th>}
            <th className={th}>Cliente</th>
            <th className={th}>Prepaga</th>
            <th className={th}>Plan</th>
            <th className={`${th} text-right`}>Cápitas</th>
            <th className={th}>Condición</th>
            <th className={th}>Forma de pago</th>
            <th className={th}>Modalidad</th>
            <th className={th}>Grupo familiar</th>
            <th className={th}>Zona</th>
            <th className={th}>Vigencia</th>
            <th className={`${th} text-right`}>Cuota</th>
            <th className={`${th} text-right`}>Comisión</th>
            <th className={th}>Estado</th>
          </tr>
        </thead>
        {[...porMes.entries()].map(([mes, lista]) => (
          <tbody key={mes} className="divide-y divide-borde">
            <tr className="bg-lienzo">
              <td colSpan={mostrarAsesor ? 15 : 14} className="px-3 py-1.5 text-xs font-semibold">
                {etiquetaMes(mes)} · {lista.length} {lista.length === 1 ? "venta" : "ventas"} ·{" "}
                {numero(lista.reduce((s, v) => s + (v.capitas ?? 0), 0))} cápitas
              </td>
            </tr>
            {lista.map((v) => (
              <tr key={v.id} className="align-top">
                <td className={`${td} tabular`}>{fecha(v.fecha)}</td>
                {mostrarAsesor && (
                  <td className={td}>
                    <Link href={`/asesor/${slugAsesor(v.asesor)}`} className="text-marino-700 hover:underline">
                      {v.asesor}
                    </Link>
                  </td>
                )}
                <td className={td}>
                  {v.cliente}
                  {v.nota && <p className="max-w-64 whitespace-normal text-[11px] text-alerta">{v.nota}</p>}
                </td>
                <td className={td}>{v.prepaga}</td>
                <td className={td}>{v.plan ?? "—"}</td>
                <td className={`${td} tabular text-right`}>{v.capitas ?? "—"}</td>
                <td className={td}>{v.condicion ?? "—"}</td>
                <td className={td}>{v.formaPago ?? "—"}</td>
                <td className={td}>{v.modalidad ?? "—"}</td>
                <td className={td}>{v.grupoFamiliar ?? "—"}</td>
                <td className={td}>{v.zona ?? "—"}</td>
                <td className={`${td} tabular`}>{fecha(v.vigencia)}</td>
                <td className={`${td} tabular text-right`}>{v.cuota === null ? "—" : moneda(v.cuota)}</td>
                <td className={`${td} tabular text-right`}>{v.comision === null ? "—" : moneda(v.comision)}</td>
                <td className={td}>
                  <EstadoVenta estado={v.estado} />
                  {v.origen === "excel" && <p className="text-[11px] text-tinta-suave">Cargada fuera del CRM</p>}
                </td>
              </tr>
            ))}
          </tbody>
        ))}
      </table>
    </div>
  );
}

function EstadoVenta({ estado }: { estado: string }) {
  const aprobada = estado.toLowerCase().startsWith("aprob");
  return (
    <span
      className={`inline-block rounded-md px-2 py-0.5 text-xs font-semibold ${
        aprobada ? "bg-ok-suave text-ok" : "bg-alerta-suave text-alerta"
      }`}
    >
      {estado}
    </span>
  );
}

/** Resumen por grupo (asesor, prepaga, plan…) con participación sobre el total de cápitas. */
export function TablaGrupos({ grupos, titulo, enlaceAsesor = false }: { grupos: Grupo[]; titulo: string; enlaceAsesor?: boolean }) {
  const totalCapitas = grupos.reduce((s, g) => s + g.capitas, 0);
  return (
    <div className="-mx-5 overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="border-b border-borde">
          <tr>
            <th className={th}>{titulo}</th>
            <th className={`${th} text-right`}>Ventas</th>
            <th className={`${th} text-right`}>Cápitas</th>
            <th className={`${th} text-right`}>% cápitas</th>
            <th className={`${th} text-right`}>Comisión</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-borde">
          {grupos.map((g) => (
            <tr key={g.nombre}>
              <td className={td}>
                {enlaceAsesor ? (
                  <Link href={`/asesor/${slugAsesor(g.nombre)}`} className="font-medium text-marino-700 hover:underline">
                    {g.nombre}
                  </Link>
                ) : (
                  g.nombre
                )}
              </td>
              <td className={`${td} tabular text-right`}>{numero(g.ventas)}</td>
              <td className={`${td} tabular text-right`}>{numero(g.capitas)}</td>
              <td className={`${td} tabular text-right`}>
                {totalCapitas ? `${Math.round((g.capitas / totalCapitas) * 100)}%` : "—"}
              </td>
              <td className={`${td} tabular text-right`}>{moneda(g.comision)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Matriz mes × categoría con las cápitas de cada celda. */
export function TablaMensual({
  puntos,
  categorias,
  titulo,
}: {
  puntos: Record<string, string | number>[];
  categorias: string[];
  titulo: string;
}) {
  return (
    <div className="-mx-5 overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="border-b border-borde">
          <tr>
            <th className={th}>{titulo}</th>
            {puntos.map((p) => (
              <th key={String(p.mes)} className={`${th} text-right`}>{String(p.etiqueta)}</th>
            ))}
            <th className={`${th} text-right`}>Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-borde">
          {categorias.map((c) => (
            <tr key={c}>
              <td className={td}>{c}</td>
              {puntos.map((p) => (
                <td key={String(p.mes)} className={`${td} tabular text-right`}>{numero(Number(p[c]))}</td>
              ))}
              <td className={`${td} tabular text-right font-semibold`}>
                {numero(puntos.reduce((s, p) => s + Number(p[c]), 0))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
