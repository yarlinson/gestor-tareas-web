"use client";

import { useId, useState, type FormEvent } from "react";
import { useGuardarTarea } from "@/lib/hooks";
import { CAMPO, Spinner, boton } from "./ui";

/** La primera línea de la hoja: se escribe el título y Enter. "Más opciones" abre el formulario completo. */
export function QuickAdd({ onMasOpciones }: { onMasOpciones: () => void }) {
  const guardar = useGuardarTarea();
  const [titulo, setTitulo] = useState("");
  const idDelCampo = useId();

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const limpio = titulo.trim();
    if (!limpio) return;
    try {
      await guardar.mutateAsync({ datos: { titulo: limpio } });
      setTitulo("");
    } catch {
      // El error queda en guardar.error y se muestra debajo.
    }
  }

  return (
    <form onSubmit={enviar}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <label htmlFor={idDelCampo} className="sr-only">
            Título de la nueva tarea
          </label>
          <input
            id={idDelCampo}
            className={`${CAMPO} text-[1.2rem]`}
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            maxLength={150}
            placeholder="Escribe una tarea y pulsa Enter"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className={boton("primario")}
            disabled={guardar.isPending || !titulo.trim()}
          >
            {guardar.isPending && <Spinner />}
            Agregar
          </button>
          <button type="button" onClick={onMasOpciones} className={boton("secundario")}>
            Más opciones
          </button>
        </div>
      </div>
      {guardar.error && (
        <p role="alert" className="mt-2 text-sm text-tinta-roja">
          {guardar.error.message}
        </p>
      )}
    </form>
  );
}
