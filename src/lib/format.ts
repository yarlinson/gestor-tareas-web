const formatoDeFecha = new Intl.DateTimeFormat("es-CO", {
  day: "numeric",
  month: "short",
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

export function formatearFechaYHora(instante: string): string {
  return formatoDeFechaYHora.format(new Date(instante));
}
