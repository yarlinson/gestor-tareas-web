"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { api } from "./api";
import { sesion } from "./session";
import type { Perfil } from "./types";

interface ContextoDeAutenticacion {
  /** Falso en el servidor y durante la hidratación: aún no se sabe si hay sesión. */
  hidratado: boolean;
  token: string | null;
  perfil: Perfil | undefined;
  cargandoPerfil: boolean;
  iniciarSesion: (nombreUsuario: string, password: string) => Promise<void>;
  registrar: (datos: {
    nombreUsuario: string;
    email: string;
    password: string;
  }) => Promise<void>;
  cerrarSesion: () => void;
}

const Contexto = createContext<ContextoDeAutenticacion | null>(null);

const sinSuscripcion = () => () => undefined;

export function AuthProvider({ children }: { children: ReactNode }) {
  const cliente = useQueryClient();

  // El token vive en localStorage; useSyncExternalStore mantiene React sincronizado con él.
  const token = useSyncExternalStore(sesion.suscribir, sesion.leer, () => null);
  const hidratado = useSyncExternalStore(
    sinSuscripcion,
    () => true,
    () => false,
  );

  // Al cerrar sesión (o si el servidor responde 401) se descarta todo lo cacheado,
  // para que el siguiente usuario no vea datos del anterior.
  useEffect(() => {
    if (token === null) cliente.clear();
  }, [token, cliente]);

  const consultaDePerfil = useQuery({
    queryKey: ["perfil", token],
    queryFn: api.perfil,
    enabled: token !== null,
    staleTime: 5 * 60_000,
  });

  const iniciarSesion = useCallback(
    async (nombreUsuario: string, password: string) => {
      const respuesta = await api.iniciarSesion({ nombreUsuario, password });
      sesion.guardar(respuesta.token);
    },
    [],
  );

  const registrar = useCallback(
    async (datos: { nombreUsuario: string; email: string; password: string }) => {
      const respuesta = await api.registrar(datos);
      sesion.guardar(respuesta.token);
    },
    [],
  );

  const cerrarSesion = useCallback(() => sesion.borrar(), []);

  const valor = useMemo<ContextoDeAutenticacion>(
    () => ({
      hidratado,
      token,
      perfil: token === null ? undefined : consultaDePerfil.data,
      cargandoPerfil: token !== null && consultaDePerfil.isPending,
      iniciarSesion,
      registrar,
      cerrarSesion,
    }),
    [
      hidratado,
      token,
      consultaDePerfil.data,
      consultaDePerfil.isPending,
      iniciarSesion,
      registrar,
      cerrarSesion,
    ],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useAuth(): ContextoDeAutenticacion {
  const contexto = useContext(Contexto);
  if (contexto === null) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  }
  return contexto;
}
