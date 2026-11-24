import type { Prioridad } from "@/lib/types";

export const NOMBRES_DE_PRIORIDAD: Record<Prioridad, string> = {
  BAJA: "Baja",
  MEDIA: "Media",
  ALTA: "Alta",
};

export const PRIORIDADES: Prioridad[] = ["ALTA", "MEDIA", "BAJA"];

const COLORES: Record<Prioridad, string> = {
  ALTA: "bg-rose-100 text-rose-700 ring-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-500/30",
  MEDIA:
    "bg-amber-100 text-amber-800 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30",
  BAJA: "bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-500/15 dark:text-slate-300 dark:ring-slate-500/30",
};

export function InsigniaDePrioridad({ prioridad }: { prioridad: Prioridad }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${COLORES[prioridad]}`}
    >
      Prioridad {NOMBRES_DE_PRIORIDAD[prioridad].toLowerCase()}
    </span>
  );
}
