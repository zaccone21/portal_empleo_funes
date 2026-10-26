import Link from "next/link";
import { CompassIcon } from "lucide-react";

import { MarcoArea } from "@/components/marca/MarcoArea";
import { Seccion } from "@/components/marca/Seccion";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Custom 404 screen in Spanish ("Mosaico de oficios", docs/DESIGN.md).
 * Explains in plain words that the page is not there and offers the two main
 * exits: the portal home and the public offer catalog.
 */
export function PaginaNoEncontrada() {
  return (
    <MarcoArea area="postulante">
      <Seccion
        titulo="No encontramos esta página"
        bajada="Puede que el enlace esté mal escrito o que la página ya no esté disponible."
      >
        <div className="flex max-w-xl flex-col items-start gap-5 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card p-6 ring-1 ring-foreground/5 sm:p-8">
          <span
            aria-hidden="true"
            className="flex size-12 items-center justify-center rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm bg-secondary text-primary"
          >
            <CompassIcon className="size-6" />
          </span>
          <p className="text-base text-muted-foreground">
            Volvé al inicio del portal o buscá entre las ofertas de trabajo publicadas.
          </p>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link href="/" className={cn(buttonVariants({ size: "lg" }))}>
              Ir al inicio
            </Link>
            <Link href="/ofertas" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
              Ver ofertas de trabajo
            </Link>
          </div>
        </div>
      </Seccion>
    </MarcoArea>
  );
}
