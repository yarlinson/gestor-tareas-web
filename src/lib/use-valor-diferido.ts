"use client";

import { useEffect, useState } from "react";

/** Devuelve `valor` con retraso: sirve para no consultar la API en cada tecla de un buscador. */
export function useValorDiferido<T>(valor: T, milisegundos: number): T {
  const [diferido, setDiferido] = useState(valor);

  useEffect(() => {
    const temporizador = setTimeout(() => setDiferido(valor), milisegundos);
    return () => clearTimeout(temporizador);
  }, [valor, milisegundos]);

  return diferido;
}
