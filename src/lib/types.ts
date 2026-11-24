/** Tipos que reflejan las respuestas de la API (gestor-tareas-java). */

export type Prioridad = "BAJA" | "MEDIA" | "ALTA";
export type Rol = "USER" | "ADMIN";

/** Importancia numérica de cada prioridad (mayor = más importante), para ordenar y dibujar. */
export const NIVEL_DE_PRIORIDAD: Record<Prioridad, number> = { BAJA: 1, MEDIA: 2, ALTA: 3 };
export type TipoNotificacion = "POR_VENCER" | "VENCIDA";

export interface Tarea {
  id: number;
  titulo: string;
  descripcion: string | null;
  completada: boolean;
  /** Fecha sin hora, formato AAAA-MM-DD. */
  fechaLimite: string | null;
  prioridad: Prioridad;
  etiquetas: string[];
  vencida: boolean;
  creadaEn: string;
  actualizadaEn: string;
}

/** Datos para crear o reemplazar una tarea. Si se omiten las etiquetas, la tarea se queda sin ellas. */
export interface TareaEntrada {
  titulo: string;
  descripcion?: string | null;
  fechaLimite?: string | null;
  prioridad?: Prioridad;
  etiquetas?: string[];
}

export interface Pagina<T> {
  contenido: T[];
  pagina: number;
  tamano: number;
  totalElementos: number;
  totalPaginas: number;
}

export interface Etiqueta {
  id: number;
  nombre: string;
  totalTareas: number;
}

export interface Notificacion {
  id: number;
  tareaId: number;
  tipo: TipoNotificacion;
  mensaje: string;
  leida: boolean;
  creadaEn: string;
}

export interface Perfil {
  id: number;
  nombreUsuario: string;
  email: string;
  rol: Rol;
}

export interface TokenRespuesta {
  token: string;
  tipo: string;
  expiraEnSegundos: number;
}

export interface UsuarioAdmin {
  id: number;
  nombreUsuario: string;
  email: string;
  rol: Rol;
  creadoEn: string;
  totalTareas: number;
}

export interface Estadisticas {
  totalUsuarios: number;
  totalTareas: number;
  tareasCompletadas: number;
  tareasPendientes: number;
  tareasVencidas: number;
}

export interface ResultadoRecordatorios {
  porVencer: number;
  vencidas: number;
}

/** Totales de las tareas del usuario (GET /api/tareas/resumen). */
export interface ResumenTareas {
  total: number;
  pendientes: number;
  hechas: number;
  vencidas: number;
  paraHoy: number;
  proximosSieteDias: number;
  sinPlazo: number;
  pendientesAlta: number;
  pendientesMedia: number;
  pendientesBaja: number;
}

export type Estado = "todas" | "pendientes" | "completadas";
export type Orden = "reciente" | "prioridad" | "fechaLimite" | "titulo";

export interface FiltrosTareas {
  q: string;
  estado: Estado;
  prioridad: Prioridad | "";
  etiqueta: string;
  soloVencidas: boolean;
  orden: Orden;
  pagina: number;
}
