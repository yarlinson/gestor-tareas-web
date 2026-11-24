import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { TaskBoard } from "@/components/task-board";

export const metadata: Metadata = {
  title: "Tareas · Gestor de Tareas",
};

export default function PaginaDeTareas() {
  return (
    <AppShell>
      <TaskBoard />
    </AppShell>
  );
}
