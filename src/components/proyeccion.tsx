"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  ComposedChart,
  Bar,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { numero, PALETA } from "@/lib/format";
import { proyectar } from "@/lib/ventas/metricas";

type Medida = "capitas" | "ventas";

const eje = { tick: { fontSize: 11, fill: "#5b6b7a" }, tickLine: false, axisLine: { stroke: "#e2e7ee" } };

/**
 * Proyección ajustable: el usuario "estira" la proyección con los controles
 * (meses hacia adelante, crecimiento mensual y meses que se toman como base).
 */
export function Proyeccion({
  serie,
}: {
  serie: { mes: string; ventas: number; capitas: number }[];
}) {
  const [medida, setMedida] = useState<Medida>("capitas");
  const [meses, setMeses] = useState(6);
  const [crecimiento, setCrecimiento] = useState(0);
  const [base, setBase] = useState(Math.min(2, Math.max(1, serie.length)));
  const [acumulado, setAcumulado] = useState(false);

  const resultado = useMemo(
    () => proyectar(serie.map((p) => ({ mes: p.mes, valor: p[medida] })), { meses, crecimiento, base }),
    [serie, medida, meses, crecimiento, base],
  );

  const unidad = medida === "capitas" ? "cápitas" : "ventas";
  const claveReal = acumulado ? "acumuladoReal" : "real";
  const claveProy = acumulado ? "acumuladoProyectado" : "proyectado";

  return (
    <div>
      <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block">
          <span className="etiqueta-campo">Medir</span>
          <select className="campo" value={medida} onChange={(e) => setMedida(e.target.value as Medida)}>
            <option value="capitas">Cápitas</option>
            <option value="ventas">Ventas</option>
          </select>
        </label>
        <label className="block">
          <span className="etiqueta-campo">Proyectar {meses} {meses === 1 ? "mes" : "meses"}</span>
          <input type="range" min={1} max={24} value={meses} onChange={(e) => setMeses(Number(e.target.value))} className="w-full accent-[#e8730c]" />
        </label>
        <label className="block">
          <span className="etiqueta-campo">Crecimiento mensual: {crecimiento > 0 ? "+" : ""}{crecimiento}%</span>
          <input type="range" min={-50} max={100} step={5} value={crecimiento} onChange={(e) => setCrecimiento(Number(e.target.value))} className="w-full accent-[#e8730c]" />
        </label>
        <label className="block">
          <span className="etiqueta-campo">Base: promedio de últimos {base} {base === 1 ? "mes" : "meses"}</span>
          <input type="range" min={1} max={Math.max(1, serie.length)} value={base} onChange={(e) => setBase(Number(e.target.value))} className="w-full accent-[#e8730c]" />
        </label>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <span>
          Punto de partida: <strong className="tabular">{numero(Math.round(resultado.promedioBase * 10) / 10)}</strong> {unidad}/mes
        </span>
        <span>
          Total proyectado ({meses} {meses === 1 ? "mes" : "meses"}): <strong className="tabular">{numero(resultado.totalProyectado)}</strong> {unidad}
        </span>
        <label className="ml-auto inline-flex items-center gap-2 text-xs text-tinta-suave">
          <input type="checkbox" checked={acumulado} onChange={(e) => setAcumulado(e.target.checked)} />
          Ver acumulado
        </label>
      </div>

      <div style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={resultado.puntos} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#eef1f5" />
            <XAxis dataKey="etiqueta" {...eje} />
            <YAxis allowDecimals={false} {...eje} />
            <Tooltip
              contentStyle={{ borderRadius: 10, border: "1px solid #e2e7ee", fontSize: 12 }}
              formatter={(v, n) => [`${numero(Math.round(Number(v)))} ${unidad}`, n === claveReal ? "Real" : "Proyectado"]}
            />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} formatter={(n) => (n === claveReal ? "Real" : "Proyectado")} />
            <Bar dataKey={claveReal} fill={PALETA.primarioClaro} maxBarSize={48} radius={[4, 4, 0, 0]} />
            <Line dataKey={claveProy} stroke={PALETA.acento} strokeWidth={2.5} strokeDasharray="6 4" dot={{ r: 3 }} connectNulls />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-xs text-tinta-suave">
        La proyección promedia los meses elegidos como base y aplica el crecimiento mensual de forma compuesta. Con
        pocos meses de historia, tomala como orientativa.
      </p>
    </div>
  );
}
