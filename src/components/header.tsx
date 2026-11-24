"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Marca } from "./marca";
import { NotificationBell } from "./notification-bell";
import { ThemeToggle } from "./theme-toggle";
import { boton } from "./ui";

export function Header() {
  const { perfil, cerrarSesion } = useAuth();
  const ruta = usePathname();

  const enlaces = [
    { href: "/", texto: "Resumen" },
    { href: "/tareas", texto: "Tareas" },
    { href: "/calendario", texto: "Calendario" },
    ...(perfil?.rol === "ADMIN" ? [{ href: "/admin", texto: "Administración" }] : []),
  ];

  return (
    <header className="sticky top-0 z-20 border-b-4 border-double border-regla-fuerte bg-papel">
      <div className="mx-auto flex min-h-16 w-full max-w-5xl flex-wrap items-center gap-x-7 gap-y-1 px-4 py-2 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Marca />
          <span className="font-display text-[1.75rem] font-bold leading-none">Gestor de Tareas</span>
        </Link>

        <nav aria-label="Principal" className="flex flex-wrap gap-x-5 font-display text-[1.25rem] font-semibold">
          {enlaces.map((enlace) => {
            const activo = ruta === enlace.href;
            return (
              <Link
                key={enlace.href}
                href={enlace.href}
                aria-current={activo ? "page" : undefined}
                className={`border-b-2 pb-0.5 transition-colors ${
                  activo
                    ? "border-tinta"
                    : "border-transparent text-tinta-suave hover:text-tinta"
                }`}
              >
                {enlace.texto}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <ThemeToggle />
          <NotificationBell />
          <span className="hidden font-display text-[1.2rem] font-semibold lg:inline">
            {perfil?.nombreUsuario}
            {perfil?.rol === "ADMIN" && (
              <span className="ml-2 border border-regla-fuerte px-1.5 text-base font-medium text-tinta-suave">
                Admin
              </span>
            )}
          </span>
          <button
            type="button"
            onClick={cerrarSesion}
            className={`${boton("secundario")} boton-pequeno`}
          >
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}
