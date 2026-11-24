import { formatearDiaYMes, formatearFecha } from "@/lib/format";
import { diasHasta } from "@/lib/hoy";

interface PropiedadesVisuales {
  numero: string;
  etiqueta: string;
  detalle?: string;
  /** Plazo vencido: se escribe en tinta roja, como lo negativo en contabilidad. */
  atraso?: boolean;
  /** Versión pequeña para listas apretadas: sin la fecha y con cifras más chicas. */
  compacto?: boolean;
}

/** La columna de plazo: un número grande y, debajo, qué significa. Es solo presentación. */
export function PlazoVisual({
  numero,
  etiqueta,
  detalle,
  atraso = false,
  compacto = false,
}: PropiedadesVisuales) {
  // "(12)" y palabras como "Hoy" son más anchos que una cifra: se achican para no salirse.
  const ancho = numero.length > 2;
  const tamano = compacto
    ? ancho ? "text-[1.35rem]" : "text-[1.75rem]"
    : ancho ? "text-[2.1rem]" : "text-[2.7rem]";

  return (
    <div aria-hidden="true" className="font-display leading-none">
      <div className={`font-bold tabular-nums ${tamano} ${atraso ? "text-tinta-roja" : ""}`}>
        {numero}
      </div>
      <div
        className={`font-medium text-tinta-suave ${
          compacto ? "mt-1 text-[0.95rem]" : "mt-1.5 text-[1.05rem]"
        }`}
      >
        {etiqueta}
      </div>
      {detalle && !compacto && <div className="mt-0.5 text-base text-tinta-suave">{detalle}</div>}
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
  compacto?: boolean;
}

/**
 * Plazo de una tarea: los días que faltan en grande; entre paréntesis y en rojo los días de
 * atraso, como se escribe un saldo negativo en un libro contable. Las tareas hechas muestran una
 * marca azul. Para quien usa lector de pantalla se dice la frase completa.
 */
export function Plazo({ fecha, completada, hoy, compacto = false }: Propiedades) {
  if (completada) {
    const lado = compacto ? "h-[1.75rem] w-[1.75rem]" : "h-[2.5rem] w-[2.5rem]";
    return (
      <div className="font-display leading-none">
        <svg
          viewBox="0 0 24 24"
          className={`${lado} fill-none stroke-tinta-azul`}
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3.5 13.5 9 19 21 4.5" />
        </svg>
        <div
          aria-hidden="true"
          className={`font-medium text-tinta-azul ${
            compacto ? "mt-1 text-[0.95rem]" : "mt-1.5 text-[1.05rem]"
          }`}
        >
          hecha
        </div>
        <span className="sr-only">Tarea completada</span>
      </div>
    );
  }

  if (!fecha) {
    return (
      <>
        <PlazoVisual numero="—" etiqueta="sin plazo" compacto={compacto} />
        <span className="sr-only">Sin fecha límite</span>
      </>
    );
  }

  if (!hoy) {
    return <PlazoVisual numero="…" etiqueta={formatearDiaYMes(fecha)} compacto={compacto} />;
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
        compacto={compacto}
      />
      <span className="sr-only">
        Vence el {formatearFecha(fecha)}: {frase(dias)}
      </span>
    </>
  );
}
