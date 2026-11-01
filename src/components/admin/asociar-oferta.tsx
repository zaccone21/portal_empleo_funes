"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  BanknoteIcon,
  BriefcaseIcon,
  Building2Icon,
  ClockIcon,
  MapPinIcon,
  SearchIcon,
  SparklesIcon,
  UsersIcon,
} from "lucide-react";
import { toast } from "sonner";

import { IconoRubro } from "@/components/ofertas/IconoRubro";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { asociarPostulanteAccion } from "@/lib/actions/oficina";
import type { OfertaParaAsociar } from "@/lib/admin/postulantes";
import { cn } from "@/lib/utils";
import { NOMBRE_RUBRO, type Rubro } from "@/lib/validation/rubros";

type Props = {
  postulanteId: string;
  /** Published offers the person has not applied to yet. */
  ofertas: OfertaParaAsociar[];
  /** Trades the applicant registered in their profile, for matching affinity. */
  rubrosPostulante?: string[];
};

/**
 * "Asociar a una oferta" (P16, RF1.5.8):
 * Interactive modal allowing the Office to search, compare, and link an applicant
 * to an active job offer, even among hundreds or 1,000+ listings.
 */
export function AsociarOferta({ postulanteId, ofertas, rubrosPostulante = [] }: Props) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [soloCoincidentes, setSoloCoincidentes] = useState(false);
  const [asociandoId, setAsociandoId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const rubrosSet = useMemo(() => new Set(rubrosPostulante), [rubrosPostulante]);

  const ofertasConAfinidad = useMemo(() => {
    return ofertas.map((o) => {
      const coincide = (o.rubros ?? []).some((r) => rubrosSet.has(r));
      return { ...o, coincide };
    });
  }, [ofertas, rubrosSet]);

  const ofertasFiltradas = useMemo(() => {
    let res = ofertasConAfinidad;
    if (soloCoincidentes) {
      res = res.filter((o) => o.coincide);
    }
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase().trim();
      res = res.filter(
        (o) =>
          o.titulo.toLowerCase().includes(q) ||
          o.empresa.toLowerCase().includes(q) ||
          (o.lugar && o.lugar.toLowerCase().includes(q))
      );
    }
    // Matching trades first
    return [...res].sort((a, b) => (b.coincide ? 1 : 0) - (a.coincide ? 1 : 0));
  }, [ofertasConAfinidad, soloCoincidentes, busqueda]);

  const cantidadCoincidentes = useMemo(() => {
    return ofertasConAfinidad.filter((o) => o.coincide).length;
  }, [ofertasConAfinidad]);

  if (ofertas.length === 0) {
    return (
      <p className="text-[12.5px] text-muted-foreground">
        No hay ofertas publicadas a las que se pueda asociar a esta persona.
      </p>
    );
  }

  async function handleAsociar(ofertaId: string) {
    setAsociandoId(ofertaId);
    startTransition(async () => {
      try {
        const respuesta = await asociarPostulanteAccion(postulanteId, ofertaId);
        if (respuesta.ok) {
          toast.success(respuesta.mensaje);
          setAbierto(false);
          router.refresh();
        } else {
          toast.error(respuesta.mensaje);
        }
      } finally {
        setAsociandoId(null);
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <Dialog open={abierto} onOpenChange={setAbierto}>
        <DialogTrigger
          render={
            <Button
              type="button"
              className="w-full gap-2 font-semibold bg-brand-deep hover:bg-brand-deep/90 text-primary-foreground shadow-2xs"
            >
              <BriefcaseIcon className="size-4 shrink-0" aria-hidden="true" />
              Asociar a una oferta ({ofertas.length})
            </Button>
          }
        />
        <DialogContent className="max-h-[90vh] w-full max-w-3xl overflow-hidden p-0 sm:rounded-2xl">
          <DialogHeader className="border-b border-border bg-card p-4 sm:p-5">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-brand-mint/40 text-brand-deep">
                <UsersIcon className="size-5" aria-hidden="true" />
              </span>
              <div>
                <DialogTitle className="font-heading text-lg font-bold text-foreground">
                  Asociar postulante a una oferta laboral
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Elegí una búsqueda activa del portal para postular a esta persona directamente.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Barra de búsqueda y filtros rápidos */}
          <div className="flex flex-col gap-3 border-b border-border bg-muted/40 p-3.5 sm:p-4">
            <div className="relative">
              <SearchIcon
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                type="search"
                placeholder="Buscar por puesto, empresa o lugar…"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="h-10 pl-9 text-xs sm:text-sm bg-card"
                autoFocus
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant={!soloCoincidentes ? "default" : "outline"}
                size="sm"
                onClick={() => setSoloCoincidentes(false)}
                className="h-7 text-xs font-semibold gap-1.5"
              >
                Todas las búsquedas ({ofertas.length})
              </Button>

              {cantidadCoincidentes > 0 && (
                <Button
                  type="button"
                  variant={soloCoincidentes ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSoloCoincidentes(true)}
                  className={cn(
                    "h-7 text-xs font-semibold gap-1.5",
                    !soloCoincidentes && "border-brand-mint text-brand-deep hover:bg-brand-mint/20"
                  )}
                >
                  <SparklesIcon className="size-3 text-amber-500" aria-hidden="true" />
                  Coinciden con su perfil ({cantidadCoincidentes})
                </Button>
              )}

              <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                {ofertasFiltradas.length} {ofertasFiltradas.length === 1 ? "oferta" : "ofertas"}
              </span>
            </div>
          </div>

          {/* Listado de ofertas con detalles ricos */}
          <div className="max-h-[50vh] overflow-y-auto p-3.5 sm:p-4 [scrollbar-width:thin]">
            {ofertasFiltradas.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-muted-foreground">
                <BriefcaseIcon className="size-8 text-muted-foreground/50" />
                <p className="text-sm font-semibold text-foreground">No encontramos ofertas con ese criterio</p>
                <p className="text-xs">Probá con otra palabra o quitá los filtros.</p>
              </div>
            ) : (
              <ul className="flex flex-col gap-2.5">
                {ofertasFiltradas.map((oferta) => {
                  const rubros = oferta.rubros ?? [];
                  const estaAsociando = asociandoId === oferta.id;

                  return (
                    <li
                      key={oferta.id}
                      className={cn(
                        "flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border bg-card p-3.5 sm:p-4 transition-all hover:border-primary/40 hover:shadow-xs",
                        oferta.coincide && "border-brand-mint/80 bg-brand-mint/5"
                      )}
                    >
                      <div className="flex flex-1 flex-col gap-2 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-heading text-base font-bold text-foreground leading-snug">
                            {oferta.titulo}
                          </h4>
                          {oferta.coincide && (
                            <Badge
                              variant="secondary"
                              className="gap-1 border-brand-mint/60 bg-brand-mint/35 text-[11px] font-semibold text-brand-deep shrink-0"
                            >
                              <SparklesIcon className="size-2.5 text-amber-600" aria-hidden="true" />
                              Coincide con sus oficios
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1 font-medium text-foreground">
                            <Building2Icon className="size-3.5 text-primary shrink-0" aria-hidden="true" />
                            {oferta.empresa}
                          </span>

                          {oferta.lugar && (
                            <span className="flex items-center gap-1">
                              <MapPinIcon className="size-3 text-muted-foreground shrink-0" aria-hidden="true" />
                              {oferta.lugar}
                            </span>
                          )}

                          {oferta.jornada && (
                            <span className="flex items-center gap-1">
                              <ClockIcon className="size-3 text-muted-foreground shrink-0" aria-hidden="true" />
                              {oferta.jornada}
                            </span>
                          )}

                          {oferta.sueldo && (
                            <span className="flex items-center gap-1">
                              <BanknoteIcon className="size-3 text-muted-foreground shrink-0" aria-hidden="true" />
                              {oferta.sueldo}
                            </span>
                          )}
                        </div>

                        {rubros.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            {rubros.map((r) => {
                              const coincideRubro = rubrosSet.has(r);
                              return (
                                <span
                                  key={r}
                                  className={cn(
                                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                                    coincideRubro
                                      ? "border border-brand-mint bg-brand-mint/30 text-brand-deep font-semibold"
                                      : "bg-secondary text-secondary-foreground"
                                  )}
                                >
                                  <IconoRubro rubro={r as Rubro} className="size-3 text-primary" />
                                  {NOMBRE_RUBRO[r as Rubro] ?? r}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <Button
                        type="button"
                        size="sm"
                        disabled={asociandoId !== null}
                        onClick={() => handleAsociar(oferta.id)}
                        className="shrink-0 self-start sm:self-center font-semibold"
                      >
                        {estaAsociando ? "Asociando…" : "Asociar a la oferta"}
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <p className="text-[11.5px] text-muted-foreground">
        Podés buscar entre todas las ofertas publicadas y vincular su perfil en un clic.
      </p>
    </div>
  );
}
