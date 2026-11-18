/**
 * Configuración central leída de variables de entorno.
 *
 * Fuente de datos de ventas, en orden de prioridad:
 *  1. VENTAS_JSON: copia de las ventas en formato JSON (variable privada de Vercel).
 *  2. datos/ventas.json: el mismo formato, en un archivo local que no se sube a git.
 * Más adelante se suma la lectura en vivo del CRM (Supabase) sin cambiar las pantallas.
 */

function limpiar(valor: string | undefined): string {
  return (valor ?? "").trim();
}

export const config = {
  auth: {
    secret: limpiar(process.env.AUTH_SECRET) || "dev-secret-cambiar-en-produccion",
    adminUsuario: limpiar(process.env.ADMIN_USUARIO).toLowerCase(),
    adminPasswordHash: limpiar(process.env.ADMIN_PASSWORD_HASH),
    adminNombre: limpiar(process.env.ADMIN_NOMBRE) || "Gerencia",
  },
  ventas: {
    json: limpiar(process.env.VENTAS_JSON),
  },
} as const;
