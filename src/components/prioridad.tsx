import { NIVEL_DE_PRIORIDAD, type Prioridad } from "@/lib/types";

export const NOMBRES_DE_PRIORIDAD: Record<Prioridad, string> = {
  BAJA: "Baja",
  MEDIA: "Media",
  ALTA: "Alta",
};

export const PRIORIDADES: Prioridad[] = ["ALTA", "MEDIA", "BAJA"];

/**
 * La prioridad se lee por la forma, no por el color: tres barras de altura creciente, tantas
 * llenas como el nivel, y la palabra al lado. Así se entiende también sin distinguir colores,
 * y el rojo queda reservado para lo que está atrasado.
 */
export function NivelDePrioridad({ prioridad }: { prioridad: Prioridad }) {
  const nivel = NIVEL_DE_PRIORIDAD[prioridad];
  return (
    <span className="inline-flex items-center gap-2 font-display text-[1.1rem] font-semibold">
      <span aria-hidden="true" className="flex h-4 items-end gap-[3px]">
        {[1, 2, 3].map((barra) => (
          <span
            key={barra}
            className={`w-[4px] ${barra <= nivel ? "bg-tinta" : "bg-regla"}`}
            style={{ height: `${barra * 33}%` }}
          />
        ))}
      </span>
      <span className="sr-only">Prioridad </span>
      {NOMBRES_DE_PRIORIDAD[prioridad]}
    </span>
  );
}
