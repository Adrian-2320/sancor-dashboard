"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { numero, PALETA } from "@/lib/format";

const eje = { tick: { fontSize: 11, fill: "#5b6b7a" }, tickLine: false, axisLine: { stroke: "#e2e7ee" } };
const tooltip = {
  contentStyle: { borderRadius: 10, border: "1px solid #e2e7ee", fontSize: 12, boxShadow: "0 6px 20px rgb(15 47 74 / 0.10)" },
  labelStyle: { fontWeight: 600, marginBottom: 4, color: "#16232e" },
};

/** Colores fijos por prepaga, para que cada una se reconozca en todos los gráficos. */
const COLORES_PREPAGA: Record<string, string> = {
  "Prevención Salud": "#1d5e8c",
  Medife: "#e8730c",
  Avalian: "#2f8f5b",
};

export function colorCategoria(nombre: string, indice: number): string {
  return COLORES_PREPAGA[nombre] ?? PALETA.serie[indice % PALETA.serie.length];
}

/** Cápitas por mes, apiladas por categoría (prepaga o asesor). */
export function GraficoMensualApilado({
  puntos,
  categorias,
  alto = 280,
}: {
  puntos: Record<string, string | number>[];
  categorias: string[];
  alto?: number;
}) {
  return (
    <div style={{ height: alto }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={puntos} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#eef1f5" />
          <XAxis dataKey="etiqueta" {...eje} />
          <YAxis allowDecimals={false} {...eje} />
          <Tooltip {...tooltip} formatter={(v) => [`${numero(Number(v))} cápitas`]} />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
          {categorias.map((c, i) => (
            <Bar key={c} dataKey={c} stackId="a" fill={colorCategoria(c, i)} maxBarSize={56} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Barras horizontales para rankings (plan, asesor, forma de pago…). */
export function GraficoBarrasHorizontales({
  datos,
  medida,
  alto,
}: {
  datos: { nombre: string; valor: number }[];
  medida: string;
  alto?: number;
}) {
  const altura = alto ?? Math.max(140, datos.length * 34 + 30);
  return (
    <div style={{ height: altura }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={datos} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 0 }}>
          <CartesianGrid horizontal={false} stroke="#eef1f5" />
          <XAxis type="number" allowDecimals={false} {...eje} />
          <YAxis type="category" dataKey="nombre" width={130} {...eje} />
          <Tooltip {...tooltip} formatter={(v) => [`${numero(Number(v))} ${medida}`]} />
          <Bar dataKey="valor" fill={PALETA.primarioClaro} radius={[0, 4, 4, 0]} maxBarSize={22} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Torta de participación. */
export function GraficoTorta({ datos, medida }: { datos: { nombre: string; valor: number }[]; medida: string }) {
  return (
    <div style={{ height: 240 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={datos} dataKey="valor" nameKey="nombre" innerRadius={55} outerRadius={90} paddingAngle={2}>
            {datos.map((d, i) => (
              <Cell key={d.nombre} fill={colorCategoria(d.nombre, i)} />
            ))}
          </Pie>
          <Tooltip {...tooltip} formatter={(v, n) => [`${numero(Number(v))} ${medida}`, String(n)]} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
