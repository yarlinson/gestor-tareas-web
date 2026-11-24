"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "./api";
import type { FiltrosTareas, TareaEntrada } from "./types";

/** Vuelve a pedir los datos de las consultas indicadas (por la primera parte de su clave). */
function useRefrescar() {
  const cliente = useQueryClient();
  return (...claves: string[]) =>
    Promise.all(
      claves.map((clave) => cliente.invalidateQueries({ queryKey: [clave] })),
    );
}

export function useTareas(filtros: FiltrosTareas) {
  return useQuery({
    queryKey: ["tareas", filtros],
    queryFn: () => api.tareas(filtros),
    // Mientras llega la página nueva se sigue mostrando la anterior, sin parpadeos.
    placeholderData: keepPreviousData,
  });
}

export function useEtiquetas() {
  return useQuery({ queryKey: ["etiquetas"], queryFn: api.etiquetas });
}

export function useNotificacionesPendientes() {
  return useQuery({
    queryKey: ["notificaciones"],
    queryFn: api.notificacionesPendientes,
    refetchInterval: 60_000,
  });
}

export function useGuardarTarea() {
  const refrescar = useRefrescar();
  return useMutation({
    mutationFn: ({ id, datos }: { id?: number; datos: TareaEntrada }) =>
      id === undefined ? api.crearTarea(datos) : api.actualizarTarea(id, datos),
    // Cambiar la fecha límite borra los avisos de la tarea, por eso también se refrescan.
    onSuccess: () => refrescar("tareas", "etiquetas", "notificaciones"),
  });
}

export function useCambiarEstado() {
  const refrescar = useRefrescar();
  return useMutation({
    mutationFn: ({ id, completada }: { id: number; completada: boolean }) =>
      api.cambiarEstado(id, completada),
    onSuccess: () => refrescar("tareas"),
  });
}

export function useEliminarTarea() {
  const refrescar = useRefrescar();
  return useMutation({
    mutationFn: (id: number) => api.eliminarTarea(id),
    onSuccess: () => refrescar("tareas", "etiquetas", "notificaciones"),
  });
}

export function useEliminarEtiqueta() {
  const refrescar = useRefrescar();
  return useMutation({
    mutationFn: (id: number) => api.eliminarEtiqueta(id),
    onSuccess: () => refrescar("tareas", "etiquetas"),
  });
}

export function useMarcarNotificacionLeida() {
  const refrescar = useRefrescar();
  return useMutation({
    mutationFn: (id: number) => api.marcarNotificacionLeida(id),
    onSuccess: () => refrescar("notificaciones"),
  });
}

export function useEstadisticas() {
  return useQuery({
    queryKey: ["admin-estadisticas"],
    queryFn: api.admin.estadisticas,
  });
}

export function useUsuariosAdmin(pagina: number) {
  return useQuery({
    queryKey: ["admin-usuarios", pagina],
    queryFn: () => api.admin.usuarios(pagina),
    placeholderData: keepPreviousData,
  });
}

export function useGenerarRecordatorios() {
  const refrescar = useRefrescar();
  return useMutation({
    mutationFn: api.admin.generarRecordatorios,
    onSuccess: () => refrescar("admin-estadisticas", "notificaciones"),
  });
}
