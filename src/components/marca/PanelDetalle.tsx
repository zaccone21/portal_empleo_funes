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
 * Detail panel of a list with the detail on the same page (D-025): deep green
 * header with the title, content, and the main action in a footer.
 *
 * Behavior:
 * - The footer sticks to the bottom (on phones just above the bottom bar, on
 *   desktop at the bottom of the panel), so the main action is always in reach.
 * - On phones, when an item opens, the page scrolls to the panel and moves the
 *   focus to its title, so the person (and a screen reader) lands on what they
 *   just opened. On desktop nothing moves.
 * - "Volver" only shows on phones, where the panel replaces the list.
 * The effect depends on `elegida` too: picking the first item on a phone does
 * not change `clave` (it was already the default), but it does make it visible.
 */
export function PanelDetalle({ elegida, clave, volverHref, volverTexto, titulo, subtitulo, children, pie }: Props) {
  const tituloRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (elegida && window.matchMedia(CONSULTA_CELULAR).matches) {
      tituloRef.current?.scrollIntoView({ block: "start" });
      tituloRef.current?.focus({ preventScroll: true });
    }
  }, [clave, elegida]);

  return (
    <article
      aria-labelledby="detalle-titulo"
      className="flex flex-col rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card ring-1 ring-foreground/5 lg:max-h-[calc(100dvh-2rem)] lg:overflow-y-auto"
    >
      <header className="flex flex-col gap-2 rounded-tl-2xl rounded-tr-md bg-brand-deep px-5 pt-5 pb-6 text-primary-foreground sm:px-7">
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
      <div className="flex flex-col gap-7 px-5 py-6 sm:px-7">{children}</div>
      {pie && (
        <footer className="sticky bottom-(--alto-barra-inferior,0px) mt-auto rounded-br-2xl rounded-bl-md border-t bg-card px-5 py-4 sm:px-7 lg:bottom-0">
          {pie}
        </footer>
      )}
    </article>
  );
}
