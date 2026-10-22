"use client";

import { HandshakeIcon } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { useEstadisticas } from "@/hooks/useEstadisticas";

import { Contador } from "./Contador";

/** How often the home page asks again, while the tab is on screen (D-066). */
const ACTUALIZAR_CADA_MS = 60_000;

/**
 * The big figure of the home page (P01, D-066): how many people got a job
 * through the portal, counted from the companies' answers (D-044). It counts
 * up when it appears and again whenever a new hire comes in, without reloading.
 *
 * On phones it is a band on the green hero; from `lg` it is a white "leaf"
 * panel floating over the mosaic, like the sign-in panel. If the totals cannot
 * be counted it is left out: the hero works the same without it.
 */
export function ContadorContrataciones() {
  const { estadisticas, loading, error } = useEstadisticas(ACTUALIZAR_CADA_MS);
  if (error) return null;

  const contrataciones = estadisticas?.contrataciones ?? 0;

  return (
    <section
      aria-labelledby="contrataciones-titulo"
      className="flex items-center gap-4 rounded-tl-2xl rounded-tr-md rounded-br-2xl rounded-bl-md bg-primary-foreground/10 p-4 ring-1 ring-primary-foreground/15 lg:flex-col lg:items-start lg:gap-4 lg:rounded-tl-[1.75rem] lg:rounded-tr-lg lg:rounded-br-[1.75rem] lg:rounded-bl-lg lg:bg-card lg:p-8 lg:text-foreground lg:shadow-2xl lg:ring-0"
    >
      <span
        aria-hidden="true"
        className="hidden size-12 items-center justify-center rounded-tl-xl rounded-tr-sm rounded-br-xl rounded-bl-sm bg-secondary text-primary lg:flex"
      >
        <HandshakeIcon className="size-6" />
      </span>
      <div className="font-heading text-5xl leading-none font-semibold tracking-[-0.03em] tabular-nums lg:text-8xl lg:text-primary">
        {loading ? (
          <Skeleton className="h-12 w-20 bg-primary-foreground/20 lg:h-24 lg:w-36 lg:bg-muted" />
        ) : (
          <Contador valor={contrataciones} />
        )}
      </div>
      <div className="flex flex-col gap-1">
        <h2 id="contrataciones-titulo" className="text-lg leading-snug font-semibold lg:text-xl">
          {contrataciones === 1 ? "persona consiguió trabajo" : "personas consiguieron trabajo"} con el portal
        </h2>
        <p className="text-sm text-primary-foreground/75 lg:text-base lg:text-muted-foreground">
          Se suma solo cada vez que una empresa contrata a alguien que le presentó la Oficina.
        </p>
      </div>
    </section>
  );
}
