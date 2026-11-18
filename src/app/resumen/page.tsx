import { redirect } from "next/navigation";

/** Ruta anterior: se mantiene para que los accesos directos viejos sigan funcionando. */
export default function Resumen() {
  redirect("/tablero");
}
