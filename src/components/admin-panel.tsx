"use client";

import { useState } from "react";
import { formatearFechaYHora } from "@/lib/format";
import {
  useEstadisticas,
  useGenerarRecordatorios,
  useUsuariosAdmin,
} from "@/lib/hooks";
import { Alerta, Spinner, boton } from "./ui";

function Tarjeta({ titulo, valor, destacado = false }: { titulo: string; valor: number; destacado?: boolean }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm text-slate-500">{titulo}</p>
      <p
        className={`mt-1 text-3xl font-semibold tabular-nums ${
          destacado && valor > 0 ? "text-rose-600 dark:text-rose-400" : ""
        }`}
      >
        {valor}
      </p>
    </div>
  );
}

export function AdminPanel() {
  const [pagina, setPagina] = useState(0);
  const estadisticas = useEstadisticas();
  const usuarios = useUsuariosAdmin(pagina);
  const recordatorios = useGenerarRecordatorios();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold">Administración</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Totales de toda la aplicación y usuarios registrados.
        </p>
      </div>

      <section aria-label="Estadísticas">
        {estadisticas.isPending && (
          <div className="flex justify-center py-8 text-slate-500">
            <Spinner className="h-5 w-5" />
          </div>
        )}
        {estadisticas.isError && <Alerta>{estadisticas.error.message}</Alerta>}
        {estadisticas.data && (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            <Tarjeta titulo="Usuarios" valor={estadisticas.data.totalUsuarios} />
            <Tarjeta titulo="Tareas" valor={estadisticas.data.totalTareas} />
            <Tarjeta titulo="Completadas" valor={estadisticas.data.tareasCompletadas} />
            <Tarjeta titulo="Pendientes" valor={estadisticas.data.tareasPendientes} />
            <Tarjeta titulo="Vencidas" valor={estadisticas.data.tareasVencidas} destacado />
          </div>
        )}
      </section>

      <section
        aria-labelledby="titulo-recordatorios"
        className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
      >
        <h2 id="titulo-recordatorios" className="font-semibold">
          Recordatorios
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Los avisos de tareas por vencer y vencidas se generan cada hora y al arrancar el servidor.
          Puedes ejecutarlos ahora; no se repiten avisos que ya existen.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => recordatorios.mutate()}
            disabled={recordatorios.isPending}
            className={boton()}
          >
            {recordatorios.isPending && <Spinner />}
            Generar recordatorios ahora
          </button>
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
        <h2 id="titulo-usuarios" className="mb-3 font-semibold">
          Usuarios
        </h2>
        {usuarios.isPending && (
          <div className="flex justify-center py-8 text-slate-500">
            <Spinner className="h-5 w-5" />
          </div>
        )}
        {usuarios.isError && <Alerta>{usuarios.error.message}</Alerta>}
        {usuarios.data && (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/50">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-medium">Usuario</th>
                    <th scope="col" className="px-4 py-3 font-medium">Correo</th>
                    <th scope="col" className="px-4 py-3 font-medium">Rol</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">Tareas</th>
                    <th scope="col" className="px-4 py-3 font-medium">Registro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {usuarios.data.contenido.map((usuario) => (
                    <tr key={usuario.id}>
                      <td className="px-4 py-3 font-medium">{usuario.nombreUsuario}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{usuario.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            usuario.rol === "ADMIN"
                              ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          {usuario.rol === "ADMIN" ? "Administrador" : "Usuario"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{usuario.totalTareas}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600 dark:text-slate-400">
                        {formatearFechaYHora(usuario.creadoEn)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {usuarios.data.totalPaginas > 1 && (
              <nav
                aria-label="Paginación de usuarios"
                className="flex items-center justify-between border-t border-slate-200 px-4 py-3 dark:border-slate-800"
              >
                <button
                  type="button"
                  className={boton("secundario")}
                  disabled={pagina === 0}
                  onClick={() => setPagina((actual) => actual - 1)}
                >
                  Anterior
                </button>
                <span className="text-sm text-slate-500">
                  Página {usuarios.data.pagina + 1} de {usuarios.data.totalPaginas}
                </span>
                <button
                  type="button"
                  className={boton("secundario")}
                  disabled={pagina + 1 >= usuarios.data.totalPaginas}
                  onClick={() => setPagina((actual) => actual + 1)}
                >
                  Siguiente
                </button>
              </nav>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
