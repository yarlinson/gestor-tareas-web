"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { AuthForm } from "./auth-form";
import { Header } from "./header";
import { Spinner } from "./ui";

function PantallaDeCarga() {
  return (
    <div className="flex min-h-screen items-center justify-center text-slate-500">
      <Spinner className="h-6 w-6" />
      <span className="sr-only">Cargando…</span>
    </div>
  );
}

/**
 * Marco de las páginas que requieren sesión: muestra la pantalla de acceso si no la hay y, con
 * `soloAdmin`, comprueba también el rol. La comprobación de rol es solo de interfaz; la API la
 * vuelve a verificar y responde 403 a quien no sea administrador.
 */
export function AppShell({
  children,
  soloAdmin = false,
}: {
  children: ReactNode;
  soloAdmin?: boolean;
}) {
  const { hidratado, token, perfil, cargandoPerfil } = useAuth();

  if (!hidratado) return <PantallaDeCarga />;
  if (!token) return <AuthForm />;

  let contenido = children;
  if (soloAdmin) {
    if (cargandoPerfil) {
      contenido = <PantallaDeCarga />;
    } else if (perfil?.rol !== "ADMIN") {
      contenido = (
        <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
          <h1 className="text-lg font-semibold">Solo para administradores</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Tu cuenta no tiene permiso para ver esta página.
          </p>
        </div>
      );
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">{contenido}</main>
      <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-500 dark:border-slate-800">
        Gestor de Tareas · Next.js sobre una API REST en Spring Boot
      </footer>
    </div>
  );
}
