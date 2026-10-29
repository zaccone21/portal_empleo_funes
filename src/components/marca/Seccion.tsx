import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { AnimarEntrada } from "./animaciones";
import { MosaicoOficios } from "./MosaicoOficios";

type Props = {
  /** The page's h1. */
  titulo: string;
  bajada: string;
  children: ReactNode;
  /** When true, reduces top hero banner height so catalogs and two-column views appear immediately. */
  compacto?: boolean;
};

/**
 * Page body for the portal's inner screens (D-022). Uses a full-width container
 * (`max-w-[1680px]`) and subtle `motion` entrance animation.
 */
export function Seccion({ titulo, bajada, children, compacto = false }: Props) {
  return (
    <main id="contenido" className="flex flex-1 flex-col">
      <section className="relative isolate overflow-hidden bg-brand-deep text-primary-foreground">
        <MosaicoOficios
          cantidad={48}
          className="absolute inset-y-0 right-0 -z-10 hidden w-3/4 [mask-image:linear-gradient(to_right,transparent_40%,black_90%)] sm:block lg:w-2/3"
        />
        <div
          className={cn(
            "mx-auto w-full max-w-[1680px] px-4 sm:px-8 lg:px-14",
            compacto
              ? "pt-2 pb-6 sm:pt-4 sm:pb-8 lg:pt-5 lg:pb-12"
              : "pt-3 pb-10 sm:pt-6 sm:pb-16 lg:pt-10 lg:pb-22",
          )}
        >
          <h1
            className={cn(
              "max-w-3xl font-heading leading-[1.1] font-semibold tracking-[-0.025em] text-balance",
              compacto
                ? "text-[1.5rem] sm:text-[1.875rem] lg:text-[2.25rem]"
                : "text-[1.75rem] sm:text-[2.25rem] lg:text-5xl",
            )}
          >
            {titulo}
          </h1>
          <p
            className={cn(
              "mt-2 max-w-2xl text-primary-foreground/80",
              compacto ? "text-sm sm:mt-2.5 sm:text-base" : "text-base sm:mt-3 sm:text-lg",
            )}
          >
            {bajada}
          </p>
        </div>
      </section>
      <div
        className={cn(
          "relative flex-1 rounded-tl-[1.5rem] bg-muted sm:rounded-tl-[1.75rem] lg:rounded-tl-[2.5rem]",
          compacto ? "-mt-4 sm:-mt-6 lg:-mt-8" : "-mt-6 sm:-mt-8 lg:-mt-12",
        )}
      >
        <AnimarEntrada
          className={cn(
            "mx-auto w-full max-w-[1680px] px-4 pb-[calc(var(--alto-barra-inferior,0px)+2.5rem)] sm:px-8 lg:px-14",
            compacto ? "pt-4 sm:pt-6 lg:pt-6 lg:pb-10" : "pt-6 sm:pt-8 lg:pt-12 lg:pb-16",
          )}
        >
          {children}
        </AnimarEntrada>
      </div>
    </main>
  );
}
