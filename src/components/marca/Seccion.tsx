import type { ReactNode } from "react";

import { MosaicoOficios } from "./MosaicoOficios";

type Props = {
  /** The page's h1. */
  titulo: string;
  bajada: string;
  children: ReactNode;
};

/**
 * Page body for the portal's inner screens (D-022). It is the page's <main>
 * (id="contenido", the target of "Saltar al contenido"):
 * - a deep green header with the page title (h1). On phones it is short on
 *   purpose (the content has to start in the upper half of the screen) and
 *   has no mosaic; from `sm` up the trade mosaic sits on the right, masked so
 *   the title always reads on plain green;
 * - the content area, which overlaps the green with a "leaf" top-left corner,
 *   and leaves room at the bottom for the phone bottom bar
 *   (--alto-barra-inferior, set by the area layout).
 */
export function Seccion({ titulo, bajada, children }: Props) {
  return (
    <main id="contenido" className="flex flex-1 flex-col">
      <section className="relative isolate overflow-hidden bg-brand-deep text-primary-foreground">
        <MosaicoOficios
          cantidad={48}
          className="absolute inset-y-0 right-0 -z-10 hidden w-3/4 [mask-image:linear-gradient(to_right,transparent_40%,black_90%)] sm:block lg:w-2/3"
        />
        <div className="mx-auto w-full max-w-6xl px-4 pt-3 pb-10 sm:pt-6 sm:pb-16 lg:px-10 lg:pt-10 lg:pb-24">
          <h1 className="max-w-2xl font-heading text-[1.75rem] leading-[1.1] font-semibold tracking-[-0.025em] text-balance sm:text-[2.25rem] lg:text-6xl">
            {titulo}
          </h1>
          <p className="mt-2 max-w-xl text-base text-primary-foreground/80 sm:mt-3 sm:text-lg">{bajada}</p>
        </div>
      </section>
      <div className="relative -mt-6 flex-1 rounded-tl-[1.5rem] bg-muted sm:-mt-8 sm:rounded-tl-[1.75rem] lg:-mt-12 lg:rounded-tl-[2.5rem]">
        <div className="mx-auto w-full max-w-6xl px-4 pt-6 pb-[calc(var(--alto-barra-inferior,0px)+2.5rem)] sm:pt-8 lg:px-10 lg:pt-12 lg:pb-16">
          {children}
        </div>
      </div>
    </main>
  );
}
