import type { ReactNode } from "react";

import { MosaicoOficios } from "./MosaicoOficios";

type Props = {
  /** The page's h1. */
  titulo: string;
  bajada: string;
  children: ReactNode;
};

/**
 * Page body for the portal's inner screens (D-022). It is the page's <main>:
 * - a deep green header with the page title (h1) and the trade mosaic, never
 *   behind the text: on phones it is a strip under the text (the title uses
 *   the full width there), from `sm` up it sits on the right, masked so the
 *   title reads on plain green;
 * - the content area, which overlaps the green with a "leaf" top-left corner,
 *   the portal's signature shape.
 */
export function Seccion({ titulo, bajada, children }: Props) {
  return (
    <main className="flex flex-1 flex-col">
      <section className="relative isolate overflow-hidden bg-brand-deep text-primary-foreground">
        <MosaicoOficios
          cantidad={48}
          className="absolute inset-y-0 right-0 -z-10 hidden w-3/4 [mask-image:linear-gradient(to_right,transparent_40%,black_90%)] sm:block lg:w-2/3"
        />
        <div className="mx-auto w-full max-w-6xl px-4 pt-6 pb-8 sm:pb-16 lg:px-10 lg:pt-10 lg:pb-24">
          <h1 className="max-w-2xl font-heading text-[2.25rem] leading-[1.05] font-semibold tracking-[-0.025em] text-balance lg:text-6xl">
            {titulo}
          </h1>
          <p className="mt-3 max-w-xl text-lg text-primary-foreground/80">{bajada}</p>
        </div>
        <MosaicoOficios
          cantidad={14}
          className="h-20 sm:hidden [mask-image:linear-gradient(to_right,black_50%,transparent)]"
        />
      </section>
      <div className="relative -mt-8 flex-1 rounded-tl-[1.75rem] bg-muted lg:-mt-12 lg:rounded-tl-[2.5rem]">
        <div className="mx-auto w-full max-w-6xl px-4 pt-8 pb-16 lg:px-10 lg:pt-12">{children}</div>
      </div>
    </main>
  );
}
