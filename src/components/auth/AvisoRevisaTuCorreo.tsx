"use client";

import { useState, type ReactNode } from "react";
import { MailCheckIcon, RefreshCwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

type Props = {
  children?: ReactNode;
  /**
   * When provided (after account registration or unconfirmed login), displays
   * the email and the "Reenviar correo" button.
   */
  email?: string;
  /** Optional callback to return to the form and edit the email */
  onCambiarEmail?: () => void;
  volver?: string;
};

/**
 * Mensaje simple y claro tras enviar el correo de confirmación (P02, P08).
 * Elimina cualquier código PIN o verificación compleja: la activación se realiza
 * exclusivamente tocando el botón del email.
 */
export function AvisoRevisaTuCorreo({ children, email, onCambiarEmail }: Props) {
  const [reenviando, setReenviando] = useState(false);
  const [mensajeReenvio, setMensajeReenvio] = useState<string | null>(null);
  const [errorReenvio, setErrorReenvio] = useState<string | null>(null);

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
      setMensajeReenvio("Te volvimos a enviar el correo de confirmación. Revisá tu casilla.");
    } catch {
      setErrorReenvio("No pudimos conectar con el servidor. Intentá de nuevo.");
    } finally {
      setReenviando(false);
    }
  }

  return (
    <div role="status" className="flex flex-col gap-3.5 py-1">
      <div className="flex flex-col items-start gap-2">
        <span
          aria-hidden="true"
          className="flex size-10 items-center justify-center rounded-xl bg-secondary text-primary"
        >
          <MailCheckIcon className="size-5" />
        </span>
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
          Revisá tu correo
        </h2>
      </div>

      <div className="flex flex-col gap-2 text-sm text-foreground leading-relaxed">
        {children ? (
          <p>{children}</p>
        ) : email ? (
          <p>
            Te enviamos un enlace de confirmación a <strong className="break-all font-semibold text-primary">{email}</strong>.
            Hacé clic en el botón del correo para activar tu cuenta y acceder directamente.
          </p>
        ) : (
          <p>Te enviamos un enlace de confirmación a tu casilla de correo.</p>
        )}
        <p className="text-xs text-muted-foreground">
          Si no lo encontrás en unos minutos, revisá la carpeta de correo no deseado (spam).
        </p>
      </div>

      {email && (
        <div className="flex flex-col items-start gap-2 border-t border-border/70 pt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={manejarReenviar}
            disabled={reenviando}
            className="h-9 gap-2 text-xs font-semibold"
          >
            <RefreshCwIcon
              aria-hidden="true"
              className={`size-3.5 ${reenviando ? "animate-spin" : ""}`}
            />
            {reenviando ? "Reenviando correo…" : "Reenviar correo de confirmación"}
          </Button>

          {mensajeReenvio && (
            <p className="text-xs font-medium text-primary">{mensajeReenvio}</p>
          )}

          {errorReenvio && (
            <p className="text-xs font-medium text-destructive">{errorReenvio}</p>
          )}

          {onCambiarEmail && (
            <button
              type="button"
              onClick={onCambiarEmail}
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 pt-1"
            >
              ¿Te equivocaste de correo? Crear cuenta con otra dirección
            </button>
          )}
        </div>
      )}
    </div>
  );
}
