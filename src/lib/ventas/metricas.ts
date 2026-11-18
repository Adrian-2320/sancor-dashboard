import type { Venta } from "./tipos";

/** Cálculos puros del tablero. No dependen de Node, así que también se usan en el cliente. */

const NOMBRES_MES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export const SIN_DATO = "Sin dato";

export function mesDe(fecha: string): string {
  return fecha.slice(0, 7);
}

export function etiquetaMes(mes: string): string {
  const [anio, m] = mes.split("-");
  return `${NOMBRES_MES[Number(m) - 1]} ${anio.slice(2)}`;
}

export function sumarMeses(mes: string, cantidad: number): string {
  const [anio, m] = mes.split("-").map(Number);
  const total = anio * 12 + (m - 1) + cantidad;
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, "0")}`;
}

/** Lista de meses "YYYY-MM" entre dos meses, ambos incluidos. */
export function mesesEntre(desde: string, hasta: string): string[] {
  const meses: string[] = [];
  for (let mes = desde; mes <= hasta; mes = sumarMeses(mes, 1)) meses.push(mes);
  return meses;
}

/** Meses desde la primera venta hasta el mes actual (o la última venta, si es posterior). */
export function rangoDeMeses(ventas: Venta[], mesActual: string): string[] {
  if (ventas.length === 0) return [mesActual];
  const primero = ventas.reduce((min, v) => (mesDe(v.fecha) < min ? mesDe(v.fecha) : min), mesDe(ventas[0].fecha));
  const ultimo = ventas.reduce((max, v) => (mesDe(v.fecha) > max ? mesDe(v.fecha) : max), mesActual);
  return mesesEntre(primero, ultimo);
}

export function slugAsesor(nombre: string): string {
  return nombre
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export type Totales = {
  ventas: number;
  capitas: number;
  /** Ventas sin cápitas registradas: no suman al total de cápitas. */
  ventasSinCapitas: number;
  comision: number;
  cuotaMensual: number;
  aprobadas: number;
};

export function totales(ventas: Venta[]): Totales {
  return ventas.reduce<Totales>(
    (t, v) => ({
      ventas: t.ventas + 1,
      capitas: t.capitas + (v.capitas ?? 0),
      ventasSinCapitas: t.ventasSinCapitas + (v.capitas === null ? 1 : 0),
      comision: t.comision + (v.comision ?? 0),
      cuotaMensual: t.cuotaMensual + (v.cuota ?? 0),
      aprobadas: t.aprobadas + (v.estado.toLowerCase().startsWith("aprob") ? 1 : 0),
    }),
    { ventas: 0, capitas: 0, ventasSinCapitas: 0, comision: 0, cuotaMensual: 0, aprobadas: 0 },
  );
}

export type PuntoMes = { mes: string; etiqueta: string; ventas: number; capitas: number; comision: number };

export function serieMensual(ventas: Venta[], meses: string[]): PuntoMes[] {
  return meses.map((mes) => {
    const delMes = ventas.filter((v) => mesDe(v.fecha) === mes);
    const t = totales(delMes);
    return { mes, etiqueta: etiquetaMes(mes), ventas: t.ventas, capitas: t.capitas, comision: t.comision };
  });
}

/** Cápitas por mes abiertas por una categoría (prepaga, asesor…), para gráficos apilados. */
export function serieMensualPor(
  ventas: Venta[],
  meses: string[],
  clave: (v: Venta) => string,
): { categorias: string[]; puntos: Record<string, string | number>[] } {
  const categorias = [...new Set(ventas.map(clave))].sort();
  const puntos = meses.map((mes) => {
    const punto: Record<string, string | number> = { mes, etiqueta: etiquetaMes(mes) };
    for (const c of categorias) punto[c] = 0;
    for (const v of ventas) if (mesDe(v.fecha) === mes) punto[clave(v)] = (punto[clave(v)] as number) + (v.capitas ?? 0);
    return punto;
  });
  return { categorias, puntos };
}

export type Grupo = { nombre: string; ventas: number; capitas: number; comision: number };

export function agrupar(ventas: Venta[], clave: (v: Venta) => string | null): Grupo[] {
  const mapa = new Map<string, Grupo>();
  for (const v of ventas) {
    const nombre = clave(v) || SIN_DATO;
    const g = mapa.get(nombre) ?? { nombre, ventas: 0, capitas: 0, comision: 0 };
    g.ventas += 1;
    g.capitas += v.capitas ?? 0;
    g.comision += v.comision ?? 0;
    mapa.set(nombre, g);
  }
  return [...mapa.values()].sort((a, b) => b.capitas - a.capitas || b.ventas - a.ventas);
}

/** Simplifica la forma de pago para agrupar ("Tarjeta de crédito (a nombre de un tercero)" → "Tarjeta de crédito"). */
export function formaPagoBase(v: Venta): string | null {
  return v.formaPago ? v.formaPago.replace(/\s*\(.*\)\s*$/, "") : null;
}

export type ParametrosProyeccion = {
  /** Cantidad de meses a proyectar hacia adelante. */
  meses: number;
  /** Crecimiento mensual en porcentaje (puede ser negativo). */
  crecimiento: number;
  /** Cantidad de meses recientes que se promedian como punto de partida. */
  base: number;
};

export type PuntoProyeccion = {
  mes: string;
  etiqueta: string;
  real: number | null;
  proyectado: number | null;
  acumuladoReal: number | null;
  acumuladoProyectado: number | null;
};

/**
 * Proyecta una métrica mensual: promedia los últimos `base` meses reales y aplica
 * `crecimiento`% compuesto por cada mes hacia adelante.
 */
export function proyectar(
  serie: { mes: string; valor: number }[],
  { meses, crecimiento, base }: ParametrosProyeccion,
): { puntos: PuntoProyeccion[]; promedioBase: number; totalProyectado: number } {
  const recientes = serie.slice(-Math.max(1, base));
  const promedioBase = recientes.length ? recientes.reduce((s, p) => s + p.valor, 0) / recientes.length : 0;

  let acumulado = 0;
  const puntos: PuntoProyeccion[] = serie.map((p) => {
    acumulado += p.valor;
    return { mes: p.mes, etiqueta: etiquetaMes(p.mes), real: p.valor, proyectado: null, acumuladoReal: acumulado, acumuladoProyectado: null };
  });

  // El último mes real también arranca la línea proyectada, para que se vea continua.
  if (puntos.length) {
    const ultimo = puntos[puntos.length - 1];
    ultimo.proyectado = ultimo.real;
    ultimo.acumuladoProyectado = ultimo.acumuladoReal;
  }

  const ultimoMes = serie.length ? serie[serie.length - 1].mes : null;
  let totalProyectado = 0;
  if (ultimoMes) {
    for (let k = 1; k <= meses; k++) {
      const valor = promedioBase * Math.pow(1 + crecimiento / 100, k);
      totalProyectado += valor;
      acumulado += valor;
      const mes = sumarMeses(ultimoMes, k);
      puntos.push({ mes, etiqueta: etiquetaMes(mes), real: null, proyectado: valor, acumuladoReal: null, acumuladoProyectado: acumulado });
    }
  }

  return { puntos, promedioBase, totalProyectado };
}
