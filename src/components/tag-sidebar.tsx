"use client";

import { useState } from "react";
import { useEliminarEtiqueta, useEtiquetas } from "@/lib/hooks";
import { Spinner } from "./ui";

interface Propiedades {
  etiquetaActiva: string;
  onElegir: (etiqueta: string) => void;
}

/**
 * Índice de etiquetas del usuario: cada una con su número de tareas unido por una línea de
 * puntos, como en el índice de un libro. Sirve de filtro y permite borrarlas.
 */
export function TagSidebar({ etiquetaActiva, onElegir }: Propiedades) {
  const consulta = useEtiquetas();
  const eliminar = useEliminarEtiqueta();
  const [confirmandoId, setConfirmandoId] = useState<number | null>(null);

  return (
    <section aria-labelledby="titulo-etiquetas">
      <h2
        id="titulo-etiquetas"
        className="border-b-4 border-double border-regla-fuerte pb-2 font-display text-2xl font-bold leading-none"
      >
        Etiquetas
      </h2>

      {consulta.isPending && (
        <div className="flex justify-center py-5 text-tinta-suave">
          <Spinner />
        </div>
      )}
      {consulta.isError && (
        <p className="mt-3 text-[0.95rem] text-tinta-roja">No se pudieron cargar las etiquetas.</p>
      )}
      {consulta.data?.length === 0 && (
        <p className="mt-3 text-[0.95rem] text-tinta-suave">
          Aún no tienes etiquetas. Se crean al ponérselas a una tarea.
        </p>
      )}

      <ul className="mt-1">
        {consulta.data?.map((etiqueta) => {
          const activa = etiquetaActiva === etiqueta.nombre;
          return (
            <li key={etiqueta.id} className="flex items-baseline gap-2">
              <button
                type="button"
                onClick={() => onElegir(activa ? "" : etiqueta.nombre)}
                aria-pressed={activa}
                className="flex min-w-0 flex-1 items-baseline py-1.5 text-left"
              >
                <span
                  className={`truncate font-display text-[1.15rem] font-semibold ${
                    activa ? "text-tinta-azul underline underline-offset-4" : ""
                  }`}
                >
                  #{etiqueta.nombre}
                </span>
                <span
                  aria-hidden="true"
                  className="mx-2 min-w-4 flex-1 -translate-y-[0.3em] border-b border-dotted border-regla-fuerte"
                />
                <span className="font-display text-[1.15rem] tabular-nums text-tinta-suave">
                  {etiqueta.totalTareas}
                  <span className="sr-only"> tareas</span>
                </span>
              </button>

              {confirmandoId === etiqueta.id ? (
                <span className="flex shrink-0 items-center gap-2 font-display text-base font-semibold">
                  <button
                    type="button"
                    onClick={() => {
                      eliminar.mutate(etiqueta.id);
                      setConfirmandoId(null);
                      if (activa) onElegir("");
                    }}
                    className="text-tinta-roja underline underline-offset-4"
                  >
                    Borrar
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmandoId(null)}
                    className="text-tinta-suave hover:text-tinta"
                  >
                    No
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmandoId(etiqueta.id)}
                  aria-label={`Eliminar la etiqueta ${etiqueta.nombre}`}
                  className="shrink-0 px-1 font-display text-xl leading-none text-tinta-suave hover:text-tinta-roja"
                >
                  ×
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {eliminar.error && (
        <p role="alert" className="mt-2 text-sm text-tinta-roja">
          {eliminar.error.message}
        </p>
      )}
    </section>
  );
}
