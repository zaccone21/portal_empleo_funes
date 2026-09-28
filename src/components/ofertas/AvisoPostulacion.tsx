import Link from "next/link";
import { CircleAlertIcon, CircleCheckIcon, FileUpIcon, LogInIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import type { ResultadoPostulacion } from "@/hooks/usePostularme";
import { cn } from "@/lib/utils";

/**
 * Outcome of pressing "Postularme" (P06). Each case tells the person what
 * happened and, when something is missing, gives the one next step:
 * - postulado: confirmation, without any status (RF1.2.4), and a link to
 *   "Mis postulaciones";
 * - sin_sesion: log in (or register) to apply;
 * - falta_cv: the server's message and a link to upload the CV (RF1.4.4, P04).
 *   The link carries the offer id, so after uploading the CV page offers to
 *   go back to this same offer and finish applying;
 * - error: the server's message (D-013).
 * The confirmation is a fixed message, not a toast: it replaces the button,
 * so it is the thing on screen the person is looking at.
 */
export function AvisoPostulacion({ resultado, ofertaId }: { resultado: ResultadoPostulacion; ofertaId: string }) {
  switch (resultado.tipo) {
    case "postulado":
      return (
        <div role="status" className="flex flex-col gap-3 rounded-2xl bg-secondary p-5 text-secondary-foreground">
          <p className="flex items-center gap-2 font-heading text-lg font-semibold">
            <CircleCheckIcon aria-hidden="true" className="size-6 shrink-0" />
            Te postulaste a esta oferta
          </p>
          <p className="text-base text-foreground">
            La Oficina de Empleo revisa cada postulación y te contacta si tu perfil encaja.
          </p>
          <Link href="/postulante/postulaciones" className={cn(buttonVariants({ variant: "outline" }), "self-start")}>
            Ver mis postulaciones
          </Link>
        </div>
      );
    case "sin_sesion":
      return (
        <div className="flex flex-col gap-3">
          <Alert>
            <LogInIcon aria-hidden="true" />
            <AlertTitle className="text-base">Para postularte, ingresá con tu cuenta</AlertTitle>
            <AlertDescription className="text-base">
              Si todavía no tenés una, crearla lleva un minuto.
            </AlertDescription>
          </Alert>
          <Link href="/postulante/ingresar" className={cn(buttonVariants({ size: "lg" }), "w-full")}>
            Ingresar
          </Link>
          <Link href="/postulante/registrarse" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full")}>
            Crear cuenta
          </Link>
        </div>
      );
    case "falta_cv":
      return (
        <div className="flex flex-col gap-3">
          <Alert>
            <FileUpIcon aria-hidden="true" />
            <AlertTitle className="text-base">Falta tu CV</AlertTitle>
            <AlertDescription className="text-base">{resultado.mensaje}</AlertDescription>
          </Alert>
          <Link
            href={`/postulante/cv?oferta=${encodeURIComponent(ofertaId)}`}
            className={cn(buttonVariants({ size: "lg" }), "w-full")}
          >
            Subir mi CV
          </Link>
        </div>
      );
    case "error":
      return (
        <Alert variant="destructive">
          <CircleAlertIcon aria-hidden="true" />
          <AlertDescription className="text-base">{resultado.mensaje}</AlertDescription>
        </Alert>
      );
  }
}
