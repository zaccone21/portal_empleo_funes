"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { FieldGroup } from "@/components/ui/field";
import { useIngreso } from "@/hooks/useIngreso";
import { ingresoSchema, type DatosIngreso } from "@/lib/validation/auth";

import { BotonEnviar } from "./BotonEnviar";
import { CampoContrasena } from "./CampoContrasena";
import { CampoEmail } from "./CampoEmail";
import { ErrorDelServidor } from "./ErrorDelServidor";

type Errores = Partial<Record<keyof DatosIngreso, string[]>>;

/**
 * Login form, the same for the three portals (P02, P08, P13). The page
 * decides the title and the links; this component handles the whole submit.
 *
 * On submit:
 * 1. Reads the values with FormData (uncontrolled inputs).
 * 2. Validates them with ingresoSchema, the same schema the server uses. If
 *    something is wrong, shows each message under its field and stops.
 * 3. Sends them with useIngreso. The button is disabled while waiting.
 * 4. If the server accepts them, goes to `destino` with router.replace, so the
 *    back button does not return to the login. If not, the server's message
 *    is shown above the button.
 *
 * The portal does not limit who can log in: the server decides `destino` from
 * the role stored in `profiles`, so a company that logs in from the applicant
 * screen still lands on /empresa. Permission checks happen on the server
 * (AGENTS §7), not here.
 *
 * `noValidate` turns off the browser's own bubbles, which appear in the
 * phone's language and style, so only our messages are shown.
 */
export function FormularioIngreso() {
  const router = useRouter();
  const { ingresar, loading, error } = useIngreso();
  const [errores, setErrores] = useState<Errores>({});

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
    const destino = await ingresar(resultado.data);
    if (destino) {
      router.replace(destino);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <FieldGroup className="gap-5">
        <CampoEmail error={errores.email?.[0]} />
        <CampoContrasena
          id="password"
          name="password"
          label="Contraseña"
          autoComplete="current-password"
          error={errores.password?.[0]}
        />
      </FieldGroup>
      <ErrorDelServidor error={error} />
      <BotonEnviar loading={loading} texto="Ingresar" textoCargando="Ingresando…" />
    </form>
  );
}
