import Link from "next/link";
import { ArrowRightIcon, BriefcaseBusinessIcon, SearchIcon } from "lucide-react";

import { AnimarEntrada } from "@/components/marca/animaciones";
import { MosaicoOficios } from "@/components/marca/MosaicoOficios";
import { IconoRubro } from "@/components/ofertas/IconoRubro";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { NOMBRE_RUBRO, type Rubro } from "@/lib/validation/rubros";

import { ContadorContrataciones } from "./ContadorContrataciones";

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
 * Top of the home page (P01, D-029): full-width layout, aligned search input and button,
 * prominent "Ir a Ofertas" CTA button with arrow, trade shortcuts, and live hiring figure.
 */
export function PortadaInicio() {
  return (
    <section className="relative isolate overflow-hidden bg-brand-deep text-primary-foreground">
      <MosaicoOficios
        cantidad={60}
        className="absolute inset-y-0 right-0 -z-10 hidden w-2/3 [mask-image:linear-gradient(to_right,transparent_30%,black_85%)] md:block"
      />
      <div className="mx-auto grid w-full max-w-[1680px] gap-8 px-4 pt-5 pb-12 sm:px-8 sm:pt-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-center lg:gap-12 lg:px-14 lg:pt-14 lg:pb-24">
        <AnimarEntrada className="flex min-w-0 flex-col gap-6">
          <div className="flex max-w-3xl flex-col gap-3">
            <h1 className="font-heading text-[2.125rem] leading-[1.05] font-semibold tracking-[-0.025em] text-balance sm:text-5xl lg:text-[4rem]">
              Tu próximo trabajo está en Funes.
            </h1>
            <p className="max-w-2xl text-lg text-primary-foreground/80">
              Ofertas de comercios y empresas de la ciudad, revisadas por la Oficina de Empleo de la Municipalidad.
            </p>
          </div>

          <div className="flex flex-col gap-3 max-w-2xl">
            <form action="/ofertas" method="get" role="search" className="flex flex-col gap-2">
              <label htmlFor="buscar-inicio" className="text-base font-medium">
                ¿Qué trabajo buscás?
              </label>
              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-stretch">
                <Input
                  id="buscar-inicio"
                  name="q"
                  type="search"
                  placeholder="Ej: ventas, cocina, administración, mantenimiento…"
                  enterKeyHint="search"
                  className="h-12 flex-1 border-transparent bg-background px-4 text-base text-foreground shadow-sm placeholder:text-muted-foreground"
                />
                <Button
                  type="submit"
                  size="lg"
                  className="h-12 shrink-0 bg-brand-mint px-6 font-semibold text-brand-deep shadow-sm hover:bg-brand-mint/90"
                >
                  <SearchIcon data-icon="inline-start" aria-hidden="true" />
                  Buscar
                </Button>
                <Link
                  href="/ofertas"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "h-12 shrink-0 bg-brand-sun px-6 text-base font-bold text-brand-deep shadow-lg ring-2 ring-brand-sun/40 ring-offset-2 ring-offset-brand-deep hover:bg-brand-sun/90",
                  )}
                >
                  <BriefcaseBusinessIcon data-icon="inline-start" aria-hidden="true" />
                  Ir a Ofertas
                  <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
                </Link>
              </div>
            </form>
          </div>

          <nav aria-label="Buscar por rubro" className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] lg:mx-0 lg:px-0 [&::-webkit-scrollbar]:hidden">
            <ul className="flex w-max gap-2 pb-1 lg:w-auto lg:max-w-4xl lg:flex-wrap">
              {RUBROS_DESTACADOS.map((rubro) => (
                <li key={rubro}>
                  <Link
                    href={`/ofertas?rubro=${rubro}`}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-primary-foreground/25 bg-primary-foreground/10 px-4 text-base whitespace-nowrap transition-colors outline-none hover:bg-primary-foreground/20 focus-visible:ring-3 focus-visible:ring-brand-mint/70"
                  >
                    <IconoRubro rubro={rubro} className="size-4" />
                    {NOMBRE_RUBRO[rubro]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </AnimarEntrada>

        <ContadorContrataciones />
      </div>
    </section>
  );
}
