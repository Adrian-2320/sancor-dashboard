import { redirect } from "next/navigation";

import { obtenerSesion } from "@/lib/auth";

import { FormularioLogin } from "./formulario-login";

export const dynamic = "force-dynamic";

export default async function PaginaLogin({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sesion = await obtenerSesion();
  if (sesion) redirect("/tablero");

  const params = await searchParams;
  const volverCrudo = Array.isArray(params.volver) ? params.volver[0] : params.volver;
  // Sólo se aceptan rutas internas, para no poder redirigir a un sitio externo.
  const volver = volverCrudo && volverCrudo.startsWith("/") && !volverCrudo.startsWith("//")
    ? volverCrudo
    : "/tablero";

  return (
    <main className="flex min-h-screen items-center justify-center bg-marino-950 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-naranja-600 text-lg font-bold text-white">
            A
          </div>
          <h1 className="text-xl font-semibold text-white">Tablero de Ventas</h1>
          <p className="mt-1 text-sm text-marino-300">Artexa · Prepagas</p>
        </div>

        <div className="tarjeta p-6">
          <FormularioLogin volver={volver} />
        </div>

        <p className="mt-6 text-center text-xs text-marino-300">
          Si olvidaste tu contraseña, pedísela a la gerencia.
        </p>
      </div>
    </main>
  );
}
