/**
 * Guarda el token JWT en localStorage y avisa a React cuando cambia, para usarlo con
 * `useSyncExternalStore`. Si el navegador bloquea localStorage (modo privado, por ejemplo),
 * el token se conserva solo en memoria y la sesión dura hasta recargar la página.
 *
 * Compromiso de seguridad: un token en localStorage puede leerlo cualquier script que se
 * ejecute en la página (XSS). Por eso la aplicación no inserta HTML de terceros y todo el
 * contenido se muestra como texto. Una alternativa más estricta sería guardar el token en una
 * cookie httpOnly mediante un backend intermedio, a costa de más infraestructura.
 */

const CLAVE = "gestor-tareas.token";

const oyentes = new Set<() => void>();
let enMemoria: string | null = null;
let motivoDelCierre: string | null = null;

function avisar() {
  oyentes.forEach((oyente) => oyente());
}

function leerAlmacenado(): string | null {
  try {
    return window.localStorage.getItem(CLAVE) ?? enMemoria;
  } catch {
    return enMemoria;
  }
}

export const sesion = {
  leer(): string | null {
    if (typeof window === "undefined") return null;
    return leerAlmacenado();
  },

  guardar(token: string): void {
    enMemoria = token;
    motivoDelCierre = null;
    try {
      window.localStorage.setItem(CLAVE, token);
    } catch {
      // Se queda solo en memoria.
    }
    avisar();
  },

  /** Cierra la sesión; `motivo` se muestra después en la pantalla de acceso. */
  borrar(motivo?: string): void {
    enMemoria = null;
    motivoDelCierre = motivo ?? null;
    try {
      window.localStorage.removeItem(CLAVE);
    } catch {
      // Nada que borrar.
    }
    avisar();
  },

  motivoDelCierre(): string | null {
    return motivoDelCierre;
  },

  suscribir(oyente: () => void): () => void {
    oyentes.add(oyente);
    window.addEventListener("storage", oyente);
    return () => {
      oyentes.delete(oyente);
      window.removeEventListener("storage", oyente);
    };
  },
};
