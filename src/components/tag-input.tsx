"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { CAMPO } from "./ui";

const MAXIMO_DE_ETIQUETAS = 10;
const LARGO_MAXIMO = 30;

interface Propiedades {
  valor: string[];
  onChange: (etiquetas: string[]) => void;
  /** Etiquetas que el usuario ya tiene, ofrecidas como autocompletado. */
  sugerencias: string[];
}

/** Campo de etiquetas: se agregan con Enter o coma y se quitan con la "x" o con Retroceso. */
export function TagInput({ valor, onChange, sugerencias }: Propiedades) {
  const [texto, setTexto] = useState("");
  const idDeLaLista = useId();

  function agregar(crudo: string) {
    const nombre = crudo.trim().toLowerCase().slice(0, LARGO_MAXIMO);
    if (!nombre || valor.includes(nombre) || valor.length >= MAXIMO_DE_ETIQUETAS) return;
    onChange([...valor, nombre]);
  }

  function alTeclear(evento: KeyboardEvent<HTMLInputElement>) {
    if ((evento.key === "Enter" || evento.key === ",") && texto.trim()) {
      evento.preventDefault();
      agregar(texto);
      setTexto("");
    } else if (evento.key === "Backspace" && texto === "" && valor.length > 0) {
      onChange(valor.slice(0, -1));
    }
  }

  return (
    <div>
      {valor.length > 0 && (
        <ul className="mb-2 flex flex-wrap gap-1.5">
          {valor.map((etiqueta) => (
            <li
              key={etiqueta}
              className="inline-flex items-center gap-1 rounded-full bg-indigo-50 py-0.5 pl-2.5 pr-1 text-xs font-medium text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
            >
              {etiqueta}
              <button
                type="button"
                onClick={() => onChange(valor.filter((e) => e !== etiqueta))}
                aria-label={`Quitar la etiqueta ${etiqueta}`}
                className="rounded-full p-0.5 hover:bg-indigo-100 dark:hover:bg-indigo-500/30"
              >
                <svg viewBox="0 0 20 20" className="h-3 w-3" fill="currentColor" aria-hidden="true">
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
      <input
        className={CAMPO}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={alTeclear}
        onBlur={() => {
          agregar(texto);
          setTexto("");
        }}
        list={idDeLaLista}
        maxLength={LARGO_MAXIMO}
        disabled={valor.length >= MAXIMO_DE_ETIQUETAS}
        placeholder={
          valor.length >= MAXIMO_DE_ETIQUETAS
            ? "Máximo de etiquetas alcanzado"
            : "Escribe una etiqueta y pulsa Enter"
        }
        aria-label="Etiquetas"
      />
      <datalist id={idDeLaLista}>
        {sugerencias
          .filter((sugerencia) => !valor.includes(sugerencia))
          .map((sugerencia) => (
            <option key={sugerencia} value={sugerencia} />
          ))}
      </datalist>
      <p className="mt-1 text-xs text-slate-500">
        Hasta {MAXIMO_DE_ETIQUETAS} etiquetas de {LARGO_MAXIMO} caracteres como máximo.
      </p>
    </div>
  );
}
