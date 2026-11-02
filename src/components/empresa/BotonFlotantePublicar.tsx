"use client";

import Link from "next/link";
import { PlusIcon } from "lucide-react";

import { useSesion } from "@/hooks/useSesion";

/**
 * Floating Action Button (FAB) for the company area on mobile (D-072/D-073).
 * Styled like WhatsApp / Material FAB: pinned above the bottom navigation bar
 * on the bottom right corner, exclusively visible on mobile screens (`lg:hidden`).
 */
export function BotonFlotantePublicar() {
  const { usuario } = useSesion();

  // Solo se muestra en celulares si hay sesión de empresa
  if (usuario?.rol !== "empresa") return null;

  return (
    <Link
      href="/empresa/ofertas/nueva"
      aria-label="Publicar nueva oferta de empleo"
      className="fixed right-4 bottom-[calc(var(--alto-barra-inferior)+1rem)] z-40 inline-flex items-center gap-2 rounded-full bg-brand-mint px-4 py-3 text-sm font-bold text-brand-deep shadow-xl shadow-black/25 ring-2 ring-brand-mint/50 active:scale-95 transition-transform lg:hidden"
    >
      <PlusIcon className="size-5" aria-hidden="true" />
      <span>Publicar</span>
    </Link>
  );
}
