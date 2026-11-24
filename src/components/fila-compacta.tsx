"use client";

import { useCambiarEstado } from "@/lib/hooks";
import type { Tarea } from "@/lib/types";
import { Plazo } from "./plazo";
import { NivelDePrioridad } from "./prioridad";

interface Propiedades {
  tarea: Tarea;
  hoy: string;
  onEditar: (tarea: Tarea) => void;
  /** Muestra la columna del plazo; se oculta donde el contexto ya dice el día (calendario). */
  conPlazo?: boolean;
}

/** Una tarea en una lista apretada: casilla, título que abre la edición, prioridad y etiquetas. */
export function FilaCompacta({ tarea, hoy, onEditar, conPlazo = true }: Propiedades) {
  const cambiarEstado = useCambiarEstado();

  return (
    <li className="flex items-start gap-3 border-b border-regla py-3">
      {conPlazo && (
        <div className="w-14 shrink-0">
          <Plazo fecha={tarea.fechaLimite} completada={tarea.completada} hoy={hoy} compacto />
        </div>
      )}
      <input
        type="checkbox"
        checked={tarea.completada}
        onChange={(e) => cambiarEstado.mutate({ id: tarea.id, completada: e.target.checked })}
        disabled={cambiarEstado.isPending}
        aria-label={
          tarea.completada
            ? `Marcar "${tarea.titulo}" como pendiente`
            : `Marcar "${tarea.titulo}" como hecha`
        }
        className="casilla mt-0.5"
      />
      <div className="min-w-0 flex-1">
        <button
          type="button"
          onClick={() => onEditar(tarea)}
          title="Editar la tarea"
          className="block max-w-full break-words text-left font-semibold leading-snug underline-offset-4 hover:underline"
        >
          <span className="tachado" data-hecha={tarea.completada}>
            {tarea.titulo}
          </span>
        </button>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
          <NivelDePrioridad prioridad={tarea.prioridad} />
          {tarea.etiquetas.map((etiqueta) => (
            <span key={etiqueta} className="font-display text-[1.05rem] font-semibold text-tinta-azul">
              #{etiqueta}
            </span>
          ))}
        </div>
        {cambiarEstado.error && (
          <p role="alert" className="mt-1 text-sm text-tinta-roja">
            {cambiarEstado.error.message}
          </p>
        )}
      </div>
    </li>
  );
}
