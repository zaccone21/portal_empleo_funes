"use client";

import { useMemo, useState, useTransition, type FormEvent } from "react";
import { SearchIcon } from "lucide-react";
import { toast } from "sonner";

import { BotonAdmin } from "@/components/admin/boton-admin";
import { SelectorNativo } from "@/components/formularios/SelectorNativo";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { asociarPostulanteAccion } from "@/lib/actions/oficina";
import type { OfertaParaAsociar } from "@/lib/admin/postulantes";

type Props = {
  postulanteId: string;
  /** Published offers the person has not applied to yet. */
  ofertas: OfertaParaAsociar[];
};

/**
 * "Asociar a una oferta" (P16, RF1.5.8): the Office picks a published offer and
 * the person is applied to it.
 * Includes a live filter input to quickly find offers among hundreds of options.
 */
export function AsociarOferta({ postulanteId, ofertas }: Props) {
  const [pendiente, iniciar] = useTransition();
  const [error, setError] = useState<string | undefined>(undefined);
  const [busqueda, setBusqueda] = useState("");
  const [seleccionada, setSeleccionada] = useState("");

  const ofertasFiltradas = useMemo(() => {
    if (!busqueda.trim()) return ofertas;
    const q = busqueda.toLowerCase().trim();
    return ofertas.filter(
      (o) => o.titulo.toLowerCase().includes(q) || o.empresa.toLowerCase().includes(q)
    );
  }, [ofertas, busqueda]);

  if (ofertas.length === 0) {
    return (
      <p className="text-[12.5px] text-muted-foreground">
        No hay ofertas publicadas a las que se pueda asociar a esta persona.
      </p>
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!seleccionada) {
      setError("Elegí una oferta");
      return;
    }
    setError(undefined);

    iniciar(async () => {
      const respuesta = await asociarPostulanteAccion(postulanteId, seleccionada);
      if (respuesta.ok) {
        toast.success(respuesta.mensaje);
        setSeleccionada("");
        setBusqueda("");
      } else {
        toast.error(respuesta.mensaje);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
      {ofertas.length > 5 && (
        <div className="relative">
          <SearchIcon className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" aria-hidden="true" />
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Filtrar por puesto o empresa…"
            className="h-9 w-full rounded-md border border-input bg-card pl-8 pr-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      )}

      <Field data-invalid={error ? true : undefined}>
        <FieldLabel htmlFor={`asociar-${postulanteId}`}>
          Oferta publicada {busqueda && `(${ofertasFiltradas.length} encontradas)`}
        </FieldLabel>
        <SelectorNativo
          id={`asociar-${postulanteId}`}
          name="oferta"
          value={seleccionada}
          onChange={(e) => {
            setSeleccionada(e.target.value);
            setError(undefined);
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `asociar-${postulanteId}-error` : undefined}
        >
          <option value="" disabled>
            {ofertasFiltradas.length > 0 ? "Elegí una oferta de la lista" : "Sin coincidencias"}
          </option>
          {ofertasFiltradas.map((o) => (
            <option key={o.id} value={o.id}>
              {o.titulo} · {o.empresa}
            </option>
          ))}
        </SelectorNativo>
        <FieldError id={`asociar-${postulanteId}-error`}>{error}</FieldError>
      </Field>

      <BotonAdmin type="submit" variante="primario" disabled={pendiente || !seleccionada} className="self-start">
        {pendiente ? "Asociando…" : "Asociar a la oferta"}
      </BotonAdmin>
    </form>
  );
}
