"use client";

import { useState, type FormEvent } from "react";
import { useGuardarTarea } from "@/lib/hooks";
import { CAMPO_AUTO, Spinner, boton } from "./ui";

/** Barra para crear una tarea solo con su título; "Más opciones" abre el formulario completo. */
export function QuickAdd({ onMasOpciones }: { onMasOpciones: () => void }) {
  const guardar = useGuardarTarea();
  const [titulo, setTitulo] = useState("");

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
    <form onSubmit={enviar} aria-label="Agregar una tarea rápida">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          className={`${CAMPO_AUTO} min-w-0 flex-1`}
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          maxLength={150}
          placeholder="Agrega una tarea y pulsa Enter…"
          aria-label="Título de la nueva tarea"
        />
        <div className="flex gap-2">
          <button type="submit" className={`${boton()} flex-1 sm:flex-none`} disabled={guardar.isPending || !titulo.trim()}>
            {guardar.isPending && <Spinner />}
            Agregar
          </button>
          <button type="button" onClick={onMasOpciones} className={`${boton("secundario")} flex-1 sm:flex-none`}>
            Más opciones
          </button>
        </div>
      </div>
      {guardar.error && (
        <p role="alert" className="mt-2 text-sm text-rose-600 dark:text-rose-400">
          {guardar.error.message}
        </p>
      )}
    </form>
  );
}
