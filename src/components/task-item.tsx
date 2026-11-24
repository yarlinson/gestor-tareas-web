"use client";

import { useState } from "react";
import { useCambiarEstado, useEliminarTarea } from "@/lib/hooks";
import type { Tarea } from "@/lib/types";
import { Plazo } from "./plazo";
import { NivelDePrioridad } from "./prioridad";
import { boton } from "./ui";

/** Columnas de la hoja en pantallas anchas; las comparten el encabezado y cada fila. */
export const COLUMNAS_DE_LA_HOJA = "md:grid-cols-[5.4rem_minmax(0,1fr)_7.5rem_10.5rem]";

interface Propiedades {
  tarea: Tarea;
  hoy: string;
  onEditar: (tarea: Tarea) => void;
  onFiltrarPorEtiqueta: (etiqueta: string) => void;
}

/** Una línea de la hoja: plazo, tarea con sus etiquetas, prioridad y acciones. */
export function TaskItem({ tarea, hoy, onEditar, onFiltrarPorEtiqueta }: Propiedades) {
  const cambiarEstado = useCambiarEstado();
  const eliminar = useEliminarTarea();
  const [confirmando, setConfirmando] = useState(false);

  const error = cambiarEstado.error ?? eliminar.error;

  return (
    <li
      className={`grid grid-cols-[3.8rem_minmax(0,1fr)] gap-x-4 gap-y-2 border-b border-regla py-4 md:items-start md:gap-x-5 ${COLUMNAS_DE_LA_HOJA}`}
    >
      <div>
        <Plazo fecha={tarea.fechaLimite} completada={tarea.completada} hoy={hoy} />
      </div>

      <div className="min-w-0">
        <div className="flex items-start gap-3">
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
            className="casilla mt-1"
          />
          <div className="min-w-0">
            <p className="break-words text-[1.15rem] font-semibold leading-snug">
              <span className="tachado" data-hecha={tarea.completada}>
                {tarea.titulo}
              </span>
            </p>
            {tarea.descripcion && (
              <p className="mt-1 line-clamp-3 whitespace-pre-line break-words text-[0.98rem] text-tinta-suave">
                {tarea.descripcion}
              </p>
            )}
            {tarea.etiquetas.length > 0 && (
              <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                {tarea.etiquetas.map((etiqueta) => (
                  <li key={etiqueta}>
                    <button
                      type="button"
                      onClick={() => onFiltrarPorEtiqueta(etiqueta)}
                      title={`Ver solo las tareas con la etiqueta ${etiqueta}`}
                      className="font-display text-[1.05rem] font-semibold text-tinta-azul underline decoration-dotted underline-offset-4 hover:decoration-solid"
                    >
                      #{etiqueta}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="col-start-2 md:col-start-auto md:pt-1">
        <NivelDePrioridad prioridad={tarea.prioridad} />
      </div>

      <div className="col-start-2 flex flex-wrap items-center gap-x-1 md:col-start-auto md:justify-end">
        {confirmando ? (
          <>
            <span className="mr-1 font-display text-[1.05rem] font-semibold">¿Eliminar?</span>
            <button
              type="button"
              onClick={() => eliminar.mutate(tarea.id)}
              disabled={eliminar.isPending}
              className={`${boton("peligro")} boton-pequeno`}
            >
              Sí
            </button>
            <button
              type="button"
              onClick={() => setConfirmando(false)}
              className={`${boton("secundario")} boton-pequeno`}
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
              className={`${boton("fantasma")} boton-pequeno`}
            >
              Editar
            </button>
            <button
              type="button"
              onClick={() => setConfirmando(true)}
              aria-label={`Eliminar "${tarea.titulo}"`}
              className={`${boton("fantasma")} boton-pequeno`}
            >
              Eliminar
            </button>
          </>
        )}
      </div>

      {error && (
        <p role="alert" className="col-span-full text-sm text-tinta-roja">
          {error.message}
        </p>
      )}
    </li>
  );
}
