"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { API_URL, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { sesion } from "@/lib/session";
import { Marca } from "./marca";
import { PlazoVisual } from "./plazo";
import { NivelDePrioridad } from "./prioridad";
import { ThemeToggle } from "./theme-toggle";
import { Alerta, CAMPO, Spinner, boton } from "./ui";

type Modo = "entrar" | "crear";

const PATRON_DE_USUARIO = /^[A-Za-z0-9_.-]{3,50}$/;
const PATRON_DE_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ETIQUETA_DE_CAMPO = "mb-0.5 block font-display text-[1.1rem] font-semibold text-tinta-suave";

/** Tres líneas de ejemplo: enseñan a leer la columna de plazos antes de tener tareas propias. */
const EJEMPLO = [
  { numero: "1", etiqueta: "día", titulo: "Entregar el informe", prioridad: "ALTA", atraso: false },
  { numero: "6", etiqueta: "días", titulo: "Pagar la matrícula", prioridad: "MEDIA", atraso: false },
  { numero: "(2)", etiqueta: "de atraso", titulo: "Renovar el seguro", prioridad: "BAJA", atraso: true },
] as const;

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
    <div className="fondo-rayado relative min-h-screen">
      <ThemeToggle className="absolute right-4 top-4 bg-papel" />
      <div className="mx-auto grid min-h-screen max-w-5xl items-center gap-x-16 gap-y-10 px-6 py-12 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div>
          <Marca className="h-12 w-12" />
          <h1 className="mt-4 font-display text-[3.6rem] font-bold leading-[0.95] md:text-[4.8rem]">
            Gestor de Tareas
          </h1>
          <p className="mt-4 max-w-md text-[1.15rem] text-tinta-suave">
            Cada tarea con su plazo, su prioridad y sus etiquetas. La campana te avisa cuando una
            está por vencer.
          </p>

          <figure className="mt-9 hidden max-w-md md:block">
            <div aria-hidden="true" className="border-t-2 border-regla-fuerte bg-papel">
              {EJEMPLO.map((fila) => (
                <div
                  key={fila.titulo}
                  className="grid grid-cols-[4.4rem_minmax(0,1fr)_auto] items-center gap-x-4 border-b border-regla py-3"
                >
                  <PlazoVisual numero={fila.numero} etiqueta={fila.etiqueta} atraso={fila.atraso} />
                  <span className="text-[1.1rem] font-semibold">{fila.titulo}</span>
                  <NivelDePrioridad prioridad={fila.prioridad} />
                </div>
              ))}
            </div>
            <figcaption className="mt-2 text-[0.95rem] text-tinta-suave">
              Ejemplo: el número grande son los días que faltan; en rojo y entre paréntesis, los
              días de atraso.
            </figcaption>
          </figure>
        </div>

        <div className="border-[1.5px] border-tinta bg-hoja px-7 pb-7 pt-6 shadow-[6px_6px_0_0_var(--regla-fuerte)]">
          <div
            role="tablist"
            className="mb-6 flex gap-6 border-b border-regla font-display text-[1.4rem] font-semibold"
          >
            {(["entrar", "crear"] as const).map((valor) => (
              <button
                key={valor}
                type="button"
                role="tab"
                aria-selected={modo === valor}
                onClick={() => cambiarModo(valor)}
                className={`-mb-px border-b-[3px] pb-1.5 transition-colors ${
                  modo === valor
                    ? "border-tinta"
                    : "border-transparent text-tinta-suave hover:text-tinta"
                }`}
              >
                {valor === "entrar" ? "Iniciar sesión" : "Crear cuenta"}
              </button>
            ))}
          </div>

          <form onSubmit={enviar} noValidate className="space-y-5">
            {motivoDelCierre && <Alerta tipo="aviso">{motivoDelCierre}</Alerta>}

            <div>
              <label htmlFor={idUsuario} className={ETIQUETA_DE_CAMPO}>
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
                <p className="mt-1 text-sm text-tinta-roja">{errores.nombreUsuario}</p>
              )}
            </div>

            {modo === "crear" && (
              <div>
                <label htmlFor={idCorreo} className={ETIQUETA_DE_CAMPO}>
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
                {errores.email && <p className="mt-1 text-sm text-tinta-roja">{errores.email}</p>}
              </div>
            )}

            <div>
              <label htmlFor={idClave} className={ETIQUETA_DE_CAMPO}>
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
                <p className="mt-1 text-sm text-tinta-roja">{errores.password}</p>
              )}
            </div>

            {errorGeneral && <Alerta>{errorGeneral}</Alerta>}

            <button type="submit" className={`${boton("primario")} w-full`} disabled={enviando}>
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

          <p className="mt-6 text-[0.9rem] text-tinta-suave">
            Demo pública: no guardes datos reales.
          </p>
        </div>
      </div>
    </div>
  );
}
