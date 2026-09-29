"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";

import { BotonEnviar } from "@/components/auth/BotonEnviar";
import { ErrorDelServidor } from "@/components/auth/ErrorDelServidor";
import { CampoTexto } from "@/components/formularios/CampoTexto";
import { SelectorNativo } from "@/components/formularios/SelectorNativo";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { useCrearOferta } from "@/hooks/useCrearOferta";
import { nuevaOfertaSchema, type DatosNuevaOferta } from "@/lib/validation/ofertas";
import { NOMBRE_RUBRO, RUBROS } from "@/lib/validation/rubros";

type Errores = Partial<Record<keyof DatosNuevaOferta, string[]>>;

/**
 * "Publicar una oferta" (P11, RF1.3.3). Every field is required and there are
 * no drafts (D-007): the offer is either sent or not.
 *
 * On submit:
 * 1. Reads the fields with FormData and validates them with nuevaOfertaSchema
 *    (the same schema the server uses). Each missing field gets its message
 *    underneath.
 * 2. Sends them with useCrearOferta. The button is disabled while sending.
 * 3. On success: a toast says the Office will review it, and the page goes to
 *    "Mis ofertas" with the new offer open, where it shows as "Pendiente".
 * 4. On failure: the server's message above the button, and the form keeps
 *    what was typed.
 */
export function FormularioOferta() {
  const router = useRouter();
  const { crear, loading, error } = useCrearOferta();
  const [errores, setErrores] = useState<Errores>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const resultado = nuevaOfertaSchema.safeParse({
      titulo: formData.get("titulo"),
      descripcion: formData.get("descripcion"),
      requisitos: formData.get("requisitos"),
      lugar: formData.get("lugar"),
      jornada: formData.get("jornada"),
      rubro: formData.get("rubro"),
    });

    if (!resultado.success) {
      setErrores(z.flattenError(resultado.error).fieldErrors);
      return;
    }

    setErrores({});
    const oferta = await crear(resultado.data);
    if (oferta) {
      toast.success("Enviaste la oferta. La Oficina de Empleo la revisa antes de publicarla.");
      router.push(`/empresa/ofertas?oferta=${encodeURIComponent(oferta.id)}`);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-6 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card p-5 ring-1 ring-foreground/5 sm:p-7"
    >
      <FieldGroup className="gap-6">
        <CampoTexto
          id="titulo"
          label="Puesto"
          descripcion="Por ejemplo: Ayudante de cocina."
          error={errores.titulo?.[0]}
          maxLength={120}
        />
        <Field data-invalid={errores.rubro ? true : undefined}>
          <FieldLabel htmlFor="rubro" className="text-base">
            Rubro
          </FieldLabel>
          <FieldDescription id="rubro-descripcion">Así la encuentran quienes buscan en ese rubro.</FieldDescription>
          <SelectorNativo
            id="rubro"
            name="rubro"
            defaultValue=""
            aria-invalid={errores.rubro ? true : undefined}
            aria-describedby={errores.rubro ? "rubro-descripcion rubro-error" : "rubro-descripcion"}
          >
            <option value="" disabled>
              Elegí un rubro
            </option>
            {RUBROS.map((rubro) => (
              <option key={rubro} value={rubro}>
                {NOMBRE_RUBRO[rubro]}
              </option>
            ))}
          </SelectorNativo>
          <FieldError id="rubro-error">{errores.rubro?.[0]}</FieldError>
        </Field>
        <CampoTexto
          id="descripcion"
          label="Qué va a hacer la persona"
          descripcion="Las tareas del día a día."
          error={errores.descripcion?.[0]}
          multilinea
          maxLength={3000}
        />
        <CampoTexto
          id="requisitos"
          label="Qué tiene que tener"
          descripcion="Experiencia, estudios, carnet de conducir, lo que sea imprescindible."
          error={errores.requisitos?.[0]}
          multilinea
          maxLength={2000}
        />
        <CampoTexto
          id="lugar"
          label="Dónde es el trabajo"
          descripcion="Barrio o zona de Funes."
          error={errores.lugar?.[0]}
          maxLength={120}
        />
        <CampoTexto
          id="jornada"
          label="Días y horario"
          descripcion="Por ejemplo: Lunes a viernes de 8 a 16."
          error={errores.jornada?.[0]}
          maxLength={120}
        />
      </FieldGroup>
      <p className="text-base text-muted-foreground">
        Al enviarla, la oferta queda pendiente hasta que la Oficina de Empleo la revise.
      </p>
      <ErrorDelServidor error={error} />
      <BotonEnviar loading={loading} texto="Enviar oferta" textoCargando="Enviando…" />
    </form>
  );
}
