import type { ReactNode } from "react";

import { AnimarEntrada } from "./animaciones";
import { MosaicoOficios } from "./MosaicoOficios";

type Props = {
  /** The page's h1. */
  titulo: string;
  bajada: string;
  children: ReactNode;
};

/**
 * Page body for the portal's inner screens (D-022). Uses a full-width container
 * (`max-w-[1680px]`) and subtle `motion` entrance animation.
 */
export function Seccion({ titulo, bajada, children }: Props) {
  return (
    <main id="contenido" className="flex flex-1 flex-col">
      <section className="relative isolate overflow-hidden bg-brand-deep text-primary-foreground">
        <MosaicoOficios
          cantidad={48}
          className="absolute inset-y-0 right-0 -z-10 hidden w-3/4 [mask-image:linear-gradient(to_right,transparent_40%,black_90%)] sm:block lg:w-2/3"
        />
        <div className="mx-auto w-full max-w-[1680px] px-4 pt-3 pb-10 sm:px-8 sm:pt-6 sm:pb-16 lg:px-14 lg:pt-10 lg:pb-22">
          <h1 className="max-w-3xl font-heading text-[1.75rem] leading-[1.1] font-semibold tracking-[-0.025em] text-balance sm:text-[2.25rem] lg:text-5xl">
            {titulo}
          </h1>
          <p className="mt-2 max-w-2xl text-base text-primary-foreground/80 sm:mt-3 sm:text-lg">{bajada}</p>
        </div>
      </section>
      <div className="relative -mt-6 flex-1 rounded-tl-[1.5rem] bg-muted sm:-mt-8 sm:rounded-tl-[1.75rem] lg:-mt-12 lg:rounded-tl-[2.5rem]">
        <AnimarEntrada className="mx-auto w-full max-w-[1680px] px-4 pt-6 pb-[calc(var(--alto-barra-inferior,0px)+2.5rem)] sm:px-8 sm:pt-8 lg:px-14 lg:pt-12 lg:pb-16">
          {children}
        </AnimarEntrada>
      </div>
    </main>
  );
}
