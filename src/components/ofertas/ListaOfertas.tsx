import Link from "next/link";
import { SearchXIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { cn } from "@/lib/utils";
import type { OfertaPublica } from "@/lib/validation/ofertas";

import { DetalleOferta } from "./DetalleOferta";
import { TarjetaOferta } from "./TarjetaOferta";

type Props = {
  ofertas: OfertaPublica[];
  /** Value of ?oferta= in the URL: the offer the person picked, if any. */
  seleccionadaId?: string;
};

/**
 * Offers in a list with the detail on the same page, like job boards do
 * (P05 + P06, D-025). The selected offer lives in the URL (?oferta=<id>), so
 * the back button, reloading and sharing a link all work.
 *
 * What is on screen:
 * - Desktop: list on the left, detail on the right. If nothing was picked,
 *   the first offer's detail is shown so the panel is never empty.
 * - Phone: without a selection, only the list; with a selection, only the
 *   detail (with "Volver a las ofertas").
 * - If the URL points to an offer that is no longer in the list (it was
 *   closed), the detail area says so instead of showing another offer.
 * Both areas are always in the DOM; CSS decides which one shows per screen
 * size, so nothing depends on measuring the screen in JavaScript.
 */
export function ListaOfertas({ ofertas, seleccionadaId }: Props) {
  const eligio = seleccionadaId !== undefined;
  const seleccionada = eligio ? ofertas.find((oferta) => oferta.id === seleccionadaId) : undefined;
  const enDetalle = eligio ? seleccionada : ofertas[0];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start">
      <section aria-labelledby="ofertas-cantidad" className={cn("flex flex-col gap-3", eligio && "hidden lg:flex")}>
        <p id="ofertas-cantidad" className="text-base text-muted-foreground">
          {ofertas.length === 1 ? "Hay 1 oferta publicada." : `Hay ${ofertas.length} ofertas publicadas.`}
        </p>
        <ul className="flex flex-col gap-3">
          {ofertas.map((oferta) => (
            <li key={oferta.id}>
              <TarjetaOferta
                oferta={oferta}
                seleccionada={oferta.id === enDetalle?.id}
                soloEnEscritorio={!eligio}
              />
            </li>
          ))}
        </ul>
      </section>
      <div className={cn("lg:sticky lg:top-4", eligio ? "block" : "hidden lg:block")}>
        {enDetalle ? <DetalleOferta oferta={enDetalle} elegida={eligio} /> : <OfertaNoDisponible />}
      </div>
    </div>
  );
}

/** Shown when ?oferta= points to an offer that is no longer published. */
function OfertaNoDisponible() {
  return (
    <Empty className="rounded-tl-2xl rounded-br-2xl bg-card">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchXIcon aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>Esta oferta ya no está publicada</EmptyTitle>
        <EmptyDescription className="text-base">
          Puede que se haya cubierto el puesto. Mirá las otras ofertas.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Link href="/ofertas" className={cn(buttonVariants({ size: "lg" }), "w-full lg:hidden")}>
          Ver las ofertas
        </Link>
      </EmptyContent>
    </Empty>
  );
}
