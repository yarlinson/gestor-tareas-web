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

/**
 * Fija el tema (claro u oscuro) antes de que el navegador pinte la página, para que quien eligió
 * el modo contrario al de su sistema no vea un destello del otro. Usa la elección guardada y, si
 * no hay, la preferencia del sistema. Debe mantenerse en sintonía con src/lib/tema.ts.
 */
const GUION_DEL_TEMA = `(function(){try{var g=localStorage.getItem("gestor-tareas.tema");var t=(g==="claro"||g==="oscuro")?g:(window.matchMedia("(prefers-color-scheme: dark)").matches?"oscuro":"claro");document.documentElement.dataset.tema=t}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: el guion de arriba añade data-tema a <html> antes de hidratar.
    <html
      lang="es"
      suppressHydrationWarning
      className={`${textoSerif.variable} ${condensada.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: GUION_DEL_TEMA }} />
      </head>
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
