"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { AuthProvider } from "@/lib/auth";
import { ApiError } from "@/lib/api";

export function Providers({ children }: { children: ReactNode }) {
  const [cliente] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 15_000,
            // Los errores 4xx (permisos, datos inválidos, sesión) no se arreglan reintentando.
            retry: (intentos, error) =>
              !(error instanceof ApiError && error.estado >= 400 && error.estado < 500) &&
              intentos < 2,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={cliente}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
