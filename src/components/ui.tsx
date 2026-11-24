"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

type Variante = "primario" | "secundario" | "peligro" | "fantasma";

const VARIANTES: Record<Variante, string> = {
  primario: "boton boton-tinta",
  secundario: "boton boton-regla",
  peligro: "boton boton-roja",
  fantasma: "boton boton-texto",
};

/** Clases para un botón; se usa como `className={boton("primario")}`. Los estilos están en globals.css. */
export function boton(variante: Variante = "primario"): string {
  return VARIANTES[variante];
}

/** Campo de una línea (línea de escribir) que ocupa todo el ancho. */
export const CAMPO = "campo";

/** Igual, pero solo del ancho que necesita su contenido (por ejemplo, los selectores de filtro). */
export const CAMPO_AUTO = "campo campo-auto";

/** Recuadro para textos largos. */
export const CAMPO_CAJA = "campo-caja";

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

/** Los avisos se marcan con una raya a la izquierda: roja si algo falló, azul si salió bien. */
const TIPOS_DE_ALERTA = {
  error: "border-tinta-roja",
  aviso: "border-regla-fuerte",
  exito: "border-tinta-azul",
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
      className={`border-l-4 bg-hoja px-4 py-2.5 text-[0.95rem] ${TIPOS_DE_ALERTA[tipo]}`}
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
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto border-[1.5px] border-tinta bg-hoja p-0 text-tinta shadow-[6px_6px_0_0_var(--regla-fuerte)]"
    >
      {abierto && (
        <div className="px-6 pb-6 pt-5">
          <div className="mb-5 flex items-start justify-between gap-4 border-b-4 border-double border-regla-fuerte pb-3">
            <h2 id={idDelTitulo} className="font-display text-3xl font-bold leading-none">
              {titulo}
            </h2>
            <button
              type="button"
              onClick={onCerrar}
              aria-label="Cerrar"
              className="-m-1 p-1 text-tinta-suave hover:text-tinta"
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
