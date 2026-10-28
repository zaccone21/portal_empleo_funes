"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2Icon, KeyRoundIcon, MailCheckIcon, RefreshCwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { esRutaInterna } from "@/lib/rutas";
import {
  respuestaConDestinoSchema,
  verificarCodigoEmailSchema,
} from "@/lib/validation/auth";

type Props = {
  children: ReactNode;
  /**
   * When provided (after account registration or unconfirmed login), displays
   * the 6-digit OTP verification input and the "Reenviar correo" button.
   */
  email?: string;
  /** Optional internal path to return to once verified. */
  volver?: string;
};

/**
 * Message that replaces a form after it sends an email (registration and
 * password recovery). When `email` is provided, also renders an interactive
 * 6-digit PIN input (`POST /api/auth/verificar-codigo`) and a button to resend
 * the confirmation email (`POST /api/auth/reenviar-confirmacion`), so the user
 * can activate their account either via the link or via the code.
 */
export function AvisoRevisaTuCorreo({ children, email, volver }: Props) {
  const router = useRouter();
  const [codigo, setCodigo] = useState("");
  const [errorCodigo, setErrorCodigo] = useState<string | null>(null);
  const [verificando, setVerificando] = useState(false);
  const [reenviando, setReenviando] = useState(false);
  const [mensajeReenvio, setMensajeReenvio] = useState<string | null>(null);
  const [errorReenvio, setErrorReenvio] = useState<string | null>(null);

  async function manejarVerificarCodigo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email) return;

    const validacion = verificarCodigoEmailSchema.safeParse({ email, codigo });
    if (!validacion.success) {
      setErrorCodigo("Ingresá los 6 números del código que recibiste por email.");
      return;
    }

    setErrorCodigo(null);
    setVerificando(true);
    try {
      const res = await fetch("/api/auth/verificar-codigo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validacion.data),
      });

      if (!res.ok) {
        const cuerpo = (await res.json().catch(() => null)) as { error?: string } | null;
        setErrorCodigo(
          cuerpo?.error ?? "El código es incorrecto o venció. Probá con uno nuevo.",
        );
        return;
      }

      const datos = respuestaConDestinoSchema.safeParse(await res.json());
      if (datos.success) {
        router.replace(esRutaInterna(volver) ? volver : datos.data.destino);
      }
    } catch {
      setErrorCodigo("No pudimos verificar el código. Revisá tu conexión e intentá de nuevo.");
    } finally {
      setVerificando(false);
    }
  }

  async function manejarReenviar() {
    if (!email) return;
    setReenviando(true);
    setMensajeReenvio(null);
    setErrorReenvio(null);
    try {
      const res = await fetch("/api/auth/reenviar-confirmacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const cuerpo = (await res.json().catch(() => null)) as { error?: string } | null;
        setErrorReenvio(
          cuerpo?.error ?? "No pudimos reenviar el correo. Esperá un minuto e intentá de nuevo.",
        );
        return;
      }
      setMensajeReenvio("Te enviamos un nuevo correo con enlace y código actualizado.");
    } catch {
      setErrorReenvio("No pudimos conectar con el servidor. Intentá de nuevo.");
    } finally {
      setReenviando(false);
    }
  }

  return (
    <div role="status" className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <MailCheckIcon aria-hidden="true" className="size-10 text-primary" />
        <h2 className="text-xl font-semibold">Revisá tu correo</h2>
        <p className="text-base">{children}</p>
        <p className="text-sm text-muted-foreground">
          Si no lo ves en tu bandeja principal, buscalo en la carpeta de correo no deseado (spam).
        </p>
      </div>

      {email ? (
        <>
          <Separator />

          <form onSubmit={manejarVerificarCodigo} noValidate className="flex flex-col gap-3">
            <Field data-invalid={ Boolean(errorCodigo) || undefined }>
              <FieldLabel htmlFor="codigo-otp" className="flex items-center gap-1.5 font-medium">
                <KeyRoundIcon aria-hidden="true" className="size-4 text-primary" />
                ¿Tenés el código de 6 dígitos del correo?
              </FieldLabel>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  id="codigo-otp"
                  name="codigo"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="Ej: 123456"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  aria-invalid={Boolean(errorCodigo)}
                  className="font-mono text-lg tracking-widest sm:max-w-44"
                />
                <Button type="submit" disabled={verificando || codigo.length < 6}>
                  {verificando ? "Activando…" : "Activar con código"}
                </Button>
              </div>
              {errorCodigo ? <FieldError>{errorCodigo}</FieldError> : null}
            </Field>
          </form>

          <div className="flex flex-col items-start gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={reenviando}
              onClick={manejarReenviar}
            >
              <RefreshCwIcon data-icon="inline-start" className={reenviando ? "animate-spin" : undefined} />
              {reenviando ? "Reenviando correo…" : "Reenviar correo de confirmación"}
            </Button>

            {mensajeReenvio ? (
              <p className="flex items-center gap-1.5 text-sm font-medium text-primary">
                <CheckCircle2Icon aria-hidden="true" className="size-4 shrink-0" />
                {mensajeReenvio}
              </p>
            ) : null}

            {errorReenvio ? (
              <p className="text-sm font-medium text-destructive">{errorReenvio}</p>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}
