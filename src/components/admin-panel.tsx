"use client";

import { useState } from "react";
import { formatearFechaYHora } from "@/lib/format";
import {
  useEstadisticas,
  useGenerarRecordatorios,
  useUsuariosAdmin,
} from "@/lib/hooks";
import { Alerta, Spinner, boton } from "./ui";

const TITULO_DE_SECCION =
  "border-b-4 border-double border-regla-fuerte pb-2 font-display text-2xl font-bold leading-none";

/** Una línea del balance: concepto, línea de puntos y cantidad. Lo atrasado va en rojo y entre paréntesis. */
function Fila({ concepto, valor, atraso = false }: { concepto: string; valor: number; atraso?: boolean }) {
  const enRojo = atraso && valor > 0;
  return (
    <div className="flex items-baseline py-1.5">
      <dt className="font-display text-[1.3rem] font-semibold">{concepto}</dt>
      <span
        aria-hidden="true"
        className="mx-2 min-w-4 flex-1 -translate-y-[0.3em] border-b border-dotted border-regla-fuerte"
      />
      <dd
        className={`font-display text-[1.6rem] font-bold tabular-nums ${enRojo ? "text-tinta-roja" : ""}`}
      >
        {enRojo ? `(${valor})` : valor}
      </dd>
    </div>
  );
}

export function AdminPanel() {
  const [pagina, setPagina] = useState(0);
  const estadisticas = useEstadisticas();
  const usuarios = useUsuariosAdmin(pagina);
  const recordatorios = useGenerarRecordatorios();

  return (
    <div className="space-y-12">
      <div>
        <h1 className="font-display text-[2.8rem] font-bold leading-none">Administración</h1>
        <p className="mt-2 text-tinta-suave">Totales de toda la aplicación y usuarios registrados.</p>
      </div>

      <section aria-labelledby="titulo-balance" className="max-w-xl">
        <h2 id="titulo-balance" className={TITULO_DE_SECCION}>
          Balance
        </h2>
        {estadisticas.isPending && (
          <div className="flex justify-center py-8 text-tinta-suave">
            <Spinner className="h-5 w-5" />
          </div>
        )}
        {estadisticas.isError && (
          <div className="mt-3">
            <Alerta>{estadisticas.error.message}</Alerta>
          </div>
        )}
        {estadisticas.data && (
          <dl className="mt-2">
            <Fila concepto="Usuarios" valor={estadisticas.data.totalUsuarios} />
            <Fila concepto="Tareas" valor={estadisticas.data.totalTareas} />
            <Fila concepto="Hechas" valor={estadisticas.data.tareasCompletadas} />
            <Fila concepto="Pendientes" valor={estadisticas.data.tareasPendientes} />
            <Fila concepto="Vencidas" valor={estadisticas.data.tareasVencidas} atraso />
          </dl>
        )}
      </section>

      <section aria-labelledby="titulo-recordatorios" className="max-w-xl">
        <h2 id="titulo-recordatorios" className={TITULO_DE_SECCION}>
          Recordatorios
        </h2>
        <p className="mt-3 text-tinta-suave">
          Los avisos de tareas por vencer y vencidas se generan cada hora y al arrancar el servidor.
          Puedes ejecutarlos ahora; no se repiten los avisos que ya existen.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => recordatorios.mutate()}
            disabled={recordatorios.isPending}
            className={boton("primario")}
          >
            {recordatorios.isPending && <Spinner />}
            Generar recordatorios ahora
          </button>
        </div>
        <div className="mt-3">
          {recordatorios.data && (
            <Alerta tipo="exito">
              Listo: {recordatorios.data.porVencer} avisos de tareas por vencer y{" "}
              {recordatorios.data.vencidas} de tareas vencidas.
            </Alerta>
          )}
          {recordatorios.error && <Alerta>{recordatorios.error.message}</Alerta>}
        </div>
      </section>

      <section aria-labelledby="titulo-usuarios">
        <h2 id="titulo-usuarios" className={TITULO_DE_SECCION}>
          Usuarios
        </h2>
        {usuarios.isPending && (
          <div className="flex justify-center py-8 text-tinta-suave">
            <Spinner className="h-5 w-5" />
          </div>
        )}
        {usuarios.isError && (
          <div className="mt-3">
            <Alerta>{usuarios.error.message}</Alerta>
          </div>
        )}
        {usuarios.data && (
          <>
            <div className="overflow-x-auto">
              <table className="mt-2 w-full min-w-[34rem] text-left">
                <thead>
                  <tr className="border-b-2 border-regla-fuerte font-display text-[1.1rem] font-semibold text-tinta-suave">
                    <th scope="col" className="py-2 pr-4">Usuario</th>
                    <th scope="col" className="py-2 pr-4">Correo</th>
                    <th scope="col" className="py-2 pr-4">Rol</th>
                    <th scope="col" className="py-2 pr-4 text-right">Tareas</th>
                    <th scope="col" className="py-2">Registro</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.data.contenido.map((usuario) => (
                    <tr key={usuario.id} className="border-b border-regla">
                      <td className="py-2.5 pr-4 font-semibold">{usuario.nombreUsuario}</td>
                      <td className="py-2.5 pr-4 text-tinta-suave">{usuario.email}</td>
                      <td className="py-2.5 pr-4">
                        {usuario.rol === "ADMIN" ? (
                          <span className="font-display text-[1.1rem] font-bold text-tinta-azul">
                            Administrador
                          </span>
                        ) : (
                          <span className="text-tinta-suave">Usuario</span>
                        )}
                      </td>
                      <td className="py-2.5 pr-4 text-right font-display text-[1.2rem] font-semibold tabular-nums">
                        {usuario.totalTareas}
                      </td>
                      <td className="whitespace-nowrap py-2.5 text-[0.95rem] text-tinta-suave">
                        {formatearFechaYHora(usuario.creadoEn)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="regla-doble flex flex-wrap items-center justify-between gap-3 pt-3 font-display text-[1.2rem] font-semibold">
              <p>
                {usuarios.data.totalElementos === 1
                  ? "1 usuario"
                  : `${usuarios.data.totalElementos} usuarios`}
              </p>
              {usuarios.data.totalPaginas > 1 && (
                <nav aria-label="Paginación de usuarios" className="flex items-center gap-2">
                  <button
                    type="button"
                    className={`${boton("fantasma")} boton-pequeno`}
                    disabled={pagina === 0}
                    onClick={() => setPagina((actual) => actual - 1)}
                  >
                    Anterior
                  </button>
                  <span className="font-medium tabular-nums text-tinta-suave">
                    Página {usuarios.data.pagina + 1} de {usuarios.data.totalPaginas}
                  </span>
                  <button
                    type="button"
                    className={`${boton("fantasma")} boton-pequeno`}
                    disabled={pagina + 1 >= usuarios.data.totalPaginas}
                    onClick={() => setPagina((actual) => actual + 1)}
                  >
                    Siguiente
                  </button>
                </nav>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
