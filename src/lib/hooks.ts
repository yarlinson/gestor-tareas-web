"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "./api";
import type { FiltrosTareas, Tarea, TareaEntrada } from "./types";

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

// Todas las consultas de tareas empiezan su clave por "tareas": así, al crear, editar o borrar
// una tarea, `refrescar("tareas")` actualiza a la vez el listado, el resumen y el calendario.

export function useResumen() {
  return useQuery({ queryKey: ["tareas", "resumen"], queryFn: api.resumen });
}

export function useTareasProximas(hoy: string) {
  return useQuery({
    queryKey: ["tareas", "proximas", hoy],
    queryFn: () => api.tareasProximas(hoy),
    enabled: hoy !== "",
  });
}

export function useTareasAtrasadas() {
  return useQuery({ queryKey: ["tareas", "atrasadas"], queryFn: api.tareasAtrasadas });
}

export function useTareasSinFecha() {
  return useQuery({ queryKey: ["tareas", "sin-fecha"], queryFn: api.tareasSinFecha });
}

/**
 * Todas las tareas con fecha límite entre `desde` y `hasta` (AAAA-MM-DD, ambos incluidos). La
 * API pagina de a 100, así que se piden páginas hasta agotarlas: un calendario tiene que mostrar
 * todas, no solo las primeras.
 */
export function useTareasDelRango(desde: string, hasta: string) {
  return useQuery({
    queryKey: ["tareas", "rango", desde, hasta],
    queryFn: async () => {
      const todas: Tarea[] = [];
      let pagina = 0;
      let totalPaginas = 1;
      while (pagina < totalPaginas) {
        const respuesta = await api.tareasEnRango(desde, hasta, pagina);
        todas.push(...respuesta.contenido);
        totalPaginas = respuesta.totalPaginas;
        pagina += 1;
      }
      return todas;
    },
    enabled: desde !== "" && hasta !== "",
    // Al cambiar de mes se sigue viendo el anterior hasta que llega el nuevo.
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
