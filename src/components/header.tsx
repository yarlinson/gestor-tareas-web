"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { NotificationBell } from "./notification-bell";
import { boton } from "./ui";

export function Header() {
  const { perfil, cerrarSesion } = useAuth();
  const ruta = usePathname();

  const enlaces = [
    { href: "/", texto: "Tareas" },
    ...(perfil?.rol === "ADMIN" ? [{ href: "/admin", texto: "Administración" }] : []),
  ];

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12.5 10 17.5 19 7.5" />
            </svg>
          </span>
          <span className="hidden sm:inline">Gestor de Tareas</span>
        </Link>

        <nav className="flex items-center gap-1 text-sm" aria-label="Principal">
          {enlaces.map((enlace) => (
            <Link
              key={enlace.href}
              href={enlace.href}
              aria-current={ruta === enlace.href ? "page" : undefined}
              className={`rounded-md px-3 py-1.5 font-medium transition ${
                ruta === enlace.href
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              {enlace.texto}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <NotificationBell />
          <span className="hidden text-sm text-slate-600 md:inline dark:text-slate-300">
            {perfil?.nombreUsuario}
            {perfil?.rol === "ADMIN" && (
              <span className="ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                Admin
              </span>
            )}
          </span>
          <button type="button" onClick={cerrarSesion} className={boton("secundario")}>
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}
