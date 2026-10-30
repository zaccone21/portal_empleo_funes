"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AlertCircleIcon } from "lucide-react";
import { z } from "zod";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FieldGroup } from "@/components/ui/field";
import { useIngreso } from "@/hooks/useIngreso";
import { esRutaInterna } from "@/lib/rutas";
import { ingresoSchema, type DatosIngreso } from "@/lib/validation/auth";

import { AvisoRevisaTuCorreo } from "./AvisoRevisaTuCorreo";
import { BotonEnviar } from "./BotonEnviar";
import { CampoContrasena } from "./CampoContrasena";
import { CampoEmail } from "./CampoEmail";
import { ErrorDelServidor } from "./ErrorDelServidor";

type Errores = Partial<Record<keyof DatosIngreso, string[]>>;

type Props = {
  /**
   * Where the person was before being asked to log in (?volver= in the URL),
   * for example the offer they wanted to apply to. Only used if it is a path
   * of this site (esRutaInterna); otherwise the server's `destino` wins.
   */
  volver?: string;
  /**
   * True when the user arrived from `/acceso/confirmar` with an expired or
   * already-used confirmation link (`?error=enlace_vencido`).
   */
  enlaceVencido?: boolean;
  /**
   * Customizes the identifier field label and placeholder depending on whether
   * the login screen is for an applicant (Email o DNI), a company (Email o CUIT),
   * or an Office operator (Email).
   */
  modoAcceso?: "postulante" | "empresa" | "admin";
};

/**
 * Login form, the same for the three portals (P02, P08, P13). The page
 * decides the title and the links; this component handles the whole submit.
 *
 * Supports logging in with Email or DNI (for applicants) and Email or CUIT
 * (for companies).
 */
export function FormularioIngreso({ volver, enlaceVencido, modoAcceso }: Props) {
  const router = useRouter();
  const { ingresar, loading, error } = useIngreso();
  const [errores, setErrores] = useState<Errores>({});
  const [ultimoEmailIntentado, setUltimoEmailIntentado] = useState<string>("");

  const configuracionIdentificador =
    modoAcceso === "postulante"
      ? {
          label: "Email o DNI",
          placeholder: "Ej: tu@correo.com o 40123456",
          permitirDocumento: true,
        }
      : modoAcceso === "empresa"
        ? {
            label: "Email o CUIT",
            placeholder: "Ej: empresa@correo.com o 30-12345678-9",
            permitirDocumento: true,
          }
        : {
            label: "Email",
            placeholder: "Ej: tu@correo.com",
            permitirDocumento: true,
          };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const resultado = ingresoSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!resultado.success) {
      setErrores(z.flattenError(resultado.error).fieldErrors);
      return;
    }

    setErrores({});
    setUltimoEmailIntentado(resultado.data.email);
    const destino = await ingresar(resultado.data);
    if (destino) {
      router.replace(esRutaInterna(volver) ? volver : destino);
    }
  }

  const cuentaSinConfirmar = Boolean(
    error &&
      error.includes("Todavía no activaste tu cuenta") &&
      ultimoEmailIntentado &&
      ultimoEmailIntentado.includes("@"),
  );

  if (cuentaSinConfirmar) {
    const correo = ultimoEmailIntentado;
    return (
      <AvisoRevisaTuCorreo email={correo} volver={volver}>
        Tu cuenta (<strong className="break-all">{correo}</strong>) todavía no está activada.
        Podés ingresar el código de 6 dígitos que recibiste por correo o pedir que te enviemos un correo nuevo.
      </AvisoRevisaTuCorreo>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      {enlaceVencido ? (
        <Alert>
          <AlertCircleIcon aria-hidden="true" />
          <AlertTitle>El enlace de activación venció o ya fue usado</AlertTitle>
          <AlertDescription>
            Ingresá con tus datos y contraseña: si tu cuenta ya estaba activada vas a entrar directo, y si todavía falta activarla vas a poder pedir un código nuevo.
          </AlertDescription>
        </Alert>
      ) : null}

      <FieldGroup className="gap-5">
        <CampoEmail
          error={errores.email?.[0]}
          obligatorio
          label={configuracionIdentificador.label}
          placeholder={configuracionIdentificador.placeholder}
          permitirDocumento={configuracionIdentificador.permitirDocumento}
        />
        <CampoContrasena
          id="password"
          name="password"
          label="Contraseña"
          autoComplete="current-password"
          error={errores.password?.[0]}
          obligatorio
        />
      </FieldGroup>
      <ErrorDelServidor error={error} />
      <BotonEnviar loading={loading} texto="Ingresar" textoCargando="Ingresando…" />
    </form>
  );
}
