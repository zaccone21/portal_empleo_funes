"use client";

import { useState, type FormEvent } from "react";
import { z } from "zod";

import { BotonEnviar } from "@/components/auth/BotonEnviar";
import { ErrorDelServidor } from "@/components/auth/ErrorDelServidor";
import { CampoTexto } from "@/components/formularios/CampoTexto";
import { IconoRubro } from "@/components/ofertas/IconoRubro";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { perfilPostulanteSchema, type PerfilPostulante } from "@/lib/validation/postulante-perfil";
import { NOMBRE_RUBRO, RUBROS, type Rubro } from "@/lib/validation/rubros";

type Props = {
  perfil: {
    nombre: string;
    apellido: string;
    dni: string;
    telefono: string;
    rubros: Rubro[];
  } | null;
  onGuardar: (datos: PerfilPostulante) => Promise<boolean>;
  guardando: boolean;
  error: string | null;
};

type Errores = Partial<Record<keyof PerfilPostulante, string[]>>;

export function FormularioPerfilPostulante({ perfil, onGuardar, guardando, error }: Props) {
  const [errores, setErrores] = useState<Errores>({});
  const [rubrosElegidos, setRubrosElegidos] = useState<Rubro[]>(perfil?.rubros ?? []);

  function cambiarRubro(rubro: Rubro, elegido: boolean) {
    setRubrosElegidos((actuales) => (elegido ? [...actuales, rubro] : actuales.filter((r) => r !== rubro)));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const resultado = perfilPostulanteSchema.safeParse({
      telefono: formData.get("telefono"),
      rubros: formData.getAll("rubros"),
    });

    if (!resultado.success) {
      setErrores(z.flattenError(resultado.error).fieldErrors);
      return;
    }

    setErrores({});
    await onGuardar(resultado.data);
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-8 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card p-5 ring-1 ring-foreground/5 sm:p-7"
    >
      <FieldSet>
        <FieldLegend className="mb-4 font-heading font-semibold data-[variant=legend]:text-xl">Datos personales</FieldLegend>
        
        <div className="mb-6 flex flex-col gap-4 rounded-xl border bg-muted/40 p-4 sm:flex-row sm:gap-8">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-muted-foreground">Nombre completo</span>
            <span className="text-base font-medium text-foreground">{perfil?.nombre} {perfil?.apellido}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-muted-foreground">DNI</span>
            <span className="text-base font-medium text-foreground">{perfil?.dni}</span>
          </div>
        </div>

        <FieldGroup className="gap-6">
          <CampoTexto
            id="telefono"
            label="Teléfono de contacto"
            descripcion="Con código de área, por ejemplo: 341 555-1234."
            defaultValue={perfil?.telefono}
            error={errores.telefono?.[0]}
            type="tel"
            autoComplete="tel"
            maxLength={30}
            obligatorio
          />
        </FieldGroup>
      </FieldSet>

      <FieldSet>
        <FieldLegend className="mb-2.5 inline-flex items-baseline gap-2 font-heading font-semibold text-foreground data-[variant=legend]:text-xl">
          ¿En qué rubros buscás trabajo?
          <span aria-hidden="true" className="font-sans text-sm font-normal text-muted-foreground">
            {rubrosElegidos.length} elegidos
          </span>
        </FieldLegend>
        <p className="mb-4 text-sm text-muted-foreground">Podés elegir todos los que quieras.</p>
        
        <FieldGroup className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {RUBROS.map((rubro) => {
            const elegido = rubrosElegidos.includes(rubro);
            const id = `rubro-${rubro}`;
            
            return (
              <Field
                key={rubro}
                data-invalid={errores.rubros !== undefined ? "" : undefined}
                className="relative flex cursor-pointer gap-3 rounded-md border p-3 pl-4 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 hover:bg-muted/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
              >
                <div className="mt-0.5 flex shrink-0 items-center justify-center text-muted-foreground">
                  <IconoRubro rubro={rubro} className="size-5" />
                </div>
                <div className="flex grow flex-col gap-0.5">
                  <FieldLabel htmlFor={id} className="cursor-pointer text-sm font-medium">
                    {NOMBRE_RUBRO[rubro]}
                  </FieldLabel>
                </div>
                <div className="flex shrink-0 items-center justify-center pl-2">
                  <Checkbox
                    id={id}
                    name="rubros"
                    value={rubro}
                    checked={elegido}
                    onCheckedChange={(c) => cambiarRubro(rubro, c === true)}
                    className="size-5 shrink-0 shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    aria-invalid={errores.rubros !== undefined}
                  />
                </div>
              </Field>
            );
          })}
        </FieldGroup>
        {errores.rubros && (
          <FieldError className="mt-2 text-sm font-medium text-destructive">{errores.rubros[0]}</FieldError>
        )}
      </FieldSet>

      <div className="flex flex-col gap-3">
        {error && <ErrorDelServidor error={error} />}
        <BotonEnviar loading={guardando} texto="Guardar datos" textoCargando="Guardando..." />
      </div>
    </form>
  );
}
