"use client";

import { useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";

import { BotonAdmin } from "@/components/admin/boton-admin";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { registrarPreentrevistaAccion } from "@/lib/actions/oficina";
import { aValorFechaHora, desdeValorFechaHora, fechaHora } from "@/lib/admin/fechas";
import type { PostulacionAdmin } from "@/lib/validation/oficina";

type Props = {
  postulacionId: string;
  preentrevista: PostulacionAdmin["preentrevista"];
};

/**
 * The optional pre-interview of an application (P15, RF1.6.1, D-045): date and
 * time (typed in Argentine time) and notes. Saving again replaces it. The
 * Server Action validates it again and refreshes the Office screens; a toast
 * says how it went.
 */
export function FormularioPreentrevista({ postulacionId, preentrevista }: Props) {
  const [pendiente, iniciar] = useTransition();
  const [errorFecha, setErrorFecha] = useState<string | undefined>(undefined);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const fecha = String(formData.get("preentrevista-fecha") ?? "");
    if (!fecha) {
      setErrorFecha("Elegí la fecha de la preentrevista");
      return;
    }
    setErrorFecha(undefined);

    iniciar(async () => {
      const respuesta = await registrarPreentrevistaAccion(postulacionId, {
        fecha: desdeValorFechaHora(fecha),
        notas: String(formData.get("preentrevista-notas") ?? ""),
      });
      if (respuesta.ok) toast.success(respuesta.mensaje);
      else toast.error(respuesta.mensaje);
    });
  }

  return (
    <form
      // Remounts the fields when the saved pre-interview changes: Base UI does not allow changing the default value of a mounted field.
      key={`${preentrevista?.fecha ?? ""}|${preentrevista?.notas ?? ""}`}
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-3 rounded-[10px] border border-border bg-surface p-3"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-[11px] font-medium text-muted-foreground uppercase">Preentrevista (opcional)</span>
        {preentrevista && (
          <span className="text-[12px] text-muted-foreground">Registrada para el {fechaHora(preentrevista.fecha)}</span>
        )}
      </div>
      <FieldGroup className="gap-3">
        <Field data-invalid={errorFecha ? true : undefined}>
          <FieldLabel htmlFor="preentrevista-fecha">Fecha y hora</FieldLabel>
          <Input
            id="preentrevista-fecha"
            name="preentrevista-fecha"
            type="datetime-local"
            defaultValue={preentrevista ? aValorFechaHora(preentrevista.fecha) : undefined}
            aria-invalid={errorFecha ? true : undefined}
            aria-describedby={errorFecha ? "preentrevista-fecha-error" : undefined}
          />
          <FieldError id="preentrevista-fecha-error">{errorFecha}</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="preentrevista-notas">Notas</FieldLabel>
          <Textarea
            id="preentrevista-notas"
            name="preentrevista-notas"
            defaultValue={preentrevista?.notas ?? undefined}
            maxLength={2000}
            className="min-h-20"
          />
        </Field>
      </FieldGroup>
      <BotonAdmin type="submit" variante="primario" disabled={pendiente} className="self-start">
        {pendiente ? "Guardando…" : "Guardar preentrevista"}
      </BotonAdmin>
    </form>
  );
}
