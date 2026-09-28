"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { formatearDia } from "@/lib/fechas";
import { cn } from "@/lib/utils";
import type { OfertaPublica } from "@/lib/validation/ofertas";

import { BotonPostularme } from "./BotonPostularme";
import { DatosOferta } from "./DatosOferta";

/** Same breakpoint as Tailwind's `lg`: below it the detail replaces the list. */
const CONSULTA_CELULAR = "(max-width: 1023.98px)";

type Props = {
  oferta: OfertaPublica;
  /**
   * The person picked this offer (it is in the URL). False when the desktop
   * shows the first offer by default: then the detail is hidden on phones
   * and must not pull the scroll or the focus.
   */
  elegida: boolean;
};

/**
 * Full detail of an offer (P06, RF1.4.2): description, requirements and
 * "Postularme" (RF1.4.3). It is a panel of the same page, not a modal (D-025):
 * next to the list on desktop, in place of the list on phones.
 *
 * Behavior:
 * - "Postularme" sits in a footer that sticks to the bottom (of the viewport
 *   on phones, of the panel on desktop), so the main action is always in
 *   reach even with a long description.
 * - On phones, when an offer opens, the page scrolls to the detail and moves
 *   the focus to its title, so the person (and a screen reader) lands on
 *   what they just opened. On desktop nothing moves: the list stays in place.
 * - A new BotonPostularme is mounted per offer (key), so the outcome of one
 *   offer never shows up on another.
 */
export function DetalleOferta({ oferta, elegida }: Props) {
  const titulo = useRef<HTMLHeadingElement>(null);

  // Depends on `elegida` too: picking the first offer on a phone does not
  // change the id (it was already the default), but it does make it visible.
  useEffect(() => {
    if (elegida && window.matchMedia(CONSULTA_CELULAR).matches) {
      titulo.current?.scrollIntoView({ block: "start" });
      titulo.current?.focus({ preventScroll: true });
    }
  }, [oferta.id, elegida]);

  return (
    <article
      aria-labelledby="detalle-oferta-titulo"
      className="flex flex-col rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card ring-1 ring-foreground/5 lg:max-h-[calc(100dvh-2rem)] lg:overflow-y-auto"
    >
      <header className="flex flex-col gap-2 rounded-tl-2xl rounded-tr-md bg-brand-deep px-5 pt-5 pb-6 text-primary-foreground sm:px-7">
        <Link
          href="/ofertas"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "-ml-3 self-start text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground lg:hidden",
          )}
        >
          <ArrowLeftIcon data-icon="inline-start" aria-hidden="true" />
          Volver a las ofertas
        </Link>
        <h2
          id="detalle-oferta-titulo"
          ref={titulo}
          tabIndex={-1}
          className="scroll-mt-4 text-2xl leading-tight font-semibold outline-none sm:text-3xl"
        >
          {oferta.titulo}
        </h2>
        <p className="text-base text-primary-foreground/80">Publicada el {formatearDia(oferta.publicadaEl)}</p>
      </header>
      <div className="flex flex-col gap-7 px-5 py-6 sm:px-7">
        <DatosOferta lugar={oferta.lugar} jornada={oferta.jornada} />
        <section className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold">Qué vas a hacer</h3>
          <p className="text-base whitespace-pre-line">{oferta.descripcion}</p>
        </section>
        <section className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold">Qué piden</h3>
          <p className="text-base whitespace-pre-line">{oferta.requisitos}</p>
        </section>
      </div>
      <footer className="sticky bottom-0 mt-auto rounded-br-2xl rounded-bl-md border-t bg-card px-5 py-4 sm:px-7">
        <BotonPostularme key={oferta.id} ofertaId={oferta.id} />
      </footer>
    </article>
  );
}
