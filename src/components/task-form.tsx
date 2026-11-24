"use client";

import { useId, useState, type FormEvent } from "react";
import { ApiError } from "@/lib/api";
import { useEtiquetas, useGuardarTarea } from "@/lib/hooks";
import type { Prioridad, Tarea } from "@/lib/types";
import { NOMBRES_DE_PRIORIDAD, PRIORIDADES } from "./prioridad";
import { TagInput } from "./tag-input";
import { Alerta, CAMPO, Spinner, boton } from "./ui";

/** Formulario de creación y edición. Se monta de nuevo cada vez que se abre, así empieza limpio. */
export function TaskForm({
  tarea,
  onTerminar,
}: {
  tarea?: Tarea;
  onTerminar: () => void;
}) {
  const guardar = useGuardarTarea();
  const etiquetasDelUsuario = useEtiquetas();
  const idTitulo = useId();
  const idDescripcion = useId();
  const idPrioridad = useId();
  const idFecha = useId();

  const [titulo, setTitulo] = useState(tarea?.titulo ?? "");
  const [descripcion, setDescripcion] = useState(tarea?.descripcion ?? "");
  const [prioridad, setPrioridad] = useState<Prioridad>(tarea?.prioridad ?? "MEDIA");
  const [fechaLimite, setFechaLimite] = useState(tarea?.fechaLimite ?? "");
  const [etiquetas, setEtiquetas] = useState<string[]>(tarea?.etiquetas ?? []);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErrorGeneral(null);
    if (!titulo.trim()) {
      setErrores({ titulo: "El título es obligatorio." });
      return;
    }
    setErrores({});

    try {
      await guardar.mutateAsync({
        id: tarea?.id,
        datos: {
          titulo: titulo.trim(),
          descripcion: descripcion.trim() || null,
          fechaLimite: fechaLimite || null,
          prioridad,
          etiquetas,
        },
      });
      onTerminar();
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorGeneral(error.message);
        if (error.errores) setErrores(error.errores);
      } else {
        setErrorGeneral("Ocurrió un error inesperado. Inténtalo de nuevo.");
      }
    }
  }

  return (
    <form onSubmit={enviar} noValidate className="space-y-4">
      <div>
        <label htmlFor={idTitulo} className="mb-1 block text-sm font-medium">
          Título
        </label>
        <input
          id={idTitulo}
          className={CAMPO}
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          maxLength={150}
          autoFocus
          aria-invalid={Boolean(errores.titulo)}
        />
        {errores.titulo && (
          <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errores.titulo}</p>
        )}
      </div>

      <div>
        <label htmlFor={idDescripcion} className="mb-1 block text-sm font-medium">
          Descripción <span className="font-normal text-slate-500">(opcional)</span>
        </label>
        <textarea
          id={idDescripcion}
          className={`${CAMPO} min-h-24 resize-y`}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          maxLength={1000}
          aria-invalid={Boolean(errores.descripcion)}
        />
        {errores.descripcion && (
          <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errores.descripcion}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={idPrioridad} className="mb-1 block text-sm font-medium">
            Prioridad
          </label>
          <select
            id={idPrioridad}
            className={CAMPO}
            value={prioridad}
            onChange={(e) => setPrioridad(e.target.value as Prioridad)}
          >
            {PRIORIDADES.map((valor) => (
              <option key={valor} value={valor}>
                {NOMBRES_DE_PRIORIDAD[valor]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={idFecha} className="mb-1 block text-sm font-medium">
            Fecha límite <span className="font-normal text-slate-500">(opcional)</span>
          </label>
          <input
            id={idFecha}
            type="date"
            className={CAMPO}
            value={fechaLimite}
            onChange={(e) => setFechaLimite(e.target.value)}
          />
        </div>
      </div>

      <div>
        <span className="mb-1 block text-sm font-medium">Etiquetas</span>
        <TagInput
          valor={etiquetas}
          onChange={setEtiquetas}
          sugerencias={etiquetasDelUsuario.data?.map((etiqueta) => etiqueta.nombre) ?? []}
        />
        {errores.etiquetas && (
          <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errores.etiquetas}</p>
        )}
      </div>

      {errorGeneral && <Alerta>{errorGeneral}</Alerta>}

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onTerminar} className={boton("secundario")}>
          Cancelar
        </button>
        <button type="submit" className={boton()} disabled={guardar.isPending}>
          {guardar.isPending && <Spinner />}
          {tarea ? "Guardar cambios" : "Crear tarea"}
        </button>
      </div>
    </form>
  );
}
