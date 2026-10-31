import Link from "next/link";
import { ClockIcon, ShieldAlertIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { EstadoEmpresa } from "@/lib/validation/empresa";

type Props = {
  estado: Exclude<EstadoEmpresa, "aprobada">;
  /** Why the Office rejected it; only while `estado` is "rechazada" (D-069). */
  motivoRechazo: string | null;
  /** Show the shortcut to the company data. Off on the data screen itself. */
  mostrarEnlace?: boolean;
};

/**
 * Tells the company where it stands with the Office (D-068): waiting for
 * approval, or rejected with the reason. Until it is approved it cannot send
 * offers, so P09 and P11 show this instead of the way to publish.
 */
export function AvisoEstadoEmpresa({ estado, motivoRechazo, mostrarEnlace = true }: Props) {
  if (estado === "rechazada") {
    return (
      <Alert variant="destructive">
        <ShieldAlertIcon aria-hidden="true" />
        <AlertTitle className="text-base">La Oficina de Empleo no aprobó tu empresa</AlertTitle>
        <AlertDescription className="text-base">
          {motivoRechazo ? `Motivo: ${motivoRechazo}. ` : ""}
          Corregí los datos y la Oficina la revisa de nuevo.
        </AlertDescription>
        {mostrarEnlace && (
          <Link
            href="/empresa/perfil"
            className={cn(buttonVariants({ variant: "outline" }), "col-start-2 mt-2 justify-self-start")}
          >
            Revisar los datos
          </Link>
        )}
      </Alert>
    );
  }

  return (
    <Alert>
      <ClockIcon aria-hidden="true" />
      <AlertTitle className="text-base">Tu empresa está en revisión</AlertTitle>
      <AlertDescription className="text-base">
        La Oficina de Empleo tiene que aprobarla antes de que puedas publicar ofertas. No tenés que hacer nada más:
        cuando la apruebe, vas a poder publicar desde acá.
      </AlertDescription>
    </Alert>
  );
}
