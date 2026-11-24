"use client";

import { useMemo, useState } from "react";
import {
  agruparPorDia,
  diasDeLaCuadricula,
  esDelMes,
  mesDe,
  nombreDelMes,
  nombresDeLosDias,
  sumarMeses,
  type MesVisible,
} from "@/lib/calendario";
import { capitalizar, formatearFechaLarga } from "@/lib/format";
import { useTareasDelRango, useTareasSinFecha } from "@/lib/hooks";
import { useHoy } from "@/lib/hoy";
import type { Prioridad, Tarea } from "@/lib/types";
import { FilaCompacta } from "./fila-compacta";
import { TaskForm } from "./task-form";
import { Alerta, Modal, Spinner, boton } from "./ui";

type Vista = "mes" | "agenda";

/** Qué se está creando o editando en el diálogo: una tarea existente o una nueva con fecha inicial. */
interface Edicion {
  tarea?: Tarea;
  fecha?: string;
}

/** Cuántas tareas caben en una celda del mes antes de pasar a "+N más". */
const TAREAS_POR_CELDA = 3;

/** El grosor de la raya a la izquierda de cada tarea dice su prioridad: gruesa alta, fina baja. */
const GROSOR_DE_RAYA: Record<Prioridad, string> = {
  ALTA: "border-l-4",
  MEDIA: "border-l-2",
  BAJA: "border-l",
};

const TITULO_DE_SECCION =
  "border-b-4 border-double border-regla-fuerte pb-2 font-display text-2xl font-bold leading-none";

function cantidadDeTareas(cantidad: number): string {
  return cantidad === 1 ? "1 tarea" : `${cantidad} tareas`;
}

/** Una tarea dentro de la celda de un día. Abre su edición sin abrir el día. */
function Etiquetita({ tarea, onAbrir }: { tarea: Tarea; onAbrir: (tarea: Tarea) => void }) {
  const raya = tarea.completada ? "border-regla-fuerte" : tarea.vencida ? "border-tinta-roja" : "border-tinta";
  const texto = tarea.completada
    ? "text-tinta-suave line-through"
    : tarea.vencida
      ? "text-tinta-roja"
      : "";

  return (
    <button
      type="button"
      onClick={(evento) => {
        evento.stopPropagation();
        onAbrir(tarea);
      }}
      title={tarea.titulo}
      className={`block w-full truncate bg-hoja py-0.5 pl-1.5 pr-1 text-left text-[0.9rem] leading-5 hover:bg-regla/50 ${GROSOR_DE_RAYA[tarea.prioridad]} ${raya} ${texto}`}
    >
      {tarea.titulo}
    </button>
  );
}

/** En pantallas estrechas no caben títulos: cada tarea se marca con un cuadrito. */
function Punto({ tarea }: { tarea: Tarea }) {
  const color = tarea.completada ? "bg-regla-fuerte" : tarea.vencida ? "bg-tinta-roja" : "bg-tinta";
  return <span className={`h-1.5 w-1.5 ${color}`} />;
}

interface PropiedadesDeCelda {
  dia: string;
  mes: MesVisible;
  tareas: Tarea[];
  hoy: string;
  onDia: (dia: string) => void;
  onTarea: (tarea: Tarea) => void;
}

function Celda({ dia, mes, tareas, hoy, onDia, onTarea }: PropiedadesDeCelda) {
  const numero = Number(dia.slice(8));
  const esHoy = dia === hoy;
  const delMes = esDelMes(dia, mes);
  const visibles = tareas.slice(0, TAREAS_POR_CELDA);
  const ocultas = tareas.length - visibles.length;

  return (
    // Tocar el espacio libre de la celda abre el día; el botón del número lo hace con teclado.
    <td
      onClick={() => onDia(dia)}
      className={`h-[4.75rem] cursor-pointer border border-regla p-1 align-top sm:h-32 ${
        delMes ? "" : "bg-hoja/50"
      }`}
    >
      <button
        type="button"
        onClick={(evento) => {
          evento.stopPropagation();
          onDia(dia);
        }}
        aria-label={`${capitalizar(formatearFechaLarga(dia))}${
          tareas.length > 0 ? `: ${cantidadDeTareas(tareas.length)}` : ""
        }`}
        aria-current={esHoy ? "date" : undefined}
        className={`px-1.5 py-1 font-display text-[1.15rem] font-semibold leading-none ${
          esHoy ? "bg-tinta text-papel" : delMes ? "" : "text-tinta-suave"
        }`}
      >
        {numero}
      </button>

      <ul className="mt-1 hidden space-y-0.5 sm:block">
        {visibles.map((tarea) => (
          <li key={tarea.id}>
            <Etiquetita tarea={tarea} onAbrir={onTarea} />
          </li>
        ))}
      </ul>
      {ocultas > 0 && (
        <button
          type="button"
          onClick={(evento) => {
            evento.stopPropagation();
            onDia(dia);
          }}
          className="mt-0.5 hidden text-[0.9rem] text-tinta-suave hover:underline sm:block"
        >
          +{ocultas} más
        </button>
      )}

      {tareas.length > 0 && (
        <div aria-hidden="true" className="mt-1 flex flex-wrap gap-0.5 sm:hidden">
          {tareas.slice(0, 6).map((tarea) => (
            <Punto key={tarea.id} tarea={tarea} />
          ))}
        </div>
      )}
    </td>
  );
}

interface PropiedadesDeVista {
  mes: MesVisible;
  dias: string[];
  porDia: Map<string, Tarea[]>;
  hoy: string;
}

function Cuadricula({
  mes,
  dias,
  porDia,
  hoy,
  onDia,
  onTarea,
}: PropiedadesDeVista & { onDia: (dia: string) => void; onTarea: (tarea: Tarea) => void }) {
  const semanas: string[][] = [];
  for (let i = 0; i < dias.length; i += 7) semanas.push(dias.slice(i, i + 7));

  return (
    <table className="w-full table-fixed border-collapse">
      <caption className="sr-only">Calendario de {nombreDelMes(mes)}</caption>
      <thead>
        <tr>
          {nombresDeLosDias().map((nombre) => (
            <th
              key={nombre}
              scope="col"
              className="border-b-2 border-regla-fuerte py-2 pl-1.5 text-left font-display text-[1.1rem] font-semibold text-tinta-suave"
            >
              {nombre}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {semanas.map((semana) => (
          <tr key={semana[0]}>
            {semana.map((dia) => (
              <Celda
                key={dia}
                dia={dia}
                mes={mes}
                tareas={porDia.get(dia) ?? []}
                hoy={hoy}
                onDia={onDia}
                onTarea={onTarea}
              />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Lista cronológica del mes: solo los días que tienen tareas. Es la vista cómoda en el teléfono. */
function Agenda({
  mes,
  dias,
  porDia,
  hoy,
  onEditar,
}: PropiedadesDeVista & { onEditar: (tarea: Tarea) => void }) {
  const diasConTareas = dias.filter((dia) => esDelMes(dia, mes) && porDia.has(dia));

  if (diasConTareas.length === 0) {
    return (
      <div className="border-b border-regla py-14 text-center">
        <p className="font-display text-[1.7rem] font-bold leading-tight">
          No hay tareas con plazo en este mes
        </p>
        <p className="mt-1 text-tinta-suave">Cambia de mes o crea una tarea con fecha límite.</p>
      </div>
    );
  }

  return (
    <div>
      {diasConTareas.map((dia) => (
        <section key={dia} aria-labelledby={`dia-${dia}`} className="pb-1 pt-3">
          <h3 id={`dia-${dia}`} className="flex items-baseline gap-3 font-display text-[1.4rem] font-bold">
            {capitalizar(formatearFechaLarga(dia))}
            {dia === hoy && (
              <span className="bg-tinta px-1.5 text-base font-semibold text-papel">hoy</span>
            )}
          </h3>
          <ul>
            {(porDia.get(dia) ?? []).map((tarea) => (
              <FilaCompacta key={tarea.id} tarea={tarea} hoy={hoy} onEditar={onEditar} conPlazo={false} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

/** Las tareas de un día, con la posibilidad de crear una nueva para esa fecha. */
function DetalleDelDia({
  dia,
  tareas,
  hoy,
  onEditar,
  onNueva,
}: {
  dia: string;
  tareas: Tarea[];
  hoy: string;
  onEditar: (tarea: Tarea) => void;
  onNueva: (dia: string) => void;
}) {
  return (
    <div>
      {tareas.length === 0 ? (
        <p className="border-b border-regla pb-5 text-tinta-suave">No hay tareas con plazo este día.</p>
      ) : (
        <ul className="-mt-1">
          {tareas.map((tarea) => (
            <FilaCompacta key={tarea.id} tarea={tarea} hoy={hoy} onEditar={onEditar} conPlazo={false} />
          ))}
        </ul>
      )}
      <div className="mt-5 flex justify-end">
        <button type="button" onClick={() => onNueva(dia)} className={boton("primario")}>
          Nueva tarea para este día
        </button>
      </div>
    </div>
  );
}

export function Calendario() {
  const hoy = useHoy();
  // Mientras no se navegue, el mes visible es el de hoy; `null` significa "el mes de hoy".
  const [mesElegido, setMesElegido] = useState<MesVisible | null>(null);
  const [vista, setVista] = useState<Vista>("mes");
  const [dia, setDia] = useState<string | null>(null);
  const [edicion, setEdicion] = useState<Edicion | null>(null);

  const mes = mesElegido ?? (hoy ? mesDe(hoy) : null);
  const dias = mes ? diasDeLaCuadricula(mes) : [];
  const consulta = useTareasDelRango(dias[0] ?? "", dias[dias.length - 1] ?? "");
  const sinFecha = useTareasSinFecha();
  const porDia = useMemo(() => agruparPorDia(consulta.data ?? []), [consulta.data]);

  if (!mes) {
    return (
      <div className="flex justify-center py-16 text-tinta-suave">
        <Spinner className="h-6 w-6" />
        <span className="sr-only">Cargando el calendario…</span>
      </div>
    );
  }

  function abrirTarea(tarea: Tarea) {
    setDia(null);
    setEdicion({ tarea });
  }

  function crearEn(fecha: string) {
    setDia(null);
    setEdicion({ fecha });
  }

  const sinPlazoTotal = sinFecha.data?.totalElementos ?? 0;
  const sinPlazoMostradas = sinFecha.data?.contenido.length ?? 0;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
        <h1 className="font-display text-[2.8rem] font-bold leading-none">Calendario</h1>
        <button type="button" onClick={() => crearEn(hoy)} className={boton("primario")}>
          Nueva tarea
        </button>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-y border-regla py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMesElegido(sumarMeses(mes, -1))}
            aria-label="Mes anterior"
            className={`${boton("secundario")} boton-pequeno`}
          >
            Anterior
          </button>
          <button
            type="button"
            onClick={() => setMesElegido(null)}
            className={`${boton("secundario")} boton-pequeno`}
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={() => setMesElegido(sumarMeses(mes, 1))}
            aria-label="Mes siguiente"
            className={`${boton("secundario")} boton-pequeno`}
          >
            Siguiente
          </button>
        </div>

        <h2
          aria-live="polite"
          className="flex items-center gap-3 font-display text-[2.1rem] font-bold leading-none"
        >
          {capitalizar(nombreDelMes(mes))}
          {consulta.isFetching && <Spinner className="h-4 w-4 text-tinta-suave" />}
        </h2>

        <div role="group" aria-label="Vista" className="flex gap-5 font-display text-[1.2rem] font-semibold">
          {(
            [
              { valor: "mes", texto: "Mes" },
              { valor: "agenda", texto: "Agenda" },
            ] as const
          ).map((opcion) => (
            <button
              key={opcion.valor}
              type="button"
              aria-pressed={vista === opcion.valor}
              onClick={() => setVista(opcion.valor)}
              className={`border-b-2 pb-0.5 transition-colors ${
                vista === opcion.valor
                  ? "border-tinta"
                  : "border-transparent text-tinta-suave hover:text-tinta"
              }`}
            >
              {opcion.texto}
            </button>
          ))}
        </div>
      </div>

      {consulta.isError && (
        <div className="mt-4 space-y-3">
          <Alerta>{consulta.error.message}</Alerta>
          <button type="button" onClick={() => consulta.refetch()} className={boton("secundario")}>
            Reintentar
          </button>
        </div>
      )}

      <div className="mt-4 space-y-10">
        <div className="min-w-0">
          {vista === "mes" ? (
            <Cuadricula
              mes={mes}
              dias={dias}
              porDia={porDia}
              hoy={hoy}
              onDia={setDia}
              onTarea={abrirTarea}
            />
          ) : (
            <Agenda mes={mes} dias={dias} porDia={porDia} hoy={hoy} onEditar={abrirTarea} />
          )}
        </div>

        {/* Debajo de la cuadrícula y no a su lado: así cada día conserva el ancho suficiente para leer los títulos. */}
        <aside className="grid gap-x-12 gap-y-8 md:grid-cols-2 md:items-start">
          <section aria-labelledby="titulo-sin-plazo">
            <h2 id="titulo-sin-plazo" className={TITULO_DE_SECCION}>
              Sin plazo
            </h2>
            {sinFecha.isPending && (
              <div className="flex justify-center py-5 text-tinta-suave">
                <Spinner />
              </div>
            )}
            {sinFecha.isError && (
              <p className="mt-3 text-[0.95rem] text-tinta-roja">{sinFecha.error.message}</p>
            )}
            {sinFecha.data && sinPlazoMostradas === 0 && (
              <p className="mt-3 text-[0.95rem] text-tinta-suave">
                No tienes tareas pendientes sin fecha.
              </p>
            )}
            <ul>
              {sinFecha.data?.contenido.map((tarea) => (
                <FilaCompacta key={tarea.id} tarea={tarea} hoy={hoy} onEditar={abrirTarea} conPlazo={false} />
              ))}
            </ul>
            {sinPlazoTotal > sinPlazoMostradas && (
              <p className="mt-2 text-[0.95rem] text-tinta-suave">
                Se muestran {sinPlazoMostradas} de {sinPlazoTotal}.
              </p>
            )}
          </section>

          <section aria-labelledby="titulo-leyenda-calendario">
            <h2 id="titulo-leyenda-calendario" className={TITULO_DE_SECCION}>
              Cómo leerlo
            </h2>
            <p className="mt-3 text-[0.95rem] text-tinta-suave">
              Toca un día para ver sus tareas o crear una. La raya a la izquierda de cada tarea es
              más gruesa cuanto mayor su prioridad; en rojo, las atrasadas.
            </p>
          </section>
        </aside>
      </div>

      <Modal
        abierto={dia !== null}
        titulo={dia ? capitalizar(formatearFechaLarga(dia)) : ""}
        onCerrar={() => setDia(null)}
      >
        {dia && (
          <DetalleDelDia
            dia={dia}
            tareas={porDia.get(dia) ?? []}
            hoy={hoy}
            onEditar={abrirTarea}
            onNueva={crearEn}
          />
        )}
      </Modal>

      <Modal
        abierto={edicion !== null}
        titulo={edicion?.tarea ? "Editar tarea" : "Nueva tarea"}
        onCerrar={() => setEdicion(null)}
      >
        {edicion && (
          <TaskForm
            tarea={edicion.tarea}
            fechaInicial={edicion.fecha}
            onTerminar={() => setEdicion(null)}
          />
        )}
      </Modal>
    </div>
  );
}
