"use client";

import { useSyncExternalStore } from "react";

export type Tema = "claro" | "oscuro";

const CLAVE = "gestor-tareas.tema";
const CONSULTA_OSCURO = "(prefers-color-scheme: dark)";

const oyentes = new Set<() => void>();

function leerElegido(): Tema | null {
  try {
    const guardado = window.localStorage.getItem(CLAVE);
    return guardado === "claro" || guardado === "oscuro" ? guardado : null;
  } catch {
    return null;
  }
}

function aplicar(tema: Tema): void {
  document.documentElement.dataset.tema = tema;
}

function avisar(): void {
  oyentes.forEach((oyente) => oyente());
}

/** El tema que se está mostrando: el guion del <head> ya lo dejó escrito en <html>. */
function temaActual(): Tema {
  return document.documentElement.dataset.tema === "oscuro" ? "oscuro" : "claro";
}

/** Guarda la elección de la persona y la aplica de inmediato. */
export function elegirTema(tema: Tema): void {
  try {
    window.localStorage.setItem(CLAVE, tema);
  } catch {
    // Sin almacenamiento, la elección dura hasta recargar la página.
  }
  aplicar(tema);
  avisar();
}

function suscribirse(alCambiar: () => void): () => void {
  oyentes.add(alCambiar);
  const sistema = window.matchMedia(CONSULTA_OSCURO);

  // Mientras no haya una elección guardada, el tema sigue al sistema también en vivo.
  function alCambiarElSistema() {
    if (leerElegido() === null) {
      aplicar(sistema.matches ? "oscuro" : "claro");
      avisar();
    }
  }
  // Si se cambia el tema en otra pestaña, esta se pone al día.
  function alCambiarElAlmacen(evento: StorageEvent) {
    if (evento.key !== CLAVE) return;
    const elegido = leerElegido();
    if (elegido) {
      aplicar(elegido);
      avisar();
    }
  }

  sistema.addEventListener("change", alCambiarElSistema);
  window.addEventListener("storage", alCambiarElAlmacen);
  return () => {
    oyentes.delete(alCambiar);
    sistema.removeEventListener("change", alCambiarElSistema);
    window.removeEventListener("storage", alCambiarElAlmacen);
  };
}

export function useTema(): Tema {
  return useSyncExternalStore(suscribirse, temaActual, () => "claro");
}
