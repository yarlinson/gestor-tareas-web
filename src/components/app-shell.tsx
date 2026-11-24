"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { AuthForm } from "./auth-form";
import { Header } from "./header";
import { Spinner } from "./ui";

function PantallaDeCarga() {
  return (
    <div className="flex min-h-screen items-center justify-center text-tinta-suave">
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
        <div className="mx-auto max-w-md border-[1.5px] border-tinta bg-hoja p-8 text-center shadow-[6px_6px_0_0_var(--regla-fuerte)]">
          <h1 className="font-display text-3xl font-bold leading-none">Solo para administradores</h1>
          <p className="mt-3 text-tinta-suave">Tu cuenta no tiene permiso para ver esta página.</p>
        </div>
      );
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">{contenido}</main>
      <footer className="border-t border-regla py-4 text-center text-[0.9rem] text-tinta-suave">
        Gestor de Tareas, un cliente web en Next.js sobre una API REST en Spring Boot
      </footer>
    </div>
  );
}
