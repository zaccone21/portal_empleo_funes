"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";

import { FieldGroup } from "@/components/ui/field";
import { useNuevaContrasena } from "@/hooks/useNuevaContrasena";
import { PASSWORD_MIN_LENGTH, formularioNuevaContrasenaSchema } from "@/lib/validation/auth";

import { BotonEnviar } from "./BotonEnviar";
import { CampoContrasena } from "./CampoContrasena";
import { ErrorDelServidor } from "./ErrorDelServidor";

type Errores = Partial<Record<"password" | "repetirPassword", string[]>>;

/**
 * Form to set a new password, shared by applicants and companies. The user
 * gets here from the recovery email, whose link already opened a session, so
 * there is no role to pick: the server knows who it is.
 *
 * On submit:
 * 1. Validates with formularioNuevaContrasenaSchema (length from D-020 and
 *    both passwords equal).
 * 2. Sends only the password with useNuevaContrasena.
 * 3. On success shows a toast and goes to `destino` with router.replace, so
 *    going back does not reopen this form. A toast is enough here, unlike in
 *    registration, because the next screen already shows the user is inside.
 * 4. If the link expired, the server answers 401 and its message is shown
 *    above the button.
 */
export function FormularioNuevaContrasena() {
  const router = useRouter();
  const { cambiarContrasena, loading, error } = useNuevaContrasena();
  const [errores, setErrores] = useState<Errores>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const resultado = formularioNuevaContrasenaSchema.safeParse({
      password: formData.get("password"),
      repetirPassword: formData.get("repetirPassword"),
    });

    if (!resultado.success) {
      setErrores(z.flattenError(resultado.error).fieldErrors);
      return;
    }

    setErrores({});
    const destino = await cambiarContrasena({ password: resultado.data.password });
    if (destino) {
      toast.success("Listo, cambiaste tu contraseña.");
      router.replace(destino);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <FieldGroup className="gap-5">
        <CampoContrasena
          id="password"
          name="password"
          label="Contraseña nueva"
          autoComplete="new-password"
          descripcion={`Tiene que tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`}
          error={errores.password?.[0]}
        />
        <CampoContrasena
          id="repetirPassword"
          name="repetirPassword"
          label="Repetí la contraseña nueva"
          autoComplete="new-password"
          error={errores.repetirPassword?.[0]}
        />
      </FieldGroup>
      <ErrorDelServidor error={error} />
      <BotonEnviar loading={loading} texto="Guardar contraseña" textoCargando="Guardando…" />
    </form>
  );
}
