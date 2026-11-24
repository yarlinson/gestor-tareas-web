import type { Metadata } from "next";
import { AdminPanel } from "@/components/admin-panel";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
  title: "Administración · Gestor de Tareas",
};

export default function PaginaDeAdministracion() {
  return (
    <AppShell soloAdmin>
      <AdminPanel />
    </AppShell>
  );
}
