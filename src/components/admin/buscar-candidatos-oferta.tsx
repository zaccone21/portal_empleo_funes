"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileTextIcon,
  Loader2Icon,
  SearchIcon,
  UserCheckIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react";
import { toast } from "sonner";

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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { asociarPostulanteAccion, buscarCandidatosParaOfertaAccion } from "@/lib/actions/oficina";
import type { ResultadoBusquedaPostulante } from "@/lib/dal/postulantes";
import { NOMBRE_RUBRO, type Rubro } from "@/lib/validation/rubros";

type Props = {
  ofertaId: string;
  rubrosOferta: Rubro[];
  idsYaPostulados: string[];
};

/**
 * Proactive candidate association from an offer (Task 9 & 10, RF1.5.8).
 * Opens a modal allowing the operator to search registered applicants in the pool
 * by name, DNI or trade, and link them directly to the offer without leaving the page.
 */
export function BuscarCandidatosOferta({ ofertaId, rubrosOferta, idsYaPostulados }: Props) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [soloRubrosOferta, setSoloRubrosOferta] = useState(true);
  const [candidatos, setCandidatos] = useState<ResultadoBusquedaPostulante[]>([]);
  const [cargando, setCargando] = useState(false);
  const [nuevosAsociados, setNuevosAsociados] = useState<Set<string>>(new Set());
  const [asociandoId, setAsociandoId] = useState<string | null>(null);

  const asociados = useMemo(
    () => new Set([...idsYaPostulados, ...nuevosAsociados]),
    [idsYaPostulados, nuevosAsociados]
  );

  // Fetch candidates when dialog opens or search/filters change
  useEffect(() => {
    if (!abierto) return;

    let cancelado = false;

    const temporizador = setTimeout(async () => {
      setCargando(true);
      const filtros: { q?: string; rubros?: string[] } = {};
      if (busqueda.trim()) filtros.q = busqueda.trim();
      if (soloRubrosOferta && rubrosOferta.length > 0) filtros.rubros = rubrosOferta;

      const res = await buscarCandidatosParaOfertaAccion(filtros);
      if (!cancelado) {
        if (res.ok) {
          setCandidatos(res.postulantes);
        } else {
          toast.error(res.mensaje);
        }
        setCargando(false);
      }
    }, 250);

    return () => {
      cancelado = true;
      clearTimeout(temporizador);
    };
  }, [abierto, busqueda, soloRubrosOferta, rubrosOferta]);

  async function handleAsociar(candidatoId: string) {
    setAsociandoId(candidatoId);
    try {
      const res = await asociarPostulanteAccion(candidatoId, ofertaId);
      if (res.ok) {
        toast.success(res.mensaje);
        setNuevosAsociados((prev) => new Set([...prev, candidatoId]));
        router.refresh();
      } else {
        toast.error(res.mensaje);
      }
    } finally {
      setAsociandoId(null);
    }
  }

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger
        render={
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 border-brand-leaf/40 bg-brand-mint/15 text-xs font-semibold text-brand-deep hover:bg-brand-mint/30"
          >
            <UserPlusIcon className="size-3.5" aria-hidden="true" />
            Buscar en el padrón
          </Button>
        }
      />
      <DialogContent className="max-h-[85vh] w-full max-w-2xl overflow-hidden p-0 sm:rounded-xl">
        <DialogHeader className="border-b border-border p-4 pb-3 sm:p-6 sm:pb-4">
          <DialogTitle className="flex items-center gap-2 font-heading text-lg font-bold text-foreground">
            <UsersIcon className="size-5 text-brand-leaf" aria-hidden="true" />
            Asociar candidatos del padrón
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Buscá personas registradas en el portal y postúlalas directamente a esta oferta de trabajo.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 border-b border-border bg-muted/40 p-4">
          {/* Search text input */}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" aria-hidden="true" />
            <Input
              type="search"
              placeholder="Buscar por nombre, apellido o DNI…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="h-9 pl-9 text-xs"
              autoFocus
            />
          </div>

          {/* Toggle rubros filter */}
          {rubrosOferta.length > 0 && (
            <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2">
              <Label
                htmlFor="toggle-rubros"
                className="flex cursor-pointer flex-col gap-0.5 text-xs font-normal"
              >
                <span className="font-semibold text-foreground">Filtrar por rubros de la oferta</span>
                <span className="text-[11px] text-muted-foreground">
                  {rubrosOferta.map((r) => NOMBRE_RUBRO[r] ?? r).join(", ")}
                </span>
              </Label>
              <Switch
                id="toggle-rubros"
                checked={soloRubrosOferta}
                onCheckedChange={setSoloRubrosOferta}
              />
            </div>
          )}
        </div>

        {/* Candidate list */}
        <div className="max-h-[46vh] min-h-[180px] overflow-y-auto p-4">
          {cargando ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
              <Loader2Icon className="size-6 animate-spin text-brand-leaf" aria-hidden="true" />
              <p className="text-xs">Buscando candidatos en el padrón…</p>
            </div>
          ) : candidatos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
              <p className="text-sm font-semibold text-foreground">No encontramos candidatos</p>
              <p className="mt-1 text-xs">
                Probá quitando el filtro de rubros o buscando por otro término.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
              {candidatos.map((c) => {
                const nombre = [c.nombre, c.apellido].filter(Boolean).join(" ") || "Sin nombre registrado";
                const yaAsociado = asociados.has(c.id);
                const asociandoEste = asociandoId === c.id;

                return (
                  <li
                    key={c.id}
                    className="flex flex-col gap-2 p-3 transition-colors sm:flex-row sm:items-center sm:justify-between hover:bg-muted/30"
                  >
                    <div className="flex min-w-0 flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-foreground text-sm">{nombre}</span>
                        {c.dni && (
                          <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-mono text-muted-foreground">
                            DNI {c.dni}
                          </span>
                        )}
                        {c.cvSubidoEl && (
                          <Badge variant="outline" className="h-5 gap-1 border-brand-leaf/30 text-[10.5px] text-brand-deep">
                            <FileTextIcon className="size-3" aria-hidden="true" />
                            CV cargado
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                        {c.email && <span>{c.email}</span>}
                        {c.telefono && (
                          <>
                            <span>·</span>
                            <span>{c.telefono}</span>
                          </>
                        )}
                      </div>

                      {c.rubros.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {c.rubros.map((slug) => (
                            <span
                              key={slug}
                              className="rounded-full bg-brand-mint/25 px-2 py-0.5 text-[11px] font-medium text-brand-deep"
                            >
                              {NOMBRE_RUBRO[slug as Rubro] ?? slug}
                            </span>
                          ))}
                        </div>
                      )}

                      {c.experiencia && (
                        <p className="line-clamp-1 text-[11.5px] text-muted-foreground italic">
                          {c.experiencia}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 pt-1 sm:pt-0">
                      {yaAsociado ? (
                        <span className="inline-flex h-8 items-center gap-1 rounded-md bg-muted px-3 text-xs font-semibold text-muted-foreground">
                          <UserCheckIcon className="size-3.5 text-brand-leaf" aria-hidden="true" />
                          Ya postulado
                        </span>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          disabled={asociandoEste}
                          onClick={() => handleAsociar(c.id)}
                          className="h-8 gap-1.5 text-xs font-semibold"
                        >
                          {asociandoEste ? (
                            <Loader2Icon className="size-3.5 animate-spin" aria-hidden="true" />
                          ) : (
                            <UserPlusIcon className="size-3.5" aria-hidden="true" />
                          )}
                          Asociar a la oferta
                        </Button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
