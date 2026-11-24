"use client";

import { useMemo, useState } from "react";
import { useTareas } from "@/lib/hooks";
import type { Estado, FiltrosTareas, Orden, Prioridad, Tarea } from "@/lib/types";
import { useValorDiferido } from "@/lib/use-valor-diferido";
import { NOMBRES_DE_PRIORIDAD, PRIORIDADES } from "./prioridad";
import { QuickAdd } from "./quick-add";
import { TagSidebar } from "./tag-sidebar";
import { TaskForm } from "./task-form";
import { TaskItem } from "./task-item";
import { Alerta, CAMPO, CAMPO_AUTO, Modal, Spinner, boton } from "./ui";

const FILTROS_INICIALES: FiltrosTareas = {
  q: "",
  estado: "todas",
  prioridad: "",
  etiqueta: "",
  soloVencidas: false,
  orden: "reciente",
  pagina: 0,
};

const ESTADOS: { valor: Estado; texto: string }[] = [
  { valor: "todas", texto: "Todas" },
  { valor: "pendientes", texto: "Pendientes" },
  { valor: "completadas", texto: "Completadas" },
];

const ORDENES: { valor: Orden; texto: string }[] = [
  { valor: "reciente", texto: "Más recientes" },
  { valor: "prioridad", texto: "Prioridad (alta primero)" },
  { valor: "fechaLimite", texto: "Fecha límite (próximas primero)" },
  { valor: "titulo", texto: "Título (A-Z)" },
];

function Esqueleto() {
  return (
    <ul aria-hidden="true" className="space-y-3">
      {[0, 1, 2].map((i) => (
        <li key={i} className="h-20 animate-pulse rounded-xl bg-slate-200/70 dark:bg-slate-800/70" />
      ))}
    </ul>
  );
}

export function TaskBoard() {
  const [filtros, setFiltros] = useState<FiltrosTareas>(FILTROS_INICIALES);
  const [busqueda, setBusqueda] = useState("");
  // `undefined` = modal cerrado; `null` = creando; una tarea = editándola.
  const [edicion, setEdicion] = useState<Tarea | null | undefined>(undefined);

  const busquedaDiferida = useValorDiferido(busqueda, 350);
  const filtrosDeLaConsulta = useMemo(
    () => ({ ...filtros, q: busquedaDiferida }),
    [filtros, busquedaDiferida],
  );
  const consulta = useTareas(filtrosDeLaConsulta);

  function cambiar(parcial: Partial<FiltrosTareas>) {
    // Cualquier cambio de filtro vuelve a la primera página; solo la paginación la conserva.
    setFiltros((previos) => ({ ...previos, pagina: 0, ...parcial }));
  }

  const hayFiltros =
    busqueda !== "" ||
    filtros.estado !== "todas" ||
    filtros.prioridad !== "" ||
    filtros.etiqueta !== "" ||
    filtros.soloVencidas;

  function limpiarFiltros() {
    setBusqueda("");
    setFiltros((previos) => ({ ...FILTROS_INICIALES, orden: previos.orden }));
  }

  const pagina = consulta.data;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_16rem]">
      <div className="min-w-0 space-y-5">
        <QuickAdd onMasOpciones={() => setEdicion(null)} />

        <section aria-label="Filtros" className="space-y-3">
          <div className="relative">
            <svg viewBox="0 0 20 20" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.45 4.39l3.58 3.58a.75.75 0 1 1-1.06 1.06l-3.58-3.58A7 7 0 0 1 2 9Z" clipRule="evenodd" />
            </svg>
            <input
              type="search"
              className={`${CAMPO} pl-9`}
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setFiltros((previos) => ({ ...previos, pagina: 0 }));
              }}
              placeholder="Buscar en título y descripción"
              aria-label="Buscar tareas"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div role="group" aria-label="Estado" className="inline-flex rounded-lg bg-slate-100 p-1 text-sm dark:bg-slate-800">
              {ESTADOS.map((estado) => (
                <button
                  key={estado.valor}
                  type="button"
                  aria-pressed={filtros.estado === estado.valor}
                  onClick={() => cambiar({ estado: estado.valor })}
                  className={`rounded-md px-3 py-1 font-medium transition ${
                    filtros.estado === estado.valor
                      ? "bg-white text-slate-900 shadow-sm dark:bg-slate-950 dark:text-slate-100"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  {estado.texto}
                </button>
              ))}
            </div>

            <select
              className={CAMPO_AUTO}
              value={filtros.prioridad}
              onChange={(e) => cambiar({ prioridad: e.target.value as Prioridad | "" })}
              aria-label="Filtrar por prioridad"
            >
              <option value="">Toda prioridad</option>
              {PRIORIDADES.map((valor) => (
                <option key={valor} value={valor}>
                  Prioridad {NOMBRES_DE_PRIORIDAD[valor].toLowerCase()}
                </option>
              ))}
            </select>

            <select
              className={CAMPO_AUTO}
              value={filtros.orden}
              onChange={(e) => cambiar({ orden: e.target.value as Orden })}
              aria-label="Ordenar por"
            >
              {ORDENES.map((orden) => (
                <option key={orden.valor} value={orden.valor}>
                  {orden.texto}
                </option>
              ))}
            </select>

            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900">
              <input
                type="checkbox"
                checked={filtros.soloVencidas}
                onChange={(e) => cambiar({ soloVencidas: e.target.checked })}
                className="h-4 w-4 accent-rose-600"
              />
              Solo vencidas
            </label>

            {hayFiltros && (
              <button type="button" onClick={limpiarFiltros} className={boton("fantasma")}>
                Limpiar filtros
              </button>
            )}
          </div>

          {filtros.etiqueta && (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Etiqueta:{" "}
              <button
                type="button"
                onClick={() => cambiar({ etiqueta: "" })}
                className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 font-medium text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
                aria-label={`Quitar el filtro de la etiqueta ${filtros.etiqueta}`}
              >
                #{filtros.etiqueta} ×
              </button>
            </p>
          )}
        </section>

        <section aria-label="Tareas" aria-live="polite" className="space-y-3">
          {consulta.isPending && <Esqueleto />}

          {consulta.isError && (
            <div className="space-y-3">
              <Alerta>{consulta.error.message}</Alerta>
              <button type="button" onClick={() => consulta.refetch()} className={boton("secundario")}>
                Reintentar
              </button>
            </div>
          )}

          {pagina && (
            <>
              <p className="flex items-center gap-2 text-sm text-slate-500">
                {pagina.totalElementos === 1 ? "1 tarea" : `${pagina.totalElementos} tareas`}
                {consulta.isFetching && <Spinner className="h-3.5 w-3.5" />}
              </p>

              {pagina.contenido.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center dark:border-slate-700">
                  <p className="font-medium">
                    {hayFiltros ? "Ninguna tarea coincide con los filtros" : "Todavía no tienes tareas"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {hayFiltros
                      ? "Prueba con otra búsqueda o limpia los filtros."
                      : "Escribe un título arriba y pulsa Enter para crear la primera."}
                  </p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {pagina.contenido.map((tarea) => (
                    <TaskItem
                      key={tarea.id}
                      tarea={tarea}
                      onEditar={setEdicion}
                      onFiltrarPorEtiqueta={(etiqueta) => cambiar({ etiqueta })}
                    />
                  ))}
                </ul>
              )}

              {pagina.totalPaginas > 1 && (
                <nav aria-label="Paginación" className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    className={boton("secundario")}
                    disabled={pagina.pagina === 0}
                    onClick={() => setFiltros((previos) => ({ ...previos, pagina: previos.pagina - 1 }))}
                  >
                    Anterior
                  </button>
                  <span className="text-sm text-slate-500">
                    Página {pagina.pagina + 1} de {pagina.totalPaginas}
                  </span>
                  <button
                    type="button"
                    className={boton("secundario")}
                    disabled={pagina.pagina + 1 >= pagina.totalPaginas}
                    onClick={() => setFiltros((previos) => ({ ...previos, pagina: previos.pagina + 1 }))}
                  >
                    Siguiente
                  </button>
                </nav>
              )}
            </>
          )}
        </section>
      </div>

      <aside className="space-y-4">
        <TagSidebar
          etiquetaActiva={filtros.etiqueta}
          onElegir={(etiqueta) => cambiar({ etiqueta })}
        />
      </aside>

      <Modal
        abierto={edicion !== undefined}
        titulo={edicion ? "Editar tarea" : "Nueva tarea"}
        onCerrar={() => setEdicion(undefined)}
      >
        <TaskForm tarea={edicion ?? undefined} onTerminar={() => setEdicion(undefined)} />
      </Modal>
    </div>
  );
}
