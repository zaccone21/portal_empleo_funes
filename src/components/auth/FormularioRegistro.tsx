"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { FieldGroup } from "@/components/ui/field";
import { useRegistro } from "@/hooks/useRegistro";
import { esRutaInterna } from "@/lib/rutas";
import {
  PASSWORD_MIN_LENGTH,
  formularioRegistroSchema,
  type RolRegistrable,
} from "@/lib/validation/auth";

import { AvisoRevisaTuCorreo } from "./AvisoRevisaTuCorreo";
import { BotonEnviar } from "./BotonEnviar";
import { CampoContrasena } from "./CampoContrasena";
import { CampoEmail } from "./CampoEmail";
import { ErrorDelServidor } from "./ErrorDelServidor";

type Props = {
  /** Account type, fixed by the page that shows the form (P02 applicant, P08 company). */
  rol: RolRegistrable;
  /** Where the person was before (?volver=), for example the offer they wanted to apply to. Only internal paths are used. */
  volver?: string;
};

type Errores = Partial<Record<"email" | "password" | "repetirPassword", string[]>>;

/**
 * Registration form for applicants (P02) and companies (P08). It asks only for
 * email and password: profile data is filled in later (P03, P10), and the
 * applicant fields are still open (Q-009). Collecting the minimum also follows
 * Law 25.326.
 *
 * On submit:
 * 1. Validates with formularioRegistroSchema: valid email, password length
 *    (D-020) and both passwords equal. Errors go under each field.
 * 2. Sends email, password and `rol` with useRegistro. The repeated password
 *    stays on screen. The role is not a field the user fills in, so nobody
 *    can register as "admin" (RF1.1.4).
 * 3. On success (D-034):
 *    - if the account must be activated from the email, the form is replaced
 *      by "Revisá tu correo" with the email typed, so the user can spot a typo;
 *    - if Supabase logged the person in right away (confirmation off), the
 *      page goes back to `volver`, or to the role's home.
 * 4. On failure the form stays with the server's message.
 * The server answers the same when the email was already registered, so this
 * screen cannot be used to find out who has an account (AGENTS §7).
 */
export function FormularioRegistro({ rol, volver }: Props) {
  const router = useRouter();
  const { registrar, loading, error } = useRegistro();
  const [errores, setErrores] = useState<Errores>({});
  const [emailRegistrado, setEmailRegistrado] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const resultado = formularioRegistroSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
      repetirPassword: formData.get("repetirPassword"),
    });

    if (!resultado.success) {
      setErrores(z.flattenError(resultado.error).fieldErrors);
      return;
    }

    setErrores({});
    const { email, password } = resultado.data;
    const respuesta = await registrar({ email, password, role: rol });
    if (!respuesta) return;
    if (respuesta.destino) {
      router.replace(esRutaInterna(volver) ? volver : respuesta.destino);
    } else {
      setEmailRegistrado(email);
    }
  }

  if (emailRegistrado) {
    return (
      <AvisoRevisaTuCorreo>
        Te mandamos un email a <strong className="break-all">{emailRegistrado}</strong>. Abrilo y
        tocá el enlace para activar tu cuenta.
      </AvisoRevisaTuCorreo>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <FieldGroup className="gap-5">
        <CampoEmail error={errores.email?.[0]} />
        <CampoContrasena
          id="password"
          name="password"
          label="Contraseña"
          autoComplete="new-password"
          descripcion={`Tiene que tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`}
          error={errores.password?.[0]}
        />
        <CampoContrasena
          id="repetirPassword"
          name="repetirPassword"
          label="Repetí la contraseña"
          autoComplete="new-password"
          error={errores.repetirPassword?.[0]}
        />
      </FieldGroup>
      <ErrorDelServidor error={error} />
      <BotonEnviar loading={loading} texto="Crear cuenta" textoCargando="Creando cuenta…" />
    </form>
  );
}
