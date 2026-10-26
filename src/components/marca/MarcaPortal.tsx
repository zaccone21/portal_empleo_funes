import Link from "next/link";

import { LogoMunicipalidad } from "./LogoMunicipalidad";

/**
 * Portal lockup for the deep green surfaces: the municipal logo (in white),
 * page and is a 44px touch target.
 *
 * The logo keeps its own proportions: it is sized by height (32 px, below its
 * native 52 px, so it stays sharp) and never stretched to the name's width (`shrink-0`).
 */
export function MarcaPortal() {
  return (
    <Link
      href="/"
      className="inline-flex min-h-11 items-center gap-3 self-start rounded-lg text-primary-foreground outline-none focus-visible:ring-3 focus-visible:ring-brand-mint/70"
    >
      <LogoMunicipalidad variante="claro" className="h-8 w-auto shrink-0" />
      <span aria-hidden="true" className="h-7 w-px shrink-0 bg-primary-foreground/35" />
      <span className="font-heading text-base leading-tight font-semibold lg:whitespace-nowrap">Portal de Empleo</span>
    </Link>
  );
}
