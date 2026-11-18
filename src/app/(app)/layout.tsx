import { redirect } from "next/navigation";

import { Shell } from "@/components/shell";
import { obtenerSesion } from "@/lib/auth";
import { obtenerVentas } from "@/lib/ventas/fuente";
import { agrupar, slugAsesor } from "@/lib/ventas/metricas";

export const dynamic = "force-dynamic";

export default async function LayoutApp({ children }: { children: React.ReactNode }) {
  const sesion = await obtenerSesion();
  if (!sesion) redirect("/login");

  const { ventas } = await obtenerVentas();
  const asesores = agrupar(ventas, (v) => v.asesor)
    .filter((g) => sesion.rol === "gerente" || g.nombre === sesion.asesor)
    .map((g) => ({ nombre: g.nombre, slug: slugAsesor(g.nombre), capitas: g.capitas }));

  return (
    <Shell sesion={sesion} asesores={asesores}>
      {children}
    </Shell>
  );
}
