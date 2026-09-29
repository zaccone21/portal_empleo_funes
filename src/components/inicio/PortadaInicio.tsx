import Link from "next/link";
import { SearchIcon } from "lucide-react";

import { MosaicoOficios } from "@/components/marca/MosaicoOficios";
import { IconoRubro } from "@/components/ofertas/IconoRubro";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NOMBRE_RUBRO, type Rubro } from "@/lib/validation/rubros";

/** The trades offered as shortcuts on the home page: the ones with most everyday jobs in a city like Funes. */
const RUBROS_DESTACADOS: Rubro[] = [
  "gastronomia",
  "comercio",
  "construccion",
  "jardineria",
  "transporte",
  "limpieza",
  "cuidados",
];

/**
 * Top of the home page (P01, D-029): what the portal is, and the two fastest
 * ways into the offers:
 * - a search box, as a plain HTML form that goes to /ofertas?q=…; it works
 *   even before the page's JavaScript loads on a slow phone;
 * - one link per common trade, straight to the catalog filtered by it.
 * It is the page's h1. The trade mosaic sits on the right from `md` up,
 * masked so the text reads on plain green.
 */
export function PortadaInicio() {
  return (
    <section className="relative isolate overflow-hidden bg-brand-deep text-primary-foreground">
      <MosaicoOficios
        cantidad={60}
        className="absolute inset-y-0 right-0 -z-10 hidden w-2/3 [mask-image:linear-gradient(to_right,transparent_30%,black_85%)] md:block"
      />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pt-4 pb-12 sm:pt-8 lg:px-10 lg:pt-14 lg:pb-24">
        <div className="flex max-w-2xl flex-col gap-3">
          <h1 className="font-heading text-[2.125rem] leading-[1.05] font-semibold tracking-[-0.025em] text-balance sm:text-5xl lg:text-7xl">
            Tu próximo trabajo está en Funes.
          </h1>
          <p className="max-w-xl text-lg text-primary-foreground/80">
            Ofertas de comercios y empresas de la ciudad, revisadas por la Oficina de Empleo de la Municipalidad.
          </p>
        </div>

        <form action="/ofertas" method="get" role="search" className="flex max-w-xl flex-col gap-2">
          <label htmlFor="buscar-inicio" className="text-base font-medium">
            ¿Qué trabajo buscás?
          </label>
          <div className="flex gap-2">
            <Input
              id="buscar-inicio"
              name="q"
              type="search"
              enterKeyHint="search"
              className="border-transparent bg-background text-foreground"
            />
            <Button type="submit" size="lg" className="shrink-0 bg-brand-mint text-brand-deep hover:bg-brand-mint/90">
              <SearchIcon data-icon="inline-start" aria-hidden="true" />
              Buscar
            </Button>
          </div>
        </form>

        <nav aria-label="Buscar por rubro" className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:px-0">
          <ul className="flex w-max gap-2 pb-1 lg:w-auto lg:max-w-3xl lg:flex-wrap">
            {RUBROS_DESTACADOS.map((rubro) => (
              <li key={rubro}>
                <Link
                  href={`/ofertas?rubro=${rubro}`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-primary-foreground/25 bg-primary-foreground/10 px-4 text-base whitespace-nowrap outline-none hover:bg-primary-foreground/20 focus-visible:ring-3 focus-visible:ring-brand-mint/70"
                >
                  <IconoRubro rubro={rubro} className="size-4" />
                  {NOMBRE_RUBRO[rubro]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
