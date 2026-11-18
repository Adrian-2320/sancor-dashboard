import { redirect } from "next/navigation";

import { Aviso } from "@/components/ui";
import { VistaVentas } from "@/components/vista-ventas";
import { obtenerSesion } from "@/lib/auth";
import { obtenerVentas } from "@/lib/ventas/fuente";
import { slugAsesor } from "@/lib/ventas/metricas";

export const dynamic = "force-dynamic";

export default async function PaginaTablero() {
  const sesion = await obtenerSesion();
  if (!sesion) redirect("/login");
  if (sesion.rol !== "gerente") redirect(`/asesor/${slugAsesor(sesion.asesor)}`);

  const { ventas, error } = await obtenerVentas();

  return (
    <>
      {error && <Aviso tono="error">{error}</Aviso>}
      <VistaVentas
        ventas={ventas}
        titulo="Tablero general"
        descripcion="Ventas de prepagas de todo el equipo, desde la primera venta registrada."
        esAsesor={false}
      />
    </>
  );
}
