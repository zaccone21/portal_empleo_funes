import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Portal de Empleo — Municipalidad de Funes",
  description:
    "Portal de Empleo de la Municipalidad de Funes: ofertas laborales, postulaciones y gestión de la Oficina de Empleo.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-AR" className={cn("h-full antialiased", inter.variable)}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
