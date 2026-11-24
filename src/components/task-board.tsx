"use client";

import { useId, useMemo, useState } from "react";
import { useTareas } from "@/lib/hooks";
import { useHoy } from "@/lib/hoy";
import type { Estado, FiltrosTareas, Orden, Prioridad, Tarea } from "@/lib/types";
import { useValorDiferido } from "@/lib/use-valor-diferido";
import { NOMBRES_DE_PRIORIDAD, PRIORIDADES } from "./prioridad";
import { QuickAdd } from "./quick-add";
import { TagSidebar } from "./tag-sidebar";
import { TaskForm } from "./task-form";
import { COLUMNAS_DE_LA_HOJA, TaskItem } from "./task-item";
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
  { valor: "completadas", texto: "Hechas" },
];

const ORDENES: { valor: Orden; texto: string }[] = [
  { valor: "reciente", texto: "Más recientes" },
  { valor: "prioridad", texto: "Prioridad (alta primero)" },
  { valor: "fechaLimite", texto: "Plazo (próximos primero)" },
  { valor: "titulo", texto: "Título (A-Z)" },
];

function Esqueleto() {
  return (
    <ul aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <li key={i} className="flex gap-5 border-b border-regla py-4">
          <div className="h-14 w-16 animate-pulse bg-regla/60" />
          <div className="flex-1 space-y-2.5 pt-1">
            <div className="h-5 w-2/3 animate-pulse bg-regla/60" />
            <div className="h-4 w-1/2 animate-pulse bg-regla/40" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function TaskBoard() {
  const [filtros, setFiltros] = useState<FiltrosTareas>(FILTROS_INICIALES);
  const [busqueda, setBusqueda] = useState("");
  // `undefined` = diálogo cerrado; `null` = creando; una tarea = editándola.
  const [edicion, setEdicion] = useState<Tarea | null | undefined>(undefined);
  const idDeLaBusqueda = useId();

  const hoy = useHoy();
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
    <div className="grid gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,1fr)_15rem]">
      <div className="min-w-0">
        <h1 className="font-display text-[2.8rem] font-bold leading-none">Tus tareas</h1>

        <div className="mt-5">
          <QuickAdd onMasOpciones={() => setEdicion(null)} />
        </div>

        <section aria-label="Filtros" className="mt-6 space-y-4 border-y border-regla py-4">
          <div>
            <label htmlFor={idDeLaBusqueda} className="sr-only">
              Buscar tareas
            </label>
            <input
              id={idDeLaBusqueda}
              type="search"
              className={CAMPO}
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setFiltros((previos) => ({ ...previos, pagina: 0 }));
              }}
              placeholder="Buscar en título y descripción"
            />
          </div>

          <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
            <div
              role="group"
              aria-label="Estado"
              className="flex gap-5 font-display text-[1.2rem] font-semibold"
            >
              {ESTADOS.map((estado) => (
                <button
                  key={estado.valor}
                  type="button"
                  aria-pressed={filtros.estado === estado.valor}
                  onClick={() => cambiar({ estado: estado.valor })}
                  className={`border-b-2 pb-0.5 transition-colors ${
                    filtros.estado === estado.valor
                      ? "border-tinta"
                      : "border-transparent text-tinta-suave hover:text-tinta"
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

            <label className="inline-flex cursor-pointer items-center gap-2 font-display text-[1.15rem] font-semibold">
              <input
                type="checkbox"
                checked={filtros.soloVencidas}
                onChange={(e) => cambiar({ soloVencidas: e.target.checked })}
                className="casilla casilla-roja"
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
            <p className="text-tinta-suave">
              Etiqueta:{" "}
              <button
                type="button"
                onClick={() => cambiar({ etiqueta: "" })}
                aria-label={`Quitar el filtro de la etiqueta ${filtros.etiqueta}`}
                className="font-display text-[1.1rem] font-semibold text-tinta-azul underline decoration-dotted underline-offset-4 hover:decoration-solid"
              >
                #{filtros.etiqueta} ×
              </button>
            </p>
          )}
        </section>

        <section aria-label="Tareas" aria-live="polite">
          {consulta.isPending && <Esqueleto />}

          {consulta.isError && (
            <div className="space-y-3 py-6">
              <Alerta>{consulta.error.message}</Alerta>
              <button type="button" onClick={() => consulta.refetch()} className={boton("secundario")}>
                Reintentar
              </button>
            </div>
          )}

          {pagina && (
            <>
              {pagina.contenido.length === 0 ? (
                <div className="border-b border-regla py-14 text-center">
                  <p className="font-display text-[1.7rem] font-bold leading-tight">
                    {hayFiltros
                      ? "Ninguna tarea coincide con los filtros"
                      : "Todavía no tienes tareas"}
                  </p>
                  <p className="mt-1 text-tinta-suave">
                    {hayFiltros
                      ? "Prueba con otra búsqueda o limpia los filtros."
                      : "Escribe un título arriba y pulsa Enter para crear la primera."}
                  </p>
                </div>
              ) : (
                <>
                  <div
                    aria-hidden="true"
                    className={`hidden gap-x-5 border-b-2 border-regla-fuerte py-2 font-display text-[1.1rem] font-semibold text-tinta-suave md:grid ${COLUMNAS_DE_LA_HOJA}`}
                  >
                    <span>Plazo</span>
                    <span>Tarea</span>
                    <span>Prioridad</span>
                    <span />
                  </div>
                  <ul>
                    {pagina.contenido.map((tarea) => (
                      <TaskItem
                        key={tarea.id}
                        tarea={tarea}
                        hoy={hoy}
                        onEditar={setEdicion}
                        onFiltrarPorEtiqueta={(etiqueta) => cambiar({ etiqueta })}
                      />
                    ))}
                  </ul>
                </>
              )}

              <div className="regla-doble flex flex-wrap items-center justify-between gap-x-6 gap-y-2 pt-3 font-display text-[1.2rem] font-semibold">
                <p className="flex items-center gap-2">
                  {pagina.totalElementos === 1 ? "1 tarea" : `${pagina.totalElementos} tareas`}
                  {consulta.isFetching && <Spinner className="h-3.5 w-3.5" />}
                </p>
                {pagina.totalPaginas > 1 && (
                  <nav aria-label="Paginación" className="flex items-center gap-2">
                    <button
                      type="button"
                      className={`${boton("fantasma")} boton-pequeno`}
                      disabled={pagina.pagina === 0}
                      onClick={() =>
                        setFiltros((previos) => ({ ...previos, pagina: previos.pagina - 1 }))
                      }
                    >
                      Anterior
                    </button>
                    <span className="font-medium tabular-nums text-tinta-suave">
                      Página {pagina.pagina + 1} de {pagina.totalPaginas}
                    </span>
                    <button
                      type="button"
                      className={`${boton("fantasma")} boton-pequeno`}
                      disabled={pagina.pagina + 1 >= pagina.totalPaginas}
                      onClick={() =>
                        setFiltros((previos) => ({ ...previos, pagina: previos.pagina + 1 }))
                      }
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

      <aside className="space-y-9">
        <TagSidebar
          etiquetaActiva={filtros.etiqueta}
          onElegir={(etiqueta) => cambiar({ etiqueta })}
        />

        <section aria-labelledby="titulo-leyenda">
          <h2
            id="titulo-leyenda"
            className="border-b-4 border-double border-regla-fuerte pb-2 font-display text-2xl font-bold leading-none"
          >
            Cómo leer el plazo
          </h2>
          <p className="mt-3 text-[0.95rem] text-tinta-suave">
            El número grande son los días que faltan. En rojo y entre paréntesis, los días de
            atraso.
          </p>
        </section>
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
