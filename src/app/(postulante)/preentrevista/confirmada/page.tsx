import Link from "next/link";
import { CalendarCheck2Icon, CalendarX2Icon, CircleAlertIcon } from "lucide-react";

import { Seccion } from "@/components/marca/Seccion";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Confirmación de pre-entrevista",
};

export default async function PaginaPreentrevistaConfirmada(props: {
  searchParams: Promise<{ resultado?: string }>;
}) {
  const { resultado } = await props.searchParams;
  const esConfirmada = resultado === "confirmada";
  const esCancelada = resultado === "cancelada";

  return (
    <Seccion
      titulo="Pre-entrevista con la Oficina de Empleo"
      bajada="Estado de tu turno para la entrevista previa."
    >
      <div className="mx-auto flex w-full max-w-xl flex-col gap-5 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card p-6 ring-1 ring-foreground/5 sm:p-8">
        {esConfirmada && (
          <>
            <div className="flex items-center gap-3 text-primary">
              <CalendarCheck2Icon aria-hidden="true" className="size-8 shrink-0" />
              <h2 className="font-heading text-xl font-semibold text-foreground">
                ¡Confirmaste tu asistencia a la pre-entrevista!
              </h2>
            </div>
            <p className="text-base text-muted-foreground">
              Tu turno ya quedó agendado en el calendario de la Oficina de Empleo de Funes. Te esperamos en el día y horario indicados en el correo.
            </p>
          </>
        )}

        {esCancelada && (
          <>
            <div className="flex items-center gap-3 text-foreground">
              <CalendarX2Icon aria-hidden="true" className="size-8 shrink-0 text-primary" />
              <h2 className="font-heading text-xl font-semibold text-foreground">
                Avisamos a la Oficina para reprogramar tu horario
              </h2>
            </div>
            <p className="text-base text-muted-foreground">
              Registramos que no podés asistir en ese horario. La Oficina de Empleo se va a comunicar con vos o te enviará una nueva propuesta de fecha por correo.
            </p>
          </>
        )}

        {!esConfirmada && !esCancelada && (
          <>
            <div className="flex items-center gap-3 text-destructive">
              <CircleAlertIcon aria-hidden="true" className="size-8 shrink-0" />
              <h2 className="font-heading text-xl font-semibold text-foreground">
                Este enlace ya fue utilizado o venció
              </h2>
            </div>
            <p className="text-base text-muted-foreground">
              Si ya habías tocado el botón de confirmación antes, tu respuesta ya quedó registrada. Si tenés dudas, comunicate con la Oficina de Empleo.
            </p>
          </>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link href="/postulante/postulaciones" className={cn(buttonVariants({ size: "lg" }))}>
            Ir a mis postulaciones
          </Link>
          <Link href="/ofertas" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
            Ver ofertas laborales
          </Link>
        </div>
      </div>
    </Seccion>
  );
}
