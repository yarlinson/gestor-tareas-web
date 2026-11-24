import { formatearDiaYMes, formatearFecha } from "@/lib/format";
import { diasHasta } from "@/lib/hoy";

interface PropiedadesVisuales {
  numero: string;
  etiqueta: string;
  detalle?: string;
  /** Plazo vencido: se escribe en tinta roja, como lo negativo en contabilidad. */
  atraso?: boolean;
}

/** La columna de plazo: un número grande y, debajo, qué significa. Es solo presentación. */
export function PlazoVisual({ numero, etiqueta, detalle, atraso = false }: PropiedadesVisuales) {
  return (
    <div aria-hidden="true" className="font-display leading-none">
      <div
        className={`font-bold tabular-nums ${
          // "(12)" y palabras como "Hoy" son más anchos que una cifra: se achican para no salirse.
          numero.length > 2 ? "text-[2.1rem]" : "text-[2.7rem]"
        } ${atraso ? "text-tinta-roja" : ""}`}
      >
        {numero}
      </div>
      <div className="mt-1.5 text-[1.05rem] font-medium text-tinta-suave">{etiqueta}</div>
      {detalle && <div className="mt-0.5 text-base text-tinta-suave">{detalle}</div>}
    </div>
  );
}

function frase(dias: number): string {
  if (dias > 1) return `faltan ${dias} días`;
  if (dias === 1) return "falta 1 día";
  if (dias === 0) return "vence hoy";
  return dias === -1 ? "lleva 1 día de atraso" : `lleva ${-dias} días de atraso`;
}

interface Propiedades {
  fecha: string | null;
  completada: boolean;
  /** Fecha de hoy (AAAA-MM-DD); vacía mientras se hidrata la página. */
  hoy: string;
}

/**
 * Plazo de una tarea: los días que faltan en grande; entre paréntesis y en rojo los días de
 * atraso, como se escribe un saldo negativo en un libro contable. Las tareas hechas muestran una
 * marca azul. Para quien usa lector de pantalla se dice la frase completa.
 */
export function Plazo({ fecha, completada, hoy }: Propiedades) {
  if (completada) {
    return (
      <div className="font-display leading-none">
        <svg
          viewBox="0 0 24 24"
          className="h-[2.5rem] w-[2.5rem] fill-none stroke-tinta-azul"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3.5 13.5 9 19 21 4.5" />
        </svg>
        <div aria-hidden="true" className="mt-1.5 text-[1.05rem] font-medium text-tinta-azul">
          hecha
        </div>
        <span className="sr-only">Tarea completada</span>
      </div>
    );
  }

  if (!fecha) {
    return (
      <>
        <PlazoVisual numero="—" etiqueta="sin plazo" />
        <span className="sr-only">Sin fecha límite</span>
      </>
    );
  }

  if (!hoy) {
    return <PlazoVisual numero="…" etiqueta={formatearDiaYMes(fecha)} />;
  }

  const dias = diasHasta(fecha, hoy);
  const numero = dias > 0 ? String(dias) : dias === 0 ? "Hoy" : `(${-dias})`;
  const etiqueta = dias > 1 ? "días" : dias === 1 ? "día" : dias === 0 ? "vence" : "de atraso";

  return (
    <>
      <PlazoVisual
        numero={numero}
        etiqueta={etiqueta}
        detalle={formatearDiaYMes(fecha)}
        atraso={dias < 0}
      />
      <span className="sr-only">
        Vence el {formatearFecha(fecha)}: {frase(dias)}
      </span>
    </>
  );
}
