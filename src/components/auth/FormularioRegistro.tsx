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
import { CampoDni } from "./CampoDni";
import { CampoCuit } from "./CampoCuit";
import { ErrorDelServidor } from "./ErrorDelServidor";

type Props = {
  /** Account type, fixed by the page that shows the form (P02 applicant, P08 company). */
  rol: RolRegistrable;
  /** Where the person was before (?volver=), for example the offer they wanted to apply to. Only internal paths are used. */
  volver?: string;
};

type Errores = Partial<Record<"email" | "password" | "repetirPassword" | "dni" | "cuit", string[]>>;

/**
 * Registration form for applicants (P02) and companies (P08).
 * Asks for email, password, and an identifier (DNI for applicants, CUIT for companies).
 *
 * On submit:
 * 1. Validates with formularioRegistroSchema.
 * 2. Sends data with useRegistro.
 * 3. On success: shows "Revisá tu correo" or redirects.
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
      role: rol,
      email: formData.get("email"),
      password: formData.get("password"),
      repetirPassword: formData.get("repetirPassword"),
      dni: formData.get("dni"),
      cuit: formData.get("cuit"),
    });

    if (!resultado.success) {
      setErrores(z.flattenError(resultado.error).fieldErrors);
      return;
    }

    setErrores({});
    const { repetirPassword, ...datosRegistro } = resultado.data;
    const respuesta = await registrar(datosRegistro);
    if (!respuesta) return;
    if (respuesta.destino) {
      router.replace(esRutaInterna(volver) ? volver : respuesta.destino);
    } else {
      setEmailRegistrado(resultado.data.email);
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
        {rol === "postulante" && <CampoDni error={errores.dni?.[0]} />}
        {rol === "empresa" && <CampoCuit error={errores.cuit?.[0]} />}
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
