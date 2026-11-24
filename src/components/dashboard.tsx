"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { capitalizar, formatearFechaLarga } from "@/lib/format";
import { useResumen, useTareasAtrasadas, useTareasProximas } from "@/lib/hooks";
import { useHoy } from "@/lib/hoy";
import type { Pagina, ResumenTareas, Tarea } from "@/lib/types";
import { FilaCompacta } from "./fila-compacta";
import { TaskForm } from "./task-form";
import { Alerta, Modal, Spinner, boton } from "./ui";

const TITULO_DE_SECCION =
  "border-b-4 border-double border-regla-fuerte pb-2 font-display text-2xl font-bold leading-none";

/** Los totales como los de una hoja contable: cuatro columnas separadas por reglas y doble raya arriba y abajo. */
function Totales({ resumen }: { resumen: ResumenTareas }) {
  const columnas = [
    {
      titulo: "Atrasadas",
      valor: resumen.vencidas > 0 ? `(${resumen.vencidas})` : "0",
      nota: resumen.vencidas > 0 ? "Ya pasó su plazo" : "Nada atrasado",
      enRojo: resumen.vencidas > 0,
    },
    { titulo: "Para hoy", valor: String(resumen.paraHoy), nota: "Vencen hoy", enRojo: false },
    {
      titulo: "Próximos 7 días",
      valor: String(resumen.proximosSieteDias),
      nota: "De mañana en adelante",
      enRojo: false,
    },
    {
      titulo: "Pendientes",
      valor: String(resumen.pendientes),
      nota: `${resumen.sinPlazo} sin plazo`,
      enRojo: false,
    },
  ];

  return (
    <section
      aria-label="Totales"
      className="grid grid-cols-2 border-y-4 border-double border-regla-fuerte md:grid-cols-4"
    >
      {columnas.map((columna, i) => (
        <div
          key={columna.titulo}
          className={`px-4 py-4 ${i === 0 ? "" : i === 2 ? "md:border-l md:border-regla" : "border-l border-regla"} ${
            i > 1 ? "border-t border-regla md:border-t-0" : ""
          }`}
        >
          <p className="font-display text-[1.2rem] font-semibold text-tinta-suave">{columna.titulo}</p>
          <p
            className={`mt-1 font-display text-[3.6rem] font-bold leading-none tabular-nums ${
              columna.enRojo ? "text-tinta-roja" : ""
            }`}
          >
            {columna.valor}
          </p>
          <p className="mt-1.5 text-[0.95rem] text-tinta-suave">{columna.nota}</p>
        </div>
      ))}
    </section>
  );
}

/** Avance: cuántas de todas las tareas están hechas, en una barra con borde de tinta. */
function Avance({ resumen }: { resumen: ResumenTareas }) {
  const porcentaje = resumen.total === 0 ? 0 : Math.round((resumen.hechas / resumen.total) * 100);
  return (
    <section aria-labelledby="titulo-avance">
      <h2 id="titulo-avance" className={TITULO_DE_SECCION}>
        Avance
      </h2>
      <p className="mt-3 flex items-baseline justify-between font-display">
        <span className="text-[1.3rem] font-semibold">
          {resumen.hechas} de {resumen.total} hechas
        </span>
        <span className="text-[2.2rem] font-bold tabular-nums">{porcentaje}%</span>
      </p>
      <div
        role="progressbar"
        aria-label="Porcentaje de tareas hechas"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={porcentaje}
        className="mt-1 h-4 border-[1.5px] border-tinta"
      >
        <div className="h-full bg-tinta-azul" style={{ width: `${porcentaje}%` }} />
      </div>
    </section>
  );
}

/** Cuántas pendientes hay de cada prioridad, con barras proporcionales a la mayor. */
function PorPrioridad({ resumen }: { resumen: ResumenTareas }) {
  const filas = [
    { nombre: "Alta", valor: resumen.pendientesAlta },
    { nombre: "Media", valor: resumen.pendientesMedia },
    { nombre: "Baja", valor: resumen.pendientesBaja },
  ];
  const maximo = Math.max(1, ...filas.map((fila) => fila.valor));

  return (
    <section aria-labelledby="titulo-prioridad">
      <h2 id="titulo-prioridad" className={TITULO_DE_SECCION}>
        Pendientes por prioridad
      </h2>
      <ul className="mt-3 space-y-2.5">
        {filas.map((fila) => (
          <li key={fila.nombre} className="grid grid-cols-[4.5rem_minmax(0,1fr)_2rem] items-center gap-3">
            <span className="font-display text-[1.2rem] font-semibold">{fila.nombre}</span>
            <div aria-hidden="true" className="h-3.5 bg-regla/50">
              <div className="h-full bg-tinta" style={{ width: `${(fila.valor / maximo) * 100}%` }} />
            </div>
            <span className="text-right font-display text-[1.3rem] font-bold tabular-nums">
              {fila.valor}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

interface PropiedadesDeLista {
  id: string;
  titulo: string;
  consulta: UseQueryResult<Pagina<Tarea>>;
  vacio: string;
  hoy: string;
  onEditar: (tarea: Tarea) => void;
}

function ListaDeTareas({ id, titulo, consulta, vacio, hoy, onEditar }: PropiedadesDeLista) {
  const total = consulta.data?.totalElementos ?? 0;
  const mostradas = consulta.data?.contenido.length ?? 0;

  return (
    <section aria-labelledby={id}>
      <h2 id={id} className={TITULO_DE_SECCION}>
        {titulo}
      </h2>
      {consulta.isPending && (
        <div className="flex justify-center py-6 text-tinta-suave">
          <Spinner />
        </div>
      )}
      {consulta.isError && (
        <div className="mt-3">
          <Alerta>{consulta.error.message}</Alerta>
        </div>
      )}
      {consulta.data && mostradas === 0 && (
        <p className="border-b border-regla py-6 text-tinta-suave">{vacio}</p>
      )}
      {mostradas > 0 && (
        <ul>
          {consulta.data?.contenido.map((tarea) => (
            <FilaCompacta key={tarea.id} tarea={tarea} hoy={hoy} onEditar={onEditar} />
          ))}
        </ul>
      )}
      {total > mostradas && (
        <p className="mt-2 text-[0.95rem] text-tinta-suave">
          Se muestran {mostradas} de {total}.{" "}
          <Link href="/tareas" className="font-semibold text-tinta-azul underline underline-offset-4">
            Ver todas las tareas
          </Link>
        </p>
      )}
    </section>
  );
}

/** Página de inicio: cuánto hay pendiente, qué está atrasado y qué viene, de un vistazo. */
export function Dashboard() {
  const hoy = useHoy();
  const resumen = useResumen();
  const atrasadas = useTareasAtrasadas();
  const proximas = useTareasProximas(hoy);
  // `undefined` = diálogo cerrado; una tarea = editándola.
  const [edicion, setEdicion] = useState<Tarea | undefined>(undefined);

  const datos = resumen.data;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-2">
        <div>
          <h1 className="font-display text-[2.8rem] font-bold leading-none">Resumen</h1>
          {hoy && <p className="mt-2 text-tinta-suave">{capitalizar(formatearFechaLarga(hoy))}</p>}
        </div>
        <nav aria-label="Atajos" className="flex gap-3">
          <Link href="/calendario" className={`${boton("secundario")} boton-pequeno`}>
            Abrir el calendario
          </Link>
          <Link href="/tareas" className={`${boton("primario")} boton-pequeno`}>
            Ver las tareas
          </Link>
        </nav>
      </div>

      {resumen.isPending && (
        <div className="flex justify-center py-16 text-tinta-suave">
          <Spinner className="h-6 w-6" />
          <span className="sr-only">Cargando el resumen…</span>
        </div>
      )}

      {resumen.isError && (
        <div className="mt-6 space-y-3">
          <Alerta>{resumen.error.message}</Alerta>
          <button type="button" onClick={() => resumen.refetch()} className={boton("secundario")}>
            Reintentar
          </button>
        </div>
      )}

      {datos && datos.total === 0 && (
        <div className="mt-6 border-y border-regla py-14 text-center">
          <p className="font-display text-[1.7rem] font-bold leading-tight">Todavía no tienes tareas</p>
          <p className="mt-1 text-tinta-suave">Crea la primera y aquí verás el resumen.</p>
          <Link href="/tareas" className={`${boton("primario")} mt-5`}>
            Crear una tarea
          </Link>
        </div>
      )}

      {datos && datos.total > 0 && (
        <div className="mt-6 space-y-10">
          <Totales resumen={datos} />

          <div className="grid gap-x-12 gap-y-10 md:grid-cols-2">
            <Avance resumen={datos} />
            <PorPrioridad resumen={datos} />
          </div>

          <div className="grid gap-x-12 gap-y-10 lg:grid-cols-2">
            <ListaDeTareas
              id="titulo-atrasadas"
              titulo="Atrasadas"
              consulta={atrasadas}
              vacio="No tienes tareas atrasadas."
              hoy={hoy}
              onEditar={setEdicion}
            />
            <ListaDeTareas
              id="titulo-proximas"
              titulo="Lo que viene"
              consulta={proximas}
              vacio="No hay tareas pendientes con plazo desde hoy."
              hoy={hoy}
              onEditar={setEdicion}
            />
          </div>
        </div>
      )}

      <Modal
        abierto={edicion !== undefined}
        titulo="Editar tarea"
        onCerrar={() => setEdicion(undefined)}
      >
        {edicion && <TaskForm tarea={edicion} onTerminar={() => setEdicion(undefined)} />}
      </Modal>
    </div>
  );
}
