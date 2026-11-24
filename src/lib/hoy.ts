"use client";

import { useSyncExternalStore } from "react";

/**
 * Zona horaria con la que se decide qué día es "hoy". Debe coincidir con `APP_TIMEZONE` de la
 * API (por defecto America/Bogota), que es quien marca una tarea como vencida; así el número de
 * días que se muestra y la marca de "vencida" nunca se contradicen.
 */
export const ZONA_HORARIA = "America/Bogota";

// "en-CA" da el formato AAAA-MM-DD, el mismo que usa la API para las fechas.
const formatoDeHoy = new Intl.DateTimeFormat("en-CA", {
  timeZone: ZONA_HORARIA,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function hoyEnLaZona(): string {
  return formatoDeHoy.format(new Date());
}

// Se vuelve a comprobar cada minuto: si la hoja queda abierta pasada la medianoche, los plazos
// se actualizan solos.
function suscribirse(avisar: () => void): () => void {
  const temporizador = setInterval(avisar, 60_000);
  return () => clearInterval(temporizador);
}

/** La fecha de hoy (AAAA-MM-DD). Vale "" mientras se hidrata la página. */
export function useHoy(): string {
  return useSyncExternalStore(suscribirse, hoyEnLaZona, () => "");
}

function aDias(fecha: string): number {
  const [anio, mes, dia] = fecha.split("-").map(Number);
  return Date.UTC(anio, mes - 1, dia) / 86_400_000;
}

/** Días que faltan desde `hoy` hasta `fecha` (negativo si ya pasó). Ambas en formato AAAA-MM-DD. */
export function diasHasta(fecha: string, hoy: string): number {
  return Math.round(aDias(fecha) - aDias(hoy));
}
