"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { API_URL, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { sesion } from "@/lib/session";
import { Alerta, CAMPO, Spinner, boton } from "./ui";

type Modo = "entrar" | "crear";

const PATRON_DE_USUARIO = /^[A-Za-z0-9_.-]{3,50}$/;
const PATRON_DE_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AuthForm() {
  const { iniciarSesion, registrar } = useAuth();
  const [modo, setModo] = useState<Modo>("entrar");
  const [usuario, setUsuario] = useState("");
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [tardando, setTardando] = useState(false);
  const idUsuario = useId();
  const idCorreo = useId();
  const idClave = useId();

  const motivoDelCierre = sesion.motivoDelCierre();

  // La API gratuita se duerme tras un rato sin uso. Este aviso silencioso la despierta mientras
  // la persona escribe sus datos (modo no-cors: no se lee la respuesta, solo importa que llegue).
  useEffect(() => {
    fetch(`${API_URL}/actuator/health`, { mode: "no-cors" }).catch(() => undefined);
  }, []);

  function cambiarModo(nuevo: Modo) {
    setModo(nuevo);
    setErrores({});
    setErrorGeneral(null);
  }

  function validar(): Record<string, string> {
    const problemas: Record<string, string> = {};
    if (!PATRON_DE_USUARIO.test(usuario.trim())) {
      problemas.nombreUsuario =
        "Entre 3 y 50 caracteres: letras, números, punto, guion y guion bajo.";
    }
    if (modo === "crear" && !PATRON_DE_CORREO.test(correo.trim())) {
      problemas.email = "Escribe un correo válido.";
    }
    if (modo === "crear" && (clave.length < 8 || clave.length > 72)) {
      problemas.password = "La contraseña debe tener entre 8 y 72 caracteres.";
    }
    if (modo === "entrar" && clave.length === 0) {
      problemas.password = "Escribe tu contraseña.";
    }
    return problemas;
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const problemas = validar();
    setErrores(problemas);
    setErrorGeneral(null);
    if (Object.keys(problemas).length > 0) return;

    setEnviando(true);
    const temporizador = window.setTimeout(() => setTardando(true), 6000);
    try {
      if (modo === "entrar") {
        await iniciarSesion(usuario.trim(), clave);
      } else {
        await registrar({
          nombreUsuario: usuario.trim(),
          email: correo.trim(),
          password: clave,
        });
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorGeneral(error.message);
        if (error.errores) setErrores(error.errores);
      } else {
        setErrorGeneral("Ocurrió un error inesperado. Inténtalo de nuevo.");
      }
    } finally {
      window.clearTimeout(temporizador);
      setTardando(false);
      setEnviando(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12.5 10 17.5 19 7.5" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Gestor de Tareas</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Organiza tus pendientes con prioridades, etiquetas y avisos de vencimiento.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-5 grid grid-cols-2 rounded-lg bg-slate-100 p-1 text-sm font-medium dark:bg-slate-800" role="tablist">
            {(["entrar", "crear"] as const).map((valor) => (
              <button
                key={valor}
                type="button"
                role="tab"
                aria-selected={modo === valor}
                onClick={() => cambiarModo(valor)}
                className={`rounded-md px-3 py-1.5 transition ${
                  modo === valor
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-950 dark:text-slate-100"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                {valor === "entrar" ? "Iniciar sesión" : "Crear cuenta"}
              </button>
            ))}
          </div>

          <form onSubmit={enviar} noValidate className="space-y-4">
            {motivoDelCierre && <Alerta tipo="aviso">{motivoDelCierre}</Alerta>}

            <div>
              <label htmlFor={idUsuario} className="mb-1 block text-sm font-medium">
                Nombre de usuario
              </label>
              <input
                id={idUsuario}
                className={CAMPO}
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                autoComplete="username"
                autoCapitalize="none"
                aria-invalid={Boolean(errores.nombreUsuario)}
                disabled={enviando}
              />
              {errores.nombreUsuario && (
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errores.nombreUsuario}</p>
              )}
            </div>

            {modo === "crear" && (
              <div>
                <label htmlFor={idCorreo} className="mb-1 block text-sm font-medium">
                  Correo electrónico
                </label>
                <input
                  id={idCorreo}
                  type="email"
                  className={CAMPO}
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  autoComplete="email"
                  aria-invalid={Boolean(errores.email)}
                  disabled={enviando}
                />
                {errores.email && (
                  <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errores.email}</p>
                )}
              </div>
            )}

            <div>
              <label htmlFor={idClave} className="mb-1 block text-sm font-medium">
                Contraseña
              </label>
              <input
                id={idClave}
                type="password"
                className={CAMPO}
                value={clave}
                onChange={(e) => setClave(e.target.value)}
                autoComplete={modo === "entrar" ? "current-password" : "new-password"}
                aria-invalid={Boolean(errores.password)}
                disabled={enviando}
              />
              {errores.password && (
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errores.password}</p>
              )}
            </div>

            {errorGeneral && <Alerta>{errorGeneral}</Alerta>}

            <button type="submit" className={`${boton()} w-full`} disabled={enviando}>
              {enviando && <Spinner />}
              {modo === "entrar" ? "Entrar" : "Crear cuenta"}
            </button>

            {tardando && (
              <Alerta tipo="aviso">
                Esto está tardando: si hace rato que nadie usa la aplicación, el servidor gratuito
                necesita de uno a tres minutos para despertar. No cierres la página.
              </Alerta>
            )}
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-500">
          Demo pública: no guardes datos reales. Cliente web de una API REST en Spring Boot.
        </p>
      </div>
    </div>
  );
}
