# Tablero de Ventas — Artexa

Tablero web de las ventas de prepagas (Prevención Salud, Medife, Avalian) por asesor:
planes, cápitas, fechas, formas de pago, modalidad de contratación y estado, separado por mes,
con gráficos por asesor y una proyección ajustable.

## Pantallas

| Ruta | Qué muestra |
| --- | --- |
| `/tablero` | Tablero general (sólo gerencia): KPIs, proyección, cápitas por mes y prepaga/asesor, ranking de asesores, planes, formas de pago, modalidad y detalle mensual. |
| `/asesor/<nombre>` | Lo mismo filtrado a un asesor. Un usuario asesor sólo ve el suyo. |

La **proyección** promedia los últimos N meses reales y aplica un crecimiento mensual compuesto.
Los controles permiten estirarla de 1 a 24 meses, cambiar el crecimiento y la base, y verla acumulada.

## Datos

Las pantallas leen las ventas sólo a través de `obtenerVentas()` (`src/lib/ventas/fuente.ts`):

1. Variable de entorno `VENTAS_JSON` (lista de ventas en JSON, ver `src/lib/ventas/tipos.ts`).
2. Si no existe, el archivo local `datos/ventas.json`.

**Los datos de clientes nunca se suben al repositorio** (es público): `datos/` está en `.gitignore`
y en Vercel viajan como variable de entorno privada. El paso siguiente es leer en vivo el CRM
(Supabase) con un usuario de sólo lectura, sin cambiar las pantallas.

## Acceso

Usuario de gerencia por variables de entorno:

| Variable | Valor |
| --- | --- |
| `AUTH_SECRET` | Texto aleatorio largo para firmar las sesiones. |
| `ADMIN_USUARIO` | Usuario de gerencia (por ejemplo `gerencia`). |
| `ADMIN_PASSWORD_HASH` | Hash bcrypt de la contraseña: `npm run clave -- "TuContraseña"`. |
| `ADMIN_NOMBRE` | Nombre que se muestra (opcional). |

## Desarrollo

```bash
npm install
npm run dev
```

Stack: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Recharts. Desplegado en Vercel.
