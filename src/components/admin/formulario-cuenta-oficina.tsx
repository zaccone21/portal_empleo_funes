"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { CopyIcon, KeyRoundIcon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { BotonAdmin } from "@/components/admin/boton-admin";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { crearCuentaOficinaAccion } from "@/lib/actions/oficina";
import { nuevaCuentaOficinaSchema } from "@/lib/validation/equipo";

type Creada = { email: string; contrasenaTemporal: string };

/**
 * "Crear una cuenta de operadora" (P21, D-058). Only the email is asked: the
 * server makes a temporary password and it is shown here once, with "Copiar",
 * to hand over in person. Leaving or reloading the page hides it for good.
 * Validated with the same schema as the Server Action; the error goes under
 * the field and the server's answer in a toast.
 */
export function FormularioCuentaOficina() {
  const formulario = useRef<HTMLFormElement>(null);
  const [pendiente, iniciar] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [creada, setCreada] = useState<Creada | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const resultado = nuevaCuentaOficinaSchema.safeParse({
      email: new FormData(event.currentTarget).get("email-operadora") ?? "",
    });
    if (!resultado.success) {
      setError(z.flattenError(resultado.error).fieldErrors.email?.[0] ?? null);
      return;
    }
    setError(null);

    iniciar(async () => {
      const respuesta = await crearCuentaOficinaAccion(resultado.data);
      if (respuesta.ok) {
        setCreada({ email: respuesta.email, contrasenaTemporal: respuesta.contrasenaTemporal });
        toast.success(`Creaste la cuenta de ${respuesta.email}.`);
        formulario.current?.reset();
      } else {
        toast.error(respuesta.mensaje);
      }
    });
  }

  async function copiar(texto: string) {
    try {
      await navigator.clipboard.writeText(texto);
      toast.success("Contraseña copiada.");
    } catch {
      toast.error("No pudimos copiarla. Anotala a mano.");
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <form
        ref={formulario}
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-3 rounded-[10px] border border-border bg-card p-4"
      >
        <h2 className="text-[14px] font-bold text-foreground">Crear una cuenta de operadora</h2>
        <FieldGroup className="gap-3">
          <Field data-invalid={error ? true : undefined}>
            <FieldLabel htmlFor="email-operadora">Email de la operadora</FieldLabel>
            <Input
              id="email-operadora"
              name="email-operadora"
              type="email"
              inputMode="email"
              autoComplete="off"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "email-operadora-error" : "email-operadora-ayuda"}
            />
            <FieldDescription id="email-operadora-ayuda" className="text-[12.5px]">
              La cuenta queda activa enseguida. El portal arma una contraseña temporal que ves una sola vez.
            </FieldDescription>
            <FieldError id="email-operadora-error">{error}</FieldError>
          </Field>
        </FieldGroup>
        <BotonAdmin type="submit" variante="primario" disabled={pendiente} className="self-start">
          {pendiente ? "Creando cuenta…" : "Crear cuenta"}
        </BotonAdmin>
      </form>

      {creada && (
        <section
          aria-labelledby="cuenta-creada"
          className="flex flex-col gap-2 rounded-[10px] border border-attention-card-border bg-attention-card p-4 text-[13px] text-foreground"
        >
          <h2 id="cuenta-creada" className="flex items-center gap-1.5 text-[14px] font-bold">
            <KeyRoundIcon aria-hidden="true" className="size-4" />
            Contraseña temporal de {creada.email}
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <code className="rounded-md border border-border bg-card px-3 py-1.5 font-mono text-[15px] tracking-wide select-all">
              {creada.contrasenaTemporal}
            </code>
            <BotonAdmin onClick={() => copiar(creada.contrasenaTemporal)}>
              <CopyIcon data-icon="inline-start" aria-hidden="true" />
              Copiar
            </BotonAdmin>
          </div>
          <p>
            Entregásela en persona, no por mensaje. Después de ingresar, la operadora la cambia desde “Cambiar mi
            contraseña”, abajo en el menú. Cuando salgas de esta pantalla, no se vuelve a mostrar.
          </p>
        </section>
      )}
    </div>
  );
}
