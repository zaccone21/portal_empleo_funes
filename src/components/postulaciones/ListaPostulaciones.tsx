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
import { Badge } from "@/components/ui/badge";
import { formatearDia, formatearTiempoRelativo } from "@/lib/fechas";
import type { PostulacionPropia } from "@/lib/validation/postulaciones";
import { NOMBRE_RUBRO } from "@/lib/validation/rubros";

/**
 * The applicant's application history (P07, RF1.2.4) rendered as a rich,
 * well-organized responsive card grid instead of elongated single-line bars.
 * Shows trade chips with icons, workplace location, schedule, salary, application
 * date, whether the offer is still active, and a direct link to open the offer.
 */
export function ListaPostulaciones({ postulaciones }: { postulaciones: PostulacionPropia[] }) {
  const ordenadas = [...postulaciones].sort((a, b) => b.postuladoEl.localeCompare(a.postuladoEl));

  return (
    <AnimarGrupo className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {ordenadas.map((postulacion) => {
        const { oferta } = postulacion;
        const relativo = formatearTiempoRelativo(postulacion.postuladoEl);
        const rubros = oferta.rubros ?? [];
        const sigueActiva = !oferta.estadoOferta || oferta.estadoOferta === "publicada";

        return (
          <AnimarElemento key={postulacion.id} elevarAlPasar className="flex h-full flex-col">
            <Link
              href={`/ofertas?oferta=${encodeURIComponent(oferta.id)}`}
              className="group flex h-full flex-col justify-between gap-4 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card p-5 ring-1 ring-foreground/8 transition-all hover:ring-2 hover:ring-primary focus-visible:ring-3 focus-visible:ring-ring/50 outline-none sm:p-6"
            >
              <div className="flex flex-col gap-3.5">
                {/* Fila superior: Rubros + estado de la oferta */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {rubros.length > 0 ? (
                      rubros.slice(0, 2).map((rubro) => (
                        <span
                          key={rubro}
                          className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground"
                        >
                          <IconoRubro rubro={rubro} className="size-3.5 text-primary" />
                          {NOMBRE_RUBRO[rubro]}
                        </span>
                      ))
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
                        Oferta laboral
                      </span>
                    )}
                  </div>

                  <Badge variant={sigueActiva ? "secondary" : "outline"} className="shrink-0">
                    {sigueActiva ? "Búsqueda activa" : "Búsqueda cerrada"}
                  </Badge>
                </div>

                {/* Título del puesto */}
                <h2 className="font-heading text-xl leading-snug font-bold text-foreground group-hover:text-primary">
                  {oferta.titulo}
                </h2>

                {/* Grilla de detalles del puesto */}
                <div className="flex flex-col gap-2 rounded-xl bg-muted/45 p-3.5 text-sm">
                  <div className="flex items-start gap-2.5">
                    <MapPinIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
                    <div className="min-w-0">
                      <span className="text-xs font-medium text-muted-foreground">Lugar de trabajo: </span>
                      <span className="font-medium text-foreground">{oferta.lugar}</span>
                    </div>
                  </div>

                  {oferta.jornada ? (
                    <div className="flex items-start gap-2.5">
                      <ClockIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
                      <div className="min-w-0">
                        <span className="text-xs font-medium text-muted-foreground">Horario / Jornada: </span>
                        <span className="font-medium text-foreground">{oferta.jornada}</span>
                      </div>
                    </div>
                  ) : null}

                  <div className="flex items-start gap-2.5">
                    <BanknoteIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
                    <div className="min-w-0">
                      <span className="text-xs font-medium text-muted-foreground">Remuneración: </span>
                      <span className="font-medium text-foreground">
                        {oferta.sueldo?.trim() ? oferta.sueldo : "A convenir"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pie de la tarjeta: fecha de postulación y acción */}
              <div className="flex items-center justify-between gap-2 border-t border-border/70 pt-3.5 text-xs">
                <span className="inline-flex items-center gap-1.5 font-medium text-muted-foreground">
                  <CalendarIcon aria-hidden="true" className="size-3.5 text-primary" />
                  Postulado el {formatearDia(postulacion.postuladoEl)} ({relativo})
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
