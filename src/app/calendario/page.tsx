import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { Calendario } from "@/components/calendario";

export const metadata: Metadata = {
  title: "Calendario · Gestor de Tareas",
};

export default function PaginaDelCalendario() {
  return (
    <AppShell>
      <Calendario />
    </AppShell>
  );
}
