/** Una venta (alta de prepaga) tal como la usa el tablero. */
export type Venta = {
  id: string;
  asesor: string;
  cliente: string;
  prepaga: string;
  /** Plan de la prepaga (A2, PLATA, AS100…). Null si no se registró. */
  plan: string | null;
  /** "Grav" o "No grav". */
  condicion: string | null;
  /** Cantidad de cápitas (personas) de la venta. Null si no se registró. */
  capitas: number | null;
  /** Fecha de la venta (aceptación) en formato YYYY-MM-DD. */
  fecha: string;
  /** Fecha de vigencia en formato YYYY-MM-DD. */
  vigencia: string | null;
  /** Comisión registrada para la venta, en pesos. */
  comision: number | null;
  /** Cuota mensual cotizada, en pesos. */
  cuota: number | null;
  estado: string;
  formaPago: string | null;
  /** Relación de dependencia, Monotributo, Particular… */
  modalidad: string | null;
  grupoFamiliar: string | null;
  /** El CRM todavía no registra zona: queda en null hasta que exista el dato. */
  zona: string | null;
  /** De dónde salió el registro. */
  origen: "crm" | "excel";
  /** Aclaración sobre el registro (datos faltantes, diferencias detectadas). */
  nota: string | null;
};
