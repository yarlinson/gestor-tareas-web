import { sesion } from "./session";
import type {
  Estadisticas,
  Etiqueta,
  FiltrosTareas,
  Notificacion,
  Orden,
  Pagina,
  Perfil,
  ResultadoRecordatorios,
  Tarea,
  TareaEntrada,
  TokenRespuesta,
  UsuarioAdmin,
} from "./types";

/** Dirección base de la API. En producción se define con NEXT_PUBLIC_API_URL. */
export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"
).replace(/\/+$/, "");

export const TAMANO_DE_PAGINA = 10;

/** Error de una respuesta de la API (formato RFC 7807: `detail` y, al validar, `errores` por campo). */
export class ApiError extends Error {
  readonly estado: number;
  readonly errores: Record<string, string> | undefined;
  readonly reintentarEnSegundos: number | undefined;

  constructor(
    estado: number,
    mensaje: string,
    errores?: Record<string, string>,
    reintentarEnSegundos?: number,
  ) {
    super(mensaje);
    this.name = "ApiError";
    this.estado = estado;
    this.errores = errores;
    this.reintentarEnSegundos = reintentarEnSegundos;
  }
}

function mensajePorDefecto(estado: number): string {
  switch (estado) {
    case 400:
      return "Los datos enviados no son válidos.";
    case 401:
      return "Tu sesión expiró o las credenciales no son válidas.";
    case 403:
      return "No tienes permiso para hacer esto.";
    case 404:
      return "No se encontró lo que buscabas.";
    case 409:
      return "Ya existe un elemento con esos datos.";
    case 429:
      return "Demasiados intentos. Espera un momento antes de volver a intentar.";
    default:
      return "Ocurrió un error en el servidor. Inténtalo de nuevo.";
  }
}

interface Opciones {
  metodo?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  cuerpo?: unknown;
  /** Las rutas públicas (registro y login) no envían el token. */
  autenticada?: boolean;
}

async function solicitar<T>(
  ruta: string,
  { metodo = "GET", cuerpo, autenticada = true }: Opciones = {},
): Promise<T> {
  const cabeceras: Record<string, string> = { Accept: "application/json" };
  const token = autenticada ? sesion.leer() : null;
  if (token) cabeceras.Authorization = `Bearer ${token}`;
  if (cuerpo !== undefined) cabeceras["Content-Type"] = "application/json";

  let respuesta: Response;
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      method: metodo,
      headers: cabeceras,
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    });
  } catch {
    throw new ApiError(
      0,
      "No se pudo conectar con la API. Si hace rato que nadie la usa puede estar despertando (tarda de uno a tres minutos). Si persiste, revisa la dirección de la API y su configuración CORS.",
    );
  }

  const texto = await respuesta.text();
  let datos: unknown = null;
  if (texto) {
    try {
      datos = JSON.parse(texto);
    } catch {
      datos = null;
    }
  }

  if (!respuesta.ok) {
    if (respuesta.status === 401 && token) {
      sesion.borrar("Tu sesión expiró. Inicia sesión de nuevo.");
    }
    const problema = (datos ?? {}) as {
      detail?: string;
      errores?: Record<string, string>;
    };
    const espera = Number(respuesta.headers.get("Retry-After"));
    throw new ApiError(
      respuesta.status,
      problema.detail ?? mensajePorDefecto(respuesta.status),
      problema.errores,
      Number.isFinite(espera) && espera > 0 ? espera : undefined,
    );
  }
  return datos as T;
}

const ORDENES: Record<Orden, string> = {
  reciente: "creadaEn,desc",
  prioridad: "prioridad,desc",
  fechaLimite: "fechaLimite,asc",
  titulo: "titulo,asc",
};

function consultaDeTareas(filtros: FiltrosTareas): string {
  const parametros = new URLSearchParams();
  if (filtros.q.trim()) parametros.set("q", filtros.q.trim());
  if (filtros.estado === "pendientes") parametros.set("completada", "false");
  if (filtros.estado === "completadas") parametros.set("completada", "true");
  if (filtros.prioridad) parametros.set("prioridad", filtros.prioridad);
  if (filtros.etiqueta) parametros.set("etiqueta", filtros.etiqueta);
  if (filtros.soloVencidas) parametros.set("vencidas", "true");
  parametros.set("page", String(filtros.pagina));
  parametros.set("size", String(TAMANO_DE_PAGINA));
  parametros.set("sort", ORDENES[filtros.orden]);
  return parametros.toString();
}

export const api = {
  registrar: (datos: { nombreUsuario: string; email: string; password: string }) =>
    solicitar<TokenRespuesta>("/api/auth/registro", {
      metodo: "POST",
      cuerpo: datos,
      autenticada: false,
    }),

  iniciarSesion: (datos: { nombreUsuario: string; password: string }) =>
    solicitar<TokenRespuesta>("/api/auth/login", {
      metodo: "POST",
      cuerpo: datos,
      autenticada: false,
    }),

  perfil: () => solicitar<Perfil>("/api/me"),

  tareas: (filtros: FiltrosTareas) =>
    solicitar<Pagina<Tarea>>(`/api/tareas?${consultaDeTareas(filtros)}`),

  crearTarea: (datos: TareaEntrada) =>
    solicitar<Tarea>("/api/tareas", { metodo: "POST", cuerpo: datos }),

  actualizarTarea: (id: number, datos: TareaEntrada) =>
    solicitar<Tarea>(`/api/tareas/${id}`, { metodo: "PUT", cuerpo: datos }),

  cambiarEstado: (id: number, completada: boolean) =>
    solicitar<Tarea>(`/api/tareas/${id}/estado`, {
      metodo: "PATCH",
      cuerpo: { completada },
    }),

  eliminarTarea: (id: number) =>
    solicitar<void>(`/api/tareas/${id}`, { metodo: "DELETE" }),

  etiquetas: () => solicitar<Etiqueta[]>("/api/etiquetas"),

  eliminarEtiqueta: (id: number) =>
    solicitar<void>(`/api/etiquetas/${id}`, { metodo: "DELETE" }),

  notificacionesPendientes: () =>
    solicitar<Pagina<Notificacion>>("/api/notificaciones?leida=false&size=20"),

  marcarNotificacionLeida: (id: number) =>
    solicitar<Notificacion>(`/api/notificaciones/${id}/leida`, { metodo: "PATCH" }),

  admin: {
    usuarios: (pagina: number) =>
      solicitar<Pagina<UsuarioAdmin>>(
        `/api/admin/usuarios?page=${pagina}&size=${TAMANO_DE_PAGINA}`,
      ),
    estadisticas: () => solicitar<Estadisticas>("/api/admin/estadisticas"),
    generarRecordatorios: () =>
      solicitar<ResultadoRecordatorios>("/api/admin/recordatorios/generar", {
        metodo: "POST",
      }),
  },
};
