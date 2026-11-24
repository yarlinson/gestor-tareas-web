"use client";

import { useState } from "react";
import { formatearFecha } from "@/lib/format";
import { useCambiarEstado, useEliminarTarea } from "@/lib/hooks";
import type { Tarea } from "@/lib/types";
import { InsigniaDePrioridad } from "./prioridad";
import { boton } from "./ui";

interface Propiedades {
  tarea: Tarea;
  onEditar: (tarea: Tarea) => void;
  onFiltrarPorEtiqueta: (etiqueta: string) => void;
}

export function TaskItem({ tarea, onEditar, onFiltrarPorEtiqueta }: Propiedades) {
  const cambiarEstado = useCambiarEstado();
  const eliminar = useEliminarTarea();
  const [confirmando, setConfirmando] = useState(false);

  const error = cambiarEstado.error ?? eliminar.error;

  return (
    <li className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={tarea.completada}
          onChange={(e) => cambiarEstado.mutate({ id: tarea.id, completada: e.target.checked })}
          disabled={cambiarEstado.isPending}
          aria-label={
            tarea.completada
              ? `Marcar "${tarea.titulo}" como pendiente`
              : `Marcar "${tarea.titulo}" como completada`
          }
          className="mt-1 h-5 w-5 shrink-0 cursor-pointer rounded-full accent-indigo-600"
        />

        <div className="min-w-0 flex-1">
          <p
            className={`break-words font-medium ${
              tarea.completada ? "text-slate-400 line-through dark:text-slate-500" : ""
            }`}
          >
            {tarea.titulo}
          </p>
          {tarea.descripcion && (
            <p className="mt-1 line-clamp-3 whitespace-pre-line break-words text-sm text-slate-600 dark:text-slate-400">
              {tarea.descripcion}
            </p>
          )}

          <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
            <InsigniaDePrioridad prioridad={tarea.prioridad} />
            {tarea.fechaLimite && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium ring-1 ring-inset ${
                  tarea.vencida
                    ? "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/30"
                    : "bg-slate-50 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700"
                }`}
              >
                <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
                  <path d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" />
                </svg>
                {tarea.vencida ? "Vencida · " : ""}
                {formatearFecha(tarea.fechaLimite)}
              </span>
            )}
            {tarea.etiquetas.map((etiqueta) => (
              <button
                key={etiqueta}
                type="button"
                onClick={() => onFiltrarPorEtiqueta(etiqueta)}
                title={`Ver solo las tareas con la etiqueta ${etiqueta}`}
                className="rounded-full bg-indigo-50 px-2 py-0.5 font-medium text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-500/15 dark:text-indigo-300 dark:hover:bg-indigo-500/25"
              >
                #{etiqueta}
              </button>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {confirmando ? (
            <>
              <span className="mr-1 hidden text-xs text-slate-600 sm:inline dark:text-slate-300">
                ¿Eliminar?
              </span>
              <button
                type="button"
                onClick={() => eliminar.mutate(tarea.id)}
                disabled={eliminar.isPending}
                className={`${boton("peligro")} px-2.5 py-1 text-xs`}
              >
                Sí
              </button>
              <button
                type="button"
                onClick={() => setConfirmando(false)}
                className={`${boton("secundario")} px-2.5 py-1 text-xs`}
              >
                No
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onEditar(tarea)}
                aria-label={`Editar "${tarea.titulo}"`}
                className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                  <path d="m13.19 3.31 3.5 3.5-9.4 9.4a2 2 0 0 1-.85.5l-3.13.9a.5.5 0 0 1-.62-.62l.9-3.13a2 2 0 0 1 .5-.85l9.4-9.4a1.5 1.5 0 0 1 1.7-.3l-.02-.01a1.5 1.5 0 0 1-.02 1.9Z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setConfirmando(true)}
                aria-label={`Eliminar "${tarea.titulo}"`}
                className="rounded-md p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
              >
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.44c-.8.1-1.6.22-2.38.36a.75.75 0 1 0 .26 1.48l.15-.03.7 9.07A2.75 2.75 0 0 0 7.47 17.5h5.06a2.75 2.75 0 0 0 2.74-2.47l.7-9.07.15.03a.75.75 0 1 0 .26-1.48A41 41 0 0 0 14 4.19v-.44A2.75 2.75 0 0 0 11.25 1h-2.5ZM7.5 3.75c0-.69.56-1.25 1.25-1.25h2.5c.69 0 1.25.56 1.25 1.25v.32a40 40 0 0 0-5 0v-.32Z" clipRule="evenodd" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-2 text-xs text-rose-600 dark:text-rose-400">
          {error.message}
        </p>
      )}
    </li>
  );
}
