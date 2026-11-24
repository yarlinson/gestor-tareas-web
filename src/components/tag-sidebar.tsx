"use client";

import { useState } from "react";
import { useEliminarEtiqueta, useEtiquetas } from "@/lib/hooks";
import { Spinner } from "./ui";

interface Propiedades {
  etiquetaActiva: string;
  onElegir: (etiqueta: string) => void;
}

/** Lista de etiquetas del usuario con el número de tareas; sirve de filtro y permite borrarlas. */
export function TagSidebar({ etiquetaActiva, onElegir }: Propiedades) {
  const consulta = useEtiquetas();
  const eliminar = useEliminarEtiqueta();
  const [confirmandoId, setConfirmandoId] = useState<number | null>(null);

  return (
    <section
      aria-labelledby="titulo-etiquetas"
      className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
    >
      <h2 id="titulo-etiquetas" className="mb-3 text-sm font-semibold">
        Etiquetas
      </h2>

      {consulta.isPending && (
        <div className="flex justify-center py-4 text-slate-500">
          <Spinner />
        </div>
      )}
      {consulta.isError && (
        <p className="text-sm text-rose-600 dark:text-rose-400">No se pudieron cargar las etiquetas.</p>
      )}
      {consulta.data?.length === 0 && (
        <p className="text-sm text-slate-500">
          Aún no tienes etiquetas. Se crean al asignarlas a una tarea.
        </p>
      )}

      <ul className="space-y-1">
        {consulta.data?.map((etiqueta) => {
          const activa = etiquetaActiva === etiqueta.nombre;
          return (
            <li key={etiqueta.id} className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onElegir(activa ? "" : etiqueta.nombre)}
                aria-pressed={activa}
                className={`flex min-w-0 flex-1 items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-sm transition ${
                  activa
                    ? "bg-indigo-50 font-medium text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                <span className="truncate">#{etiqueta.nombre}</span>
                <span className="shrink-0 text-xs text-slate-500">{etiqueta.totalTareas}</span>
              </button>

              {confirmandoId === etiqueta.id ? (
                <span className="flex shrink-0 items-center gap-1 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      eliminar.mutate(etiqueta.id);
                      setConfirmandoId(null);
                      if (activa) onElegir("");
                    }}
                    className="rounded px-1.5 py-1 font-medium text-rose-700 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-500/10"
                  >
                    Borrar
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmandoId(null)}
                    className="rounded px-1.5 py-1 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    No
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmandoId(etiqueta.id)}
                  aria-label={`Eliminar la etiqueta ${etiqueta.nombre}`}
                  className="shrink-0 rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
                >
                  <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
                    <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                  </svg>
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {eliminar.error && (
        <p role="alert" className="mt-2 text-xs text-rose-600 dark:text-rose-400">
          {eliminar.error.message}
        </p>
      )}
    </section>
  );
}
