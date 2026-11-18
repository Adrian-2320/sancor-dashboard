"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import type { Sesion } from "@/lib/types";

import { IconoCerrar, IconoMenu, IconoResumen, IconoSalir } from "./iconos";

export type EnlaceAsesor = { nombre: string; slug: string; capitas: number };

export function Shell({
  sesion,
  asesores,
  children,
}: {
  sesion: Sesion;
  asesores: EnlaceAsesor[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [saliendo, setSaliendo] = useState(false);

  useEffect(() => {
    setAbierto(false);
  }, [pathname]);

  async function salir() {
    setSaliendo(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  const claseEnlace = (activo: boolean) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
      activo ? "bg-marino-700 font-semibold text-white" : "text-marino-100 hover:bg-marino-800 hover:text-white"
    }`;

  const lateral = (
    <div className="flex h-full flex-col bg-marino-900 text-marino-100">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-naranja-600 text-sm font-bold text-white">
          A
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-white">Tablero de Ventas</p>
          <p className="text-[11px] text-marino-300">Artexa · Prepagas</p>
        </div>
        <button
          type="button"
          onClick={() => setAbierto(false)}
          className="ml-auto rounded-md p-1 text-marino-300 hover:bg-marino-800 hover:text-white lg:hidden"
          aria-label="Cerrar menú"
        >
          <IconoCerrar />
        </button>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
        {sesion.rol === "gerente" && (
          <Link href="/tablero" className={claseEnlace(pathname === "/tablero")}>
            <IconoResumen />
            Tablero general
          </Link>
        )}
        <p className="px-3 pb-1 pt-4 text-[10px] font-semibold uppercase tracking-wider text-marino-300">Asesores</p>
        {asesores.map((a) => {
          const href = `/asesor/${a.slug}`;
          return (
            <Link key={a.slug} href={href} className={claseEnlace(pathname === href)}>
              <span className="truncate">{a.nombre}</span>
              <span className="tabular ml-auto text-[11px] text-marino-300">{a.capitas}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-marino-800 px-4 py-4">
        <p className="mb-3 truncate text-sm font-medium text-white">{sesion.nombre}</p>
        <button
          type="button"
          onClick={salir}
          disabled={saliendo}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-marino-100 transition-colors hover:bg-marino-800 hover:text-white disabled:opacity-60"
        >
          <IconoSalir />
          {saliendo ? "Saliendo…" : "Cerrar sesión"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen lg:flex">
      <aside className="hidden w-60 shrink-0 lg:block">
        <div className="fixed inset-y-0 left-0 w-60">{lateral}</div>
      </aside>

      {abierto && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" aria-label="Cerrar menú" className="absolute inset-0 bg-marino-950/60" onClick={() => setAbierto(false)} />
          <div className="relative h-full w-64 max-w-[80vw] shadow-xl">{lateral}</div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-borde bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
          <button type="button" onClick={() => setAbierto(true)} className="rounded-md p-1.5 text-tinta hover:bg-lienzo" aria-label="Abrir menú">
            <IconoMenu />
          </button>
          <span className="text-sm font-semibold">Tablero de Ventas</span>
        </header>
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
