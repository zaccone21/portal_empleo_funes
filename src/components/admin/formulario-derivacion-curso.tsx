"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { BotonAdmin } from "@/components/admin/boton-admin";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { registrarDerivacionCursoAccion } from "@/lib/actions/oficina";
import { hoyArgentino } from "@/lib/admin/fechas";
import { derivacionCursoSchema, type DatosDerivacionCurso } from "@/lib/validation/oficina";

type Errores = Partial<Record<keyof DatosDerivacionCurso, string[]>>;

/**
 * Registers that the Office referred the applicant to a training course (P19,
 * RF1.6.6, D-047): the course name, the day (today by default) and notes.
 * Validated with the same schema as the Server Action; errors go under their
 * field and the result in a toast. On success the form is emptied for the next one.
 */
export function FormularioDerivacionCurso({ postulanteId }: { postulanteId: string }) {
  const formulario = useRef<HTMLFormElement>(null);
  const [pendiente, iniciar] = useTransition();
  const [errores, setErrores] = useState<Errores>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const resultado = derivacionCursoSchema.safeParse({
      curso: formData.get("curso") ?? "",
      fecha: formData.get("curso-fecha") || undefined,
      notas: formData.get("curso-notas") ?? "",
    });
    if (!resultado.success) {
      setErrores(z.flattenError(resultado.error).fieldErrors);
      return;
    }
    setErrores({});

    iniciar(async () => {
      const respuesta = await registrarDerivacionCursoAccion(postulanteId, resultado.data);
      if (respuesta.ok) {
        toast.success(respuesta.mensaje);
        formulario.current?.reset();
      } else {
        toast.error(respuesta.mensaje);
      }
    });
  }

  return (
    <form
      ref={formulario}
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-3 rounded-[10px] border border-border bg-surface p-3"
    >
      <span className="text-[11px] font-medium text-muted-foreground uppercase">Derivar a un curso</span>
      <FieldGroup className="gap-3">
        <Field data-invalid={errores.curso ? true : undefined}>
          <FieldLabel htmlFor="curso">Curso</FieldLabel>
          <Input
            id="curso"
            name="curso"
            maxLength={120}
            aria-invalid={errores.curso ? true : undefined}
            aria-describedby={errores.curso ? "curso-error" : undefined}
          />
          <FieldError id="curso-error">{errores.curso?.[0]}</FieldError>
        </Field>
        <Field data-invalid={errores.fecha ? true : undefined}>
          <FieldLabel htmlFor="curso-fecha">Fecha</FieldLabel>
          <Input
            id="curso-fecha"
            name="curso-fecha"
            type="date"
            defaultValue={hoyArgentino()}
            aria-invalid={errores.fecha ? true : undefined}
            aria-describedby={errores.fecha ? "curso-fecha-error" : undefined}
          />
          <FieldError id="curso-fecha-error">{errores.fecha?.[0]}</FieldError>
        </Field>
        <Field data-invalid={errores.notas ? true : undefined}>
          <FieldLabel htmlFor="curso-notas">Notas (opcional)</FieldLabel>
          <Textarea id="curso-notas" name="curso-notas" maxLength={1000} className="min-h-20" />
          <FieldError>{errores.notas?.[0]}</FieldError>
        </Field>
      </FieldGroup>
      <BotonAdmin type="submit" variante="primario" disabled={pendiente} className="self-start">
        {pendiente ? "Registrando…" : "Registrar derivación"}
      </BotonAdmin>
    </form>
  );
}
