"use client";

import { useEffect, useId, useRef, useState } from "react";
import { formatearFechaYHora } from "@/lib/format";
import {
  useMarcarNotificacionLeida,
  useNotificacionesPendientes,
} from "@/lib/hooks";
import { Spinner } from "./ui";

/** Campana con el número de avisos sin leer y un panel para revisarlos y marcarlos como leídos. */
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
        aria-label={total > 0 ? `Notificaciones: ${total} sin leer` : "Notificaciones"}
        className="relative rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-500 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
        {total > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-semibold text-white">
            {total > 99 ? "99+" : total}
          </span>
        )}
      </button>

      {abierto && (
        <div
          id={idDelPanel}
          className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold dark:border-slate-800">
            Avisos sin leer
          </div>
          <div className="max-h-96 overflow-y-auto">
            {consulta.isPending && (
              <div className="flex justify-center p-6 text-slate-500">
                <Spinner />
              </div>
            )}
            {!consulta.isPending && avisos.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-slate-500">
                No tienes avisos pendientes. Te avisaremos cuando una tarea esté por vencer.
              </p>
            )}
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {avisos.map((aviso) => (
                <li key={aviso.id} className="px-4 py-3 text-sm">
                  <p className={aviso.tipo === "VENCIDA" ? "text-rose-700 dark:text-rose-300" : ""}>
                    {aviso.mensaje}
                  </p>
                  <div className="mt-1.5 flex items-center justify-between gap-2 text-xs text-slate-500">
                    <time dateTime={aviso.creadaEn}>{formatearFechaYHora(aviso.creadaEn)}</time>
                    <button
                      type="button"
                      onClick={() => marcarLeida.mutate(aviso.id)}
                      disabled={marcarLeida.isPending}
                      className="font-medium text-indigo-600 hover:underline disabled:opacity-50 dark:text-indigo-400"
                    >
                      Marcar como leído
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          {total > avisos.length && (
            <p className="border-t border-slate-200 px-4 py-2 text-center text-xs text-slate-500 dark:border-slate-800">
              Se muestran los {avisos.length} más recientes de {total}.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
