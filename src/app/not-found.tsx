import type { Metadata } from "next";

import { PaginaNoEncontrada } from "@/components/estados/PaginaNoEncontrada";

export const metadata: Metadata = {
  title: "Página no encontrada",
};

export default function NotFound() {
  return <PaginaNoEncontrada />;
}
