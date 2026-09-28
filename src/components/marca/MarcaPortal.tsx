import Link from "next/link";

/**
 * Portal lockup for green surfaces: a 2×2 mini mosaic (the same tiles as
 * MosaicoOficios) and the portal's name. It links to the home page and is a
 * 44px touch target. It stands in for the municipal logo until there is a
 * sharp version of it (docs/LOGOcolor.png is 92×26 px).
 */
export function MarcaPortal() {
  return (
    <Link
      href="/"
      className="inline-flex min-h-11 items-center gap-3 self-start rounded-lg text-primary-foreground outline-none focus-visible:ring-3 focus-visible:ring-brand-mint/70"
    >
      <span aria-hidden="true" className="grid size-10 grid-cols-2 gap-0.5">
        <span className="rounded-tl-[45%] rounded-tr-[3px] rounded-br-[3px] rounded-bl-[3px] bg-brand-sun" />
        <span className="rounded-[3px] bg-brand-mint" />
        <span className="rounded-[3px] bg-brand-leaf" />
        <span className="rounded-br-[45%] rounded-tl-[3px] rounded-tr-[3px] rounded-bl-[3px] bg-primary-foreground" />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="font-heading text-base font-semibold">Portal de Empleo</span>
        <span className="text-sm text-primary-foreground/75">Municipalidad de Funes</span>
      </span>
    </Link>
  );
}
