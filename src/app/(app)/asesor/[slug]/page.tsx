import { notFound, redirect } from "next/navigation";

import { VistaVentas } from "@/components/vista-ventas";
import { obtenerSesion } from "@/lib/auth";
import { obtenerVentas } from "@/lib/ventas/fuente";
import { slugAsesor } from "@/lib/ventas/metricas";

export const dynamic = "force-dynamic";

export default async function PaginaAsesor({ params }: { params: Promise<{ slug: string }> }) {
  const sesion = await obtenerSesion();
  if (!sesion) redirect("/login");

  const { slug } = await params;
  // Un asesor sólo puede ver su propio tablero.
  if (sesion.rol !== "gerente" && slugAsesor(sesion.asesor) !== slug) redirect(`/asesor/${slugAsesor(sesion.asesor)}`);

  const { ventas } = await obtenerVentas();
  const delAsesor = ventas.filter((v) => slugAsesor(v.asesor) === slug);
  if (delAsesor.length === 0) notFound();

  return (
    <VistaVentas
      ventas={delAsesor}
      titulo={delAsesor[0].asesor}
      descripcion="Ventas del asesor por mes, prepaga, plan y forma de pago, con proyección ajustable."
      esAsesor
    />
  );
}
