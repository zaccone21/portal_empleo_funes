"use client";

import Link from "next/link";
import {
  ArrowRightIcon,
  BanknoteIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
} from "lucide-react";

import { AnimarElemento, AnimarGrupo } from "@/components/marca/animaciones";
import { IconoRubro } from "@/components/ofertas/IconoRubro";
import { formatearDia } from "@/lib/fechas";
import type { PostulacionPropia } from "@/lib/validation/postulaciones";
import { NOMBRE_RUBRO } from "@/lib/validation/rubros";

/**
 * The applicant's application history (P07, RF1.2.4) rendered as a rich,
 * well-organized responsive card grid with aligned margins, paddings,
 * and semantic status pills.
 */
export function ListaPostulaciones({ postulaciones }: { postulaciones: PostulacionPropia[] }) {
  const ordenadas = [...postulaciones].sort((a, b) => b.postuladoEl.localeCompare(a.postuladoEl));

  return (
    <AnimarGrupo className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {ordenadas.map((postulacion) => {
        const { oferta } = postulacion;
        const rubros = oferta.rubros ?? [];
        const sigueActiva = !oferta.estadoOferta || oferta.estadoOferta === "publicada";

        return (
          <AnimarElemento key={postulacion.id} elevarAlPasar className="flex h-full flex-col">
            <Link
              href={`/ofertas?oferta=${encodeURIComponent(oferta.id)}`}
              className="group flex h-full flex-col justify-between gap-4 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card p-5 ring-1 ring-foreground/10 transition-all hover:ring-2 hover:ring-primary hover:shadow-xs focus-visible:ring-3 focus-visible:ring-ring/50 outline-none sm:p-5"
            >
              <div className="flex flex-col gap-3.5">
                {/* Fila superior: Rubros con color de oficio + estado distintivo de la oferta */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {rubros.length > 0 ? (
                      rubros.slice(0, 2).map((rubro) => (
                        <span
                          key={rubro}
                          className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/8 px-2.5 py-0.5 text-xs font-semibold text-primary"
                        >
                          <IconoRubro rubro={rubro} className="size-3 text-primary" />
                          {NOMBRE_RUBRO[rubro]}
                        </span>
                      ))
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                        Oferta laboral
                      </span>
                    )}
                  </div>

                  {sigueActiva ? (
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-brand-mint/60 bg-brand-mint/35 px-2.5 py-0.5 text-xs font-semibold text-brand-deep">
                      <span className="size-1.5 rounded-full bg-emerald-600 animate-pulse" aria-hidden="true" />
                      Búsqueda activa
                    </span>
                  ) : (
                    <span className="inline-flex shrink-0 items-center rounded-full border border-border bg-muted/70 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                      Búsqueda cerrada
                    </span>
                  )}
                </div>

                {/* Título del puesto */}
                <h2 className="font-heading text-xl leading-snug font-bold text-foreground group-hover:text-primary min-h-[3rem] line-clamp-2">
                  {oferta.titulo}
                </h2>

                {/* Grilla de detalles del puesto */}
                <ul className="flex flex-col gap-2 text-sm text-muted-foreground pt-1">
                  <li className="flex items-start gap-2.5 min-w-0">
                    <MapPinIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span className="truncate">
                      <span className="sr-only">Lugar: </span>
                      {oferta.lugar}
                    </span>
                  </li>

                  {oferta.jornada ? (
                    <li className="flex items-start gap-2.5 min-w-0">
                      <ClockIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span className="truncate">
                        <span className="sr-only">Horario: </span>
                        {oferta.jornada}
                      </span>
                    </li>
                  ) : null}

                  <li className="flex items-start gap-2.5 min-w-0">
                    <BanknoteIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span className="truncate">
                      <span className="sr-only">Remuneración: </span>
                      {oferta.sueldo?.trim() ? oferta.sueldo : "A convenir"}
                    </span>
                  </li>
                </ul>
              </div>

              {/* Pie de la tarjeta: fecha de postulación y acción */}
              <div className="mt-auto flex items-center justify-between gap-2 border-t border-border/60 pt-3.5 text-xs">
                <span className="inline-flex items-center gap-1.5 font-medium text-muted-foreground">
                  <CalendarIcon aria-hidden="true" className="size-3.5 text-primary" />
                  Te postulaste el {formatearDia(postulacion.postuladoEl)}
                </span>
                <span className="inline-flex shrink-0 items-center gap-1 font-semibold text-primary group-hover:underline">
                  Ver oferta
                  <ArrowRightIcon aria-hidden="true" className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          </AnimarElemento>
        );
      })}
    </AnimarGrupo>
  );
}
