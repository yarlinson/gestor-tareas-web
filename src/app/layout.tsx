import type { Metadata } from "next";
import { Barlow_Condensed, Source_Serif_4 } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

// Source Serif 4 para el contenido: se lee como un libro impreso y trae cifras tabulares.
const textoSerif = Source_Serif_4({
  variable: "--font-texto",
  subsets: ["latin"],
  display: "swap",
});

// Barlow Condensed para columnas, botones y los números grandes de los plazos.
const condensada = Barlow_Condensed({
  variable: "--font-condensada",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gestor de Tareas",
  description:
    "Cliente web del Gestor de Tareas: cada tarea con su plazo, su prioridad y sus etiquetas, sobre una API REST en Spring Boot.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${textoSerif.variable} ${condensada.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
