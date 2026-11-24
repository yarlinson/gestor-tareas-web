const formatoDeFecha = new Intl.DateTimeFormat("es-CO", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const formatoDeDiaYMes = new Intl.DateTimeFormat("es-CO", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

const formatoDeFechaLarga = new Intl.DateTimeFormat("es-CO", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const formatoDeFechaYHora = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "medium",
  timeStyle: "short",
});

/** "2030-01-31" -> "31 ene 2030". La fecha límite no tiene hora, por eso se formatea en UTC. */
export function formatearFecha(fecha: string): string {
  return formatoDeFecha.format(new Date(`${fecha}T00:00:00Z`));
}

/** "2030-01-31" -> "31 ene". Para espacios estrechos, como la columna de plazos. */
export function formatearDiaYMes(fecha: string): string {
  return formatoDeDiaYMes.format(new Date(`${fecha}T00:00:00Z`));
}

/** "2030-01-31" -> "jueves, 31 de enero de 2030". */
export function formatearFechaLarga(fecha: string): string {
  return formatoDeFechaLarga.format(new Date(`${fecha}T00:00:00Z`));
}

export function formatearFechaYHora(instante: string): string {
  return formatoDeFechaYHora.format(new Date(instante));
}

/** Pone en mayúscula solo la primera letra ("noviembre de 2026" -> "Noviembre de 2026"). */
export function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
