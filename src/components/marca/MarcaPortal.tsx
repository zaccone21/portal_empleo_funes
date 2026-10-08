import Link from "next/link";

import { LogoMunicipalidad } from "./LogoMunicipalidad";

/**
 * Portal lockup for the deep green surfaces: the municipal logo (in white),
 * page and is a 44px touch target.
 *
 * The logo keeps its own proportions: it is a fixed-size image, not stretched
 * to the name's width (`shrink-0`), and it is shown slightly larger than its
 * native size (113x32) to improve readability.
 */
export function MarcaPortal() {
  return (
    <Link
      href="/"
      className="inline-flex min-h-11 items-center gap-3 self-start rounded-lg text-primary-foreground outline-none focus-visible:ring-3 focus-visible:ring-brand-mint/70"
    >
      <LogoMunicipalidad variante="claro" className="h-[32px] w-[113px] shrink-0" />
      <span aria-hidden="true" className="h-7 w-px shrink-0 bg-primary-foreground/35" />
      <span className="font-heading text-base leading-tight font-semibold">Portal de Empleo</span>
    </Link>
  );
}
