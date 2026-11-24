"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

type Variante = "primario" | "secundario" | "peligro" | "fantasma";

const BASE_BOTON =
  "inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-50";

const VARIANTES: Record<Variante, string> = {
  primario:
    "bg-indigo-600 text-white shadow-sm hover:bg-indigo-500 active:bg-indigo-700",
  secundario:
    "border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800",
  peligro: "bg-rose-600 text-white shadow-sm hover:bg-rose-500 active:bg-rose-700",
  fantasma:
    "text-slate-600 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:bg-slate-800",
};

/** Clases de Tailwind para un botón; se usa como `className={boton("primario")}`. */
export function boton(variante: Variante = "primario"): string {
  return `${BASE_BOTON} ${VARIANTES[variante]}`;
}

/** Clases comunes de los campos de formulario. */
const ESTILO_DE_CAMPO =
  "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:placeholder:text-slate-500";

/** Campo que ocupa todo el ancho disponible. */
export const CAMPO = `w-full ${ESTILO_DE_CAMPO}`;

/** Campo que solo ocupa lo que necesita su contenido (por ejemplo, los selectores de filtro). */
export const CAMPO_AUTO = ESTILO_DE_CAMPO;

export function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

const TIPOS_DE_ALERTA = {
  error:
    "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200",
  aviso:
    "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200",
  exito:
    "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200",
} as const;

export function Alerta({
  tipo = "error",
  children,
}: {
  tipo?: keyof typeof TIPOS_DE_ALERTA;
  children: ReactNode;
}) {
  return (
    <div
      role={tipo === "error" ? "alert" : "status"}
      className={`rounded-lg border px-3.5 py-2.5 text-sm ${TIPOS_DE_ALERTA[tipo]}`}
    >
      {children}
    </div>
  );
}

interface PropiedadesDeModal {
  abierto: boolean;
  titulo: string;
  onCerrar: () => void;
  children: ReactNode;
}

/**
 * Diálogo modal basado en el elemento nativo <dialog>: el navegador se encarga de atrapar el
 * foco, cerrar con Escape y bloquear el resto de la página. El contenido solo se monta mientras
 * está abierto, así cada apertura empieza con el formulario limpio.
 */
export function Modal({ abierto, titulo, onCerrar, children }: PropiedadesDeModal) {
  const referencia = useRef<HTMLDialogElement>(null);
  const idDelTitulo = useId();

  useEffect(() => {
    const dialogo = referencia.current;
    if (!dialogo) return;
    if (abierto && !dialogo.open) dialogo.showModal();
    if (!abierto && dialogo.open) dialogo.close();
  }, [abierto]);

  return (
    <dialog
      ref={referencia}
      aria-labelledby={idDelTitulo}
      onClose={onCerrar}
      onClick={(evento) => {
        // Un clic en el fondo oscurecido apunta al propio <dialog>.
        if (evento.target === referencia.current) onCerrar();
      }}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl bg-white p-0 text-slate-900 shadow-2xl dark:bg-slate-900 dark:text-slate-100"
    >
      {abierto && (
        <div className="p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <h2 id={idDelTitulo} className="text-lg font-semibold">
              {titulo}
            </h2>
            <button
              type="button"
              onClick={onCerrar}
              aria-label="Cerrar"
              className="-m-1 rounded-md p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <svg viewBox="0 0 20 20" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
              </svg>
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}
