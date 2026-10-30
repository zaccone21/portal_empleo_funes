"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Same breakpoint as Tailwind's `lg`: below it the detail replaces the list. */
const CONSULTA_CELULAR = "(max-width: 1023.98px)";

type Props = {
  /**
   * The person picked this item (it is in the URL). False when the desktop
   * shows the first item by default: then the panel is hidden on phones and
   * must not pull the scroll or the focus.
   */
  elegida: boolean;
  /** Identifies the item, so the phone behavior runs again when another one opens. */
  clave: string;
  /** Where "Volver" goes on phones (the list without a selection). */
  volverHref: string;
  volverTexto: string;
  titulo: string;
  /** One line under the title, for example the publication date. */
  subtitulo: string;
  children: ReactNode;
  /** The main action, pinned to the bottom. */
  pie?: ReactNode;
};

/**
 * Detail panel of a list with the detail on the same page (D-025, Computrabajo style).
 *
 * Behavior:
 * - Desktop (`lg`): Immobile container; header with title is shrink-0 so it is
 *   always in view at the top; the body scrolls independently if long; footer
 *   with the action is pinned at the bottom.
 * - When switching items, the body scroll resets to the top so the title and requirements
 *   start cleanly from the beginning.
 * - On phones: when an item opens, the page scrolls to the panel and moves the
 *   focus to its title; "Volver" returns to the list.
 */
export function PanelDetalle({ elegida, clave, volverHref, volverTexto, titulo, subtitulo, children, pie }: Props) {
  const tituloRef = useRef<HTMLHeadingElement>(null);
  const cuerpoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Al cambiar de oferta, reseteamos el scroll interno para que siempre se vea el título y el inicio
    if (cuerpoRef.current) {
      cuerpoRef.current.scrollTop = 0;
    }
    if (elegida && window.matchMedia(CONSULTA_CELULAR).matches) {
      tituloRef.current?.scrollIntoView({ block: "start" });
      tituloRef.current?.focus({ preventScroll: true });
    }
  }, [clave, elegida]);

  return (
    <article
      aria-labelledby="detalle-titulo"
      className="flex flex-col rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card ring-1 ring-foreground/5 lg:h-full lg:min-h-0 lg:overflow-hidden"
    >
      <header className="shrink-0 flex flex-col gap-2 rounded-tl-2xl rounded-tr-md bg-brand-deep px-5 pt-5 pb-6 text-primary-foreground sm:px-7">
        <Link
          href={volverHref}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "-ml-3 self-start text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground lg:hidden",
          )}
        >
          <ArrowLeftIcon data-icon="inline-start" aria-hidden="true" />
          {volverTexto}
        </Link>
        <h2
          id="detalle-titulo"
          ref={tituloRef}
          tabIndex={-1}
          className="scroll-mt-4 text-2xl leading-tight font-semibold outline-none sm:text-3xl"
        >
          {titulo}
        </h2>
        <p className="text-base text-primary-foreground/80">{subtitulo}</p>
      </header>
      <div
        ref={cuerpoRef}
        className="relative flex flex-col gap-7 px-5 py-6 sm:px-7 lg:flex-1 lg:min-h-0 lg:overflow-y-auto [scrollbar-width:thin]"
      >
        {children}
      </div>
      {pie && (
        <footer className="sticky bottom-(--alto-barra-inferior,0px) mt-auto rounded-br-2xl rounded-bl-md border-t bg-card px-5 py-4 sm:px-7 lg:static lg:shrink-0 lg:mt-0">
          {pie}
        </footer>
      )}
    </article>
  );
}
