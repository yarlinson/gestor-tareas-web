"use client";

import { elegirTema, useTema } from "@/lib/tema";

/** Botón del encabezado para pasar del modo claro al oscuro y al revés. Recuerda la elección. */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const tema = useTema();
  const siguiente = tema === "oscuro" ? "claro" : "oscuro";

  return (
    <button
      type="button"
      onClick={() => elegirTema(siguiente)}
      aria-label={`Cambiar al modo ${siguiente}`}
      title={`Cambiar al modo ${siguiente}`}
      className={`border-[1.5px] border-tinta p-1.5 text-tinta transition-colors hover:bg-tinta hover:text-papel ${className}`}
    >
      {tema === "oscuro" ? (
        // En oscuro se ofrece el sol: lleva al modo claro.
        <svg viewBox="0 0 24 24" className="h-[1.15rem] w-[1.15rem]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        // En claro se ofrece la luna: lleva al modo oscuro.
        <svg viewBox="0 0 24 24" className="h-[1.15rem] w-[1.15rem]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20.5 14.2A8.5 8.5 0 1 1 9.8 3.5a6.7 6.7 0 0 0 10.7 10.7Z" />
        </svg>
      )}
    </button>
  );
}
