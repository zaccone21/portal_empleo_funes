"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";

import { BotonEnviar } from "@/components/auth/BotonEnviar";
import { ErrorDelServidor } from "@/components/auth/ErrorDelServidor";
import { CampoTexto } from "@/components/formularios/CampoTexto";
import { IconoRubro } from "@/components/ofertas/IconoRubro";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { useCrearOferta } from "@/hooks/useCrearOferta";
import { MAXIMO_RUBROS_OFERTA, nuevaOfertaSchema, type DatosNuevaOferta } from "@/lib/validation/ofertas";
import { NOMBRE_RUBRO, RUBROS, type Rubro } from "@/lib/validation/rubros";

type Errores = Partial<Record<keyof DatosNuevaOferta | "horaInicio" | "horaFin", string[]>>;

export function FormularioOferta({ ofertaPrevia }: { ofertaPrevia?: DatosNuevaOferta | null }) {
  const router = useRouter();
  const { crear, loading, error } = useCrearOferta();
  const [errores, setErrores] = useState<Errores>({});
  const [rubrosElegidos, setRubrosElegidos] = useState<Rubro[]>(ofertaPrevia?.rubros ?? []);
  const llegoAlMaximo = rubrosElegidos.length >= MAXIMO_RUBROS_OFERTA;

  function cambiarRubro(rubro: Rubro, elegido: boolean) {
    setRubrosElegidos((actuales) => (elegido ? [...actuales, rubro] : actuales.filter((r) => r !== rubro)));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const resultado = nuevaOfertaSchema.safeParse({
      titulo: formData.get("titulo"),
      descripcion: formData.get("descripcion"),
      requisitos: formData.get("requisitos"),
      lugar: formData.get("lugar"),
      jornada: formData.get("jornada"),
      sueldo: formData.get("sueldo") ?? "",
      rubros: formData.getAll("rubros"),
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
          defaultValue={ofertaPrevia?.titulo}
          error={errores.titulo?.[0]}
          maxLength={120}
          obligatorio
        />
        <FieldSet aria-describedby={errores.rubros ? "rubros-descripcion rubros-error" : "rubros-descripcion"}>
          <FieldLegend className="mb-1">
            Rubros <span className="ml-1 text-destructive">*</span>
          </FieldLegend>
          <FieldDescription id="rubros-descripcion">
            Elegí de 1 a {MAXIMO_RUBROS_OFERTA}. Así la encuentran quienes buscan en esos rubros.
          </FieldDescription>
          <p aria-live="polite" className="text-base font-medium text-foreground empty:hidden">
            {llegoAlMaximo ? `Elegiste ${MAXIMO_RUBROS_OFERTA}, el máximo. Para cambiar uno, sacá otro.` : null}
          </p>
          <FieldGroup data-slot="checkbox-group" className="grid gap-2 sm:grid-cols-2">
            {RUBROS.map((rubro) => {
              const elegido = rubrosElegidos.includes(rubro);
              const deshabilitado = !elegido && llegoAlMaximo;
              return (
                <FieldLabel key={rubro} className={deshabilitado ? "cursor-not-allowed opacity-50" : undefined}>
                  <Field
                    orientation="horizontal"
                    data-disabled={deshabilitado ? true : undefined}
                    className="min-h-11 items-center"
                  >
                    <Checkbox
                      name="rubros"
                      value={rubro}
                      checked={elegido}
                      disabled={deshabilitado}
                      onCheckedChange={(marcado) => cambiarRubro(rubro, marcado)}
                      aria-invalid={errores.rubros ? true : undefined}
                    />
                    <IconoRubro rubro={rubro} className="size-5 shrink-0 text-primary" />
                    <span className="text-base font-normal">{NOMBRE_RUBRO[rubro]}</span>
                  </Field>
                </FieldLabel>
              );
            })}
          </FieldGroup>
          <FieldError id="rubros-error">{errores.rubros?.[0]}</FieldError>
        </FieldSet>
        <CampoTexto
          id="descripcion"
          label="Qué va a hacer la persona"
          descripcion="Las tareas del día a día."
          defaultValue={ofertaPrevia?.descripcion}
          error={errores.descripcion?.[0]}
          multilinea
          maxLength={3000}
          obligatorio
        />
        <CampoTexto
          id="requisitos"
          label="Qué tiene que tener"
          descripcion="Experiencia, estudios, carnet de conducir, lo que sea imprescindible."
          defaultValue={ofertaPrevia?.requisitos}
          error={errores.requisitos?.[0]}
          multilinea
          maxLength={2000}
          obligatorio
        />
        <CampoTexto
          id="lugar"
          label="Dónde es el trabajo"
          descripcion="Barrio o zona de Funes."
          defaultValue={ofertaPrevia?.lugar}
          error={errores.lugar?.[0]}
          maxLength={120}
          obligatorio
        />
        <CampoTexto
          id="jornada"
          label="Días y descripción horaria"
          descripcion="Por ejemplo: Lunes a viernes."
          defaultValue={ofertaPrevia?.jornada}
          error={errores.jornada?.[0]}
          maxLength={120}
          obligatorio
        />

        {/* Selectores de horario específicos de entrada y salida */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label htmlFor="horaInicio" className="text-sm font-semibold text-foreground">
              Hora de entrada <span className="text-destructive">*</span>
            </label>
            <input
              type="time"
              id="horaInicio"
              name="horaInicio"
              className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="horaFin" className="text-sm font-semibold text-foreground">
              Hora de salida <span className="text-destructive">*</span>
            </label>
            <input
              type="time"
              id="horaFin"
              name="horaFin"
              className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        <CampoTexto
          id="sueldo"
          label="Sueldo (opcional)"
          descripcion="Por ejemplo: A convenir, o $ 500.000 por mes. Si lo dejás vacío, no se muestra."
          defaultValue={ofertaPrevia?.sueldo}
          error={errores.sueldo?.[0]}
          maxLength={120}
        />
      </FieldGroup>
      <p className="text-base text-muted-foreground">
        Al enviarla, la oferta queda pendiente hasta que la Oficina de Empleo la revise.
      </p>
      <div className="flex flex-col gap-4">
        <ErrorDelServidor error={error} />
        {error === "Tenés que completar los datos de tu empresa antes de publicar una oferta." && (
          <Button variant="outline" nativeButton={false} render={<a href="/empresa/perfil" target="_blank" rel="noopener noreferrer" />}>
            Completar mis datos en una pestaña nueva
          </Button>
        )}
        <BotonEnviar loading={loading} texto="Enviar oferta" textoCargando="Enviando…" />
      </div>
    </form>
  );
}