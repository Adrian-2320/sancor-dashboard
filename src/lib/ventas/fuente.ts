import { readFile } from "node:fs/promises";
import path from "node:path";

import { config } from "../config";
import type { Venta } from "./tipos";

export type ResultadoVentas = {
  ventas: Venta[];
  origen: "variable" | "archivo" | "ninguno";
  error: string | null;
};

/**
 * Punto único de lectura de las ventas. Las pantallas sólo dependen de esta función,
 * así que reemplazar la copia por la lectura en vivo del CRM no las afecta.
 */
export async function obtenerVentas(): Promise<ResultadoVentas> {
  if (config.ventas.json) {
    return interpretar(config.ventas.json, "variable");
  }

  try {
    const archivo = await readFile(path.join(process.cwd(), "datos", "ventas.json"), "utf8");
    return interpretar(archivo, "archivo");
  } catch {
    return { ventas: [], origen: "ninguno", error: "No hay datos de ventas configurados." };
  }
}

function interpretar(texto: string, origen: ResultadoVentas["origen"]): ResultadoVentas {
  try {
    const crudo: unknown = JSON.parse(texto);
    if (!Array.isArray(crudo)) throw new Error("Se esperaba una lista de ventas.");
    const ventas = (crudo as Venta[]).filter((v) => v && v.asesor && /^\d{4}-\d{2}-\d{2}$/.test(v.fecha));
    ventas.sort((a, b) => a.fecha.localeCompare(b.fecha));
    return { ventas, origen, error: null };
  } catch (e) {
    return { ventas: [], origen, error: `Los datos de ventas no son válidos: ${(e as Error).message}` };
  }
}
