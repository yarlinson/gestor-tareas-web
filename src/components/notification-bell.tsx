"use client";

import { useEffect, useId, useRef, useState } from "react";
import { formatearFechaYHora } from "@/lib/format";
import {
  useMarcarNotificacionLeida,
  useNotificacionesPendientes,
} from "@/lib/hooks";
import { Spinner } from "./ui";

/** Campana con el número de avisos sin leer y un papelito desplegable para revisarlos y marcarlos como leídos. */
export function NotificationBell() {
  const [abierto, setAbierto] = useState(false);
  const contenedor = useRef<HTMLDivElement>(null);
  const idDelPanel = useId();
  const consulta = useNotificacionesPendientes();
  const marcarLeida = useMarcarNotificacionLeida();

  const total = consulta.data?.totalElementos ?? 0;
  const avisos = consulta.data?.contenido ?? [];

  // Cierra el panel con un clic fuera o con Escape.
  useEffect(() => {
    if (!abierto) return;
    function alPulsar(evento: MouseEvent) {
      if (contenedor.current && !contenedor.current.contains(evento.target as Node)) {
        setAbierto(false);
      }
    }
    function alTeclear(evento: KeyboardEvent) {
      if (evento.key === "Escape") setAbierto(false);
    }
    document.addEventListener("mousedown", alPulsar);
    document.addEventListener("keydown", alTeclear);
    return () => {
      document.removeEventListener("mousedown", alPulsar);
      document.removeEventListener("keydown", alTeclear);
    };
  }, [abierto]);

  return (
    <div ref={contenedor} className="relative">
      <button
        type="button"
        onClick={() => setAbierto((valor) => !valor)}
        aria-expanded={abierto}
        aria-controls={idDelPanel}
        aria-label={total > 0 ? `Avisos: ${total} sin leer` : "Avisos"}
        className="relative p-2 text-tinta transition-colors hover:bg-regla/40"
      >
        <svg viewBox="0 0 24 24" className="h-[1.4rem] w-[1.4rem]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
        {total > 0 && (
          <span className="absolute -right-0.5 -top-0.5 min-w-[1.15rem] bg-tinta-roja px-1 text-center font-display text-[0.95rem] font-bold leading-[1.15rem] text-papel">
            {total > 99 ? "99+" : total}
          </span>
        )}
      </button>

      {abierto && (
        <div
          id={idDelPanel}
          className="absolute right-0 z-30 mt-2 w-80 max-w-[calc(100vw-2rem)] border-[1.5px] border-tinta bg-hoja shadow-[5px_5px_0_0_var(--regla-fuerte)]"
        >
          <h2 className="border-b-4 border-double border-regla-fuerte px-4 py-2.5 font-display text-2xl font-bold leading-none">
            Avisos sin leer
          </h2>
          <div className="max-h-96 overflow-y-auto">
            {consulta.isPending && (
              <div className="flex justify-center p-6 text-tinta-suave">
                <Spinner />
              </div>
            )}
            {!consulta.isPending && avisos.length === 0 && (
              <p className="px-4 py-6 text-center text-[0.95rem] text-tinta-suave">
                No tienes avisos pendientes. Aquí aparecerá una tarea cuando esté por vencer.
              </p>
            )}
            <ul>
              {avisos.map((aviso) => (
                <li key={aviso.id} className="border-b border-regla px-4 py-3 text-[0.98rem]">
                  <p className={aviso.tipo === "VENCIDA" ? "text-tinta-roja" : ""}>{aviso.mensaje}</p>
                  <div className="mt-1.5 flex items-center justify-between gap-2 text-[0.9rem] text-tinta-suave">
                    <time dateTime={aviso.creadaEn}>{formatearFechaYHora(aviso.creadaEn)}</time>
                    <button
                      type="button"
                      onClick={() => marcarLeida.mutate(aviso.id)}
                      disabled={marcarLeida.isPending}
                      className="font-display text-[1.05rem] font-semibold text-tinta-azul underline-offset-4 hover:underline disabled:opacity-50"
                    >
                      Marcar como leído
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          {total > avisos.length && (
            <p className="px-4 py-2 text-center text-[0.9rem] text-tinta-suave">
              Se muestran los {avisos.length} más recientes de {total}.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
