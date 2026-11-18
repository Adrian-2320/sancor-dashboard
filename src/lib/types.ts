export type Rol = "gerente" | "vendedor";

export type Usuario = {
  id: string;
  usuario: string;
  passwordHash: string;
  rol: Rol;
  /** Nombre del asesor tal como figura en el CRM. Vacío para el gerente. */
  asesor: string;
  activo: boolean;
};

export type Sesion = {
  usuario: string;
  nombre: string;
  rol: Rol;
  asesor: string;
};
