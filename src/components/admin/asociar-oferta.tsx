"use client";

import { useState, useTransition, type FormEvent } from "react";
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
 * the person is applied to it, as if they had done it themselves. The list is
 * the phone's own selector (DESIGN §5). The Server Action checks again that the
 * offer is published and that the person was not there already.
 */
export function AsociarOferta({ postulanteId, ofertas }: Props) {
  const [pendiente, iniciar] = useTransition();
  const [error, setError] = useState<string | undefined>(undefined);

  if (ofertas.length === 0) {
    return (
      <p className="text-[12.5px] text-muted-foreground">No hay ofertas publicadas a las que se pueda asociar a esta persona.</p>
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const ofertaId = String(new FormData(event.currentTarget).get("oferta") ?? "");
    if (!ofertaId) {
      setError("Elegí una oferta");
      return;
    }
    setError(undefined);

    iniciar(async () => {
      const respuesta = await asociarPostulanteAccion(postulanteId, ofertaId);
      if (respuesta.ok) toast.success(respuesta.mensaje);
      else toast.error(respuesta.mensaje);
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-2">
      <Field data-invalid={error ? true : undefined}>
        <FieldLabel htmlFor={`asociar-${postulanteId}`}>Oferta publicada</FieldLabel>
        <SelectorNativo
          id={`asociar-${postulanteId}`}
          name="oferta"
          defaultValue=""
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `asociar-${postulanteId}-error` : undefined}
        >
          <option value="" disabled>
            Elegí una oferta
          </option>
          {ofertas.map((o) => (
            <option key={o.id} value={o.id}>
              {o.titulo} · {o.empresa}
            </option>
          ))}
        </SelectorNativo>
        <FieldError id={`asociar-${postulanteId}-error`}>{error}</FieldError>
      </Field>
      <BotonAdmin type="submit" variante="primario" disabled={pendiente} className="self-start">
        {pendiente ? "Asociando…" : "Asociar a la oferta"}
      </BotonAdmin>
    </form>
  );
}
