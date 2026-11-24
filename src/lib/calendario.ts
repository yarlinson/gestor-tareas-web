import { NIVEL_DE_PRIORIDAD, type Tarea } from "./types";

/**
 * El calendario empieza la semana en lunes (0 = domingo, 1 = lunes ... 6 = sábado). Es el uso
 * habitual en Colombia; cambiar esta constante basta para empezar en domingo.
 */
export const PRIMER_DIA_DE_LA_SEMANA = 1;

/** Un mes concreto; `mes` va de 1 (enero) a 12 (diciembre). */
export interface MesVisible {
  anio: number;
  mes: number;
}

const MS_POR_DIA = 86_400_000;

// Todo se calcula con fechas "AAAA-MM-DD" y relojes en UTC, para que el huso horario del
// navegador no corra un día las celdas (una fecha límite no tiene hora).
function aISO(milisegundos: number): string {
  return new Date(milisegundos).toISOString().slice(0, 10);
}

function utc(anio: number, mes: number, dia: number): number {
  return Date.UTC(anio, mes - 1, dia);
}

/** El mes al que pertenece una fecha "AAAA-MM-DD". */
export function mesDe(fecha: string): MesVisible {
  const [anio, mes] = fecha.split("-").map(Number);
  return { anio, mes };
}

export function sumarMeses({ anio, mes }: MesVisible, cantidad: number): MesVisible {
  const total = anio * 12 + (mes - 1) + cantidad;
  return { anio: Math.floor(total / 12), mes: (total % 12) + 1 };
}

/**
 * Los días que se dibujan para un mes: semanas completas, de modo que la primera fila empieza
 * en el primer día de la semana y la última termina en el último (con días de los meses vecinos).
 */
export function diasDeLaCuadricula({ anio, mes }: MesVisible): string[] {
  const primero = utc(anio, mes, 1);
  const desplazamiento = (new Date(primero).getUTCDay() - PRIMER_DIA_DE_LA_SEMANA + 7) % 7;
  // El día 0 del mes siguiente es el último del mes actual.
  const diasDelMes = new Date(Date.UTC(anio, mes, 0)).getUTCDate();
  const semanas = Math.ceil((desplazamiento + diasDelMes) / 7);
  const inicio = primero - desplazamiento * MS_POR_DIA;
  return Array.from({ length: semanas * 7 }, (_, i) => aISO(inicio + i * MS_POR_DIA));
}

const formatoDelMes = new Intl.DateTimeFormat("es-CO", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** "noviembre de 2026" */
export function nombreDelMes({ anio, mes }: MesVisible): string {
  return formatoDelMes.format(new Date(utc(anio, mes, 1)));
}

const formatoDelDia = new Intl.DateTimeFormat("es-CO", { weekday: "short", timeZone: "UTC" });

/** Encabezados de columna: "lun", "mar", ... empezando por el primer día de la semana. */
export function nombresDeLosDias(): string[] {
  // El 1 de enero de 2024 fue lunes; desde ahí se avanza hasta el primer día configurado.
  const inicio = 1 + ((PRIMER_DIA_DE_LA_SEMANA + 6) % 7);
  return Array.from({ length: 7 }, (_, i) =>
    formatoDelDia.format(new Date(Date.UTC(2024, 0, inicio + i))).replace(".", ""),
  );
}

export function esDelMes(fecha: string, { anio, mes }: MesVisible): boolean {
  return fecha.startsWith(`${anio}-${String(mes).padStart(2, "0")}-`);
}

/** Dentro de un mismo día: primero las pendientes, y entre ellas las más importantes. */
export function ordenarDelDia(a: Tarea, b: Tarea): number {
  if (a.completada !== b.completada) return a.completada ? 1 : -1;
  return NIVEL_DE_PRIORIDAD[b.prioridad] - NIVEL_DE_PRIORIDAD[a.prioridad];
}

/** Agrupa las tareas con fecha límite por día ("AAAA-MM-DD"). Las que no tienen fecha se ignoran. */
export function agruparPorDia(tareas: Tarea[]): Map<string, Tarea[]> {
  const grupos = new Map<string, Tarea[]>();
  for (const tarea of tareas) {
    if (!tarea.fechaLimite) continue;
    const delDia = grupos.get(tarea.fechaLimite);
    if (delDia) delDia.push(tarea);
    else grupos.set(tarea.fechaLimite, [tarea]);
  }
  grupos.forEach((delDia) => delDia.sort(ordenarDelDia));
  return grupos;
}
