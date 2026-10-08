"use client";

import { useState, type FormEvent } from "react";
import { z } from "zod";

import { FieldGroup } from "@/components/ui/field";
import { useRecuperarContrasena } from "@/hooks/useRecuperarContrasena";
import {
  recuperarContrasenaSchema,
  type DatosRecuperarContrasena,
} from "@/lib/validation/auth";

import { AvisoRevisaTuCorreo } from "./AvisoRevisaTuCorreo";
import { BotonEnviar } from "./BotonEnviar";
import { CampoEmail } from "./CampoEmail";
import { ErrorDelServidor } from "./ErrorDelServidor";

type Errores = Partial<Record<keyof DatosRecuperarContrasena, string[]>>;

/**
 * "Olvidé mi contraseña" form for applicants (P02) and companies (P08). Admin
 * has none (D-020).
 *
 * On submit:
 * 1. Validates the email with recuperarContrasenaSchema.
 * 2. Sends it with useRecuperarContrasena.
 * 3. On success the form is replaced by "Revisá tu correo". The wording ("Si
 *    hay una cuenta con ese email…") is deliberate: the server answers the
 *    same for any email, and the screen must not confirm whether an account
 *    exists (AGENTS §7).
 * The email brings the user to /nueva-contrasena.
 */
export function FormularioRecuperarContrasena() {
  const { pedirEnlace, loading, error } = useRecuperarContrasena();
  const [errores, setErrores] = useState<Errores>({});
  const [enviado, setEnviado] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const resultado = recuperarContrasenaSchema.safeParse({ email: formData.get("email") });

    if (!resultado.success) {
      setErrores(z.flattenError(resultado.error).fieldErrors);
      return;
    }

    setErrores({});
    setEnviado(await pedirEnlace(resultado.data));
  }

  if (enviado) {
    return (
      <AvisoRevisaTuCorreo>
        Si hay una cuenta con ese email, te va a llegar un enlace para crear una contraseña nueva.
      </AvisoRevisaTuCorreo>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <FieldGroup className="gap-5">
        <CampoEmail error={errores.email?.[0]} obligatorio />
      </FieldGroup>
      <ErrorDelServidor error={error} />
      <BotonEnviar loading={loading} texto="Enviar enlace" textoCargando="Enviando…" />
    </form>
  );
}
