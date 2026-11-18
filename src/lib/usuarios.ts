import bcrypt from "bcryptjs";

import { config } from "./config";
import type { Sesion, Usuario } from "./types";

/** Hash de relleno para que un usuario inexistente tarde lo mismo que uno válido. */
const HASH_RELLENO = "$2b$10$Dq7BZBwIOOaHc.9JnXVLBOrQc7uz7nD6zwjs0bj7zq4bxEHSK4zCu";

/** Usuario gerente definido por variables de entorno (ADMIN_USUARIO / ADMIN_PASSWORD_HASH). */
export function listarUsuarios(): Usuario[] {
  if (!config.auth.adminUsuario || !config.auth.adminPasswordHash) return [];
  return [
    {
      id: "ENV",
      usuario: config.auth.adminUsuario,
      passwordHash: config.auth.adminPasswordHash,
      rol: "gerente",
      asesor: "",
      activo: true,
    },
  ];
}

export type ResultadoLogin = { ok: true; sesion: Sesion } | { ok: false; motivo: string };

export async function verificarCredenciales(
  usuarioIngresado: string,
  password: string,
): Promise<ResultadoLogin> {
  const clave = (usuarioIngresado ?? "").trim().toLowerCase();
  if (!clave || !password) return { ok: false, motivo: "Ingresá tu usuario y contraseña." };

  const usuarios = listarUsuarios();
  if (usuarios.length === 0) {
    return {
      ok: false,
      motivo: "No hay usuarios configurados. Definí ADMIN_USUARIO y ADMIN_PASSWORD_HASH.",
    };
  }

  const encontrado = usuarios.find((u) => u.usuario === clave);
  if (!encontrado) {
    await bcrypt.compare(password, HASH_RELLENO);
    return { ok: false, motivo: "Usuario o contraseña incorrectos." };
  }

  let coincide = false;
  try {
    coincide = await bcrypt.compare(password, encontrado.passwordHash);
  } catch {
    return { ok: false, motivo: "La contraseña guardada no es un hash válido. Regenerala con: npm run clave." };
  }
  if (!coincide) return { ok: false, motivo: "Usuario o contraseña incorrectos." };

  return {
    ok: true,
    sesion: {
      usuario: encontrado.usuario,
      nombre: encontrado.asesor || config.auth.adminNombre,
      rol: encontrado.rol,
      asesor: encontrado.asesor,
    },
  };
}
