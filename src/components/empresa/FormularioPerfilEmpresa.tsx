"use client";

import { useState, type FormEvent } from "react";
import { z } from "zod";

import { BotonEnviar } from "@/components/auth/BotonEnviar";
import { ErrorDelServidor } from "@/components/auth/ErrorDelServidor";
import { CampoTexto } from "@/components/formularios/CampoTexto";
import { FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field";
import { perfilEmpresaSchema, type PerfilEmpresa } from "@/lib/validation/empresa";

type Props = {
  /** Saved data to start from, or null the first time. */
  perfil: PerfilEmpresa | null;
  /** Saves the data; resolves to true when it worked. */
  onGuardar: (datos: PerfilEmpresa) => Promise<boolean>;
  guardando: boolean;
  /** Server message of the last failed save. */
  error: string | null;
};

type Errores = Partial<Record<keyof PerfilEmpresa, string[]>>;

/**
 * Company data form (P10, RF1.3.2), in two groups: the company (name, CUIT,
 * description) and the contact person (name, phone, email).
 *
 * On submit it validates with perfilEmpresaSchema, which also checks that
 * the CUIT's check digit is right (it catches typos), and hands the data to
 * `onGuardar`. Errors go under each field; the server's message, above the
 * button.
 */
export function FormularioPerfilEmpresa({ perfil, onGuardar, guardando, error }: Props) {
  const [errores, setErrores] = useState<Errores>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const resultado = perfilEmpresaSchema.safeParse({
      razonSocial: formData.get("razonSocial"),
      cuit: formData.get("cuit"),
      descripcion: formData.get("descripcion") ?? "",
      contactoNombre: formData.get("contactoNombre"),
      contactoTelefono: formData.get("contactoTelefono"),
      contactoEmail: formData.get("contactoEmail"),
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
        <FieldLegend className="mb-4 font-heading font-semibold data-[variant=legend]:text-xl">La empresa</FieldLegend>
        <FieldGroup className="gap-6">
          <CampoTexto
            id="razonSocial"
            label="Razón social"
            defaultValue={perfil?.razonSocial}
            error={errores.razonSocial?.[0]}
            autoComplete="organization"
            maxLength={120}
          />
          <CampoTexto
            id="cuit"
            label="CUIT"
            descripcion="11 números, con o sin guiones."
            defaultValue={perfil?.cuit}
            error={errores.cuit?.[0]}
            inputMode="numeric"
            maxLength={13}
          />
          <CampoTexto
            id="descripcion"
            label="A qué se dedica (opcional)"
            descripcion="Ayuda a la Oficina a presentar la empresa a los candidatos."
            defaultValue={perfil?.descripcion}
            error={errores.descripcion?.[0]}
            multilinea
            maxLength={1000}
          />
        </FieldGroup>
      </FieldSet>
      <FieldSet>
        <FieldLegend className="mb-4 font-heading font-semibold data-[variant=legend]:text-xl">Persona de contacto</FieldLegend>
        <FieldGroup className="gap-6">
          <CampoTexto
            id="contactoNombre"
            label="Nombre y apellido"
            defaultValue={perfil?.contactoNombre}
            error={errores.contactoNombre?.[0]}
            autoComplete="name"
            maxLength={120}
          />
          <CampoTexto
            id="contactoTelefono"
            label="Teléfono"
            descripcion="Por ejemplo: 341 555-1234."
            defaultValue={perfil?.contactoTelefono}
            error={errores.contactoTelefono?.[0]}
            autoComplete="tel"
            inputMode="tel"
            maxLength={20}
          />
          <CampoTexto
            id="contactoEmail"
            label="Email"
            defaultValue={perfil?.contactoEmail}
            error={errores.contactoEmail?.[0]}
            autoComplete="email"
            inputMode="email"
            maxLength={120}
          />
        </FieldGroup>
      </FieldSet>
      <ErrorDelServidor error={error} />
      <BotonEnviar loading={guardando} texto="Guardar datos" textoCargando="Guardando…" />
    </form>
  );
}
