"use client";

import { BriefcaseBusinessIcon, Building2Icon, SendIcon, UsersIcon, type LucideIcon } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { useEstadisticas } from "@/hooks/useEstadisticas";
import type { EstadisticasPublicas } from "@/lib/validation/estadisticas";

import { Contador } from "./Contador";

/** The hires are the hero's big figure (D-066); here go the rest of the portal's activity. */
const CIFRAS: { clave: keyof EstadisticasPublicas; etiqueta: string; icono: LucideIcon }[] = [
  { clave: "ofertasPublicadas", etiqueta: "ofertas abiertas ahora", icono: BriefcaseBusinessIcon },
  { clave: "empresas", etiqueta: "empresas de Funes registradas", icono: Building2Icon },
  { clave: "postulantes", etiqueta: "personas buscando trabajo", icono: UsersIcon },
  { clave: "derivaciones", etiqueta: "personas presentadas a empresas por la Oficina", icono: SendIcon },
];

/**
 * "El portal en números" on the home page (P01, D-059, D-066): four real
 * totals from the database on a deep green band, big white figures with a mint
 * icon each, so a visitor sees at a glance that the portal is alive and used in
 * Funes. The four cells share one grid, so they are always the same height.
 * While they load, skeletons keep the place. If they cannot be counted, the
 * band is left out: a red error on the landing would only scare a first-time
 * visitor.
 */
export function CifrasPortal() {
  const { estadisticas, loading, error } = useEstadisticas();
  if (error) return null;

  return (
    <section
      aria-labelledby="cifras-titulo"
      className="flex flex-col gap-6 rounded-tl-[1.75rem] rounded-tr-lg rounded-br-[1.75rem] rounded-bl-lg bg-brand-deep p-6 text-primary-foreground sm:p-8 lg:p-10"
    >
      <div className="flex flex-col gap-2">
        <h2 id="cifras-titulo" className="text-2xl font-semibold sm:text-3xl">
          El portal en números
        </h2>
        <p className="max-w-2xl text-base text-primary-foreground/80">
          Contados en este momento en la base del portal. No hay números de ejemplo.
        </p>
      </div>
      <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-xl bg-primary-foreground/15 min-[400px]:grid-cols-2 lg:grid-cols-4">
        {CIFRAS.map(({ clave, etiqueta, icono: Icono }) => (
          <li key={clave} className="flex flex-col gap-4 bg-brand-deep p-5 lg:p-6">
            <span
              aria-hidden="true"
              className="flex size-11 items-center justify-center rounded-tl-xl rounded-tr-sm rounded-br-xl rounded-bl-sm bg-brand-mint text-brand-deep"
            >
              <Icono className="size-5" />
            </span>
            <div className="flex flex-col gap-2">
              <div className="font-heading text-4xl leading-none font-semibold tracking-[-0.03em] tabular-nums sm:text-5xl">
                {loading || !estadisticas ? (
                  <Skeleton className="h-10 w-20 bg-primary-foreground/15 sm:h-12" />
                ) : (
                  <Contador valor={estadisticas[clave]} />
                )}
              </div>
              <span className="text-base text-primary-foreground/80">{etiqueta}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
