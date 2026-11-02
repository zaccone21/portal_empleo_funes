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
 * Top of the home page (P01, D-029).
 * - Desktop: aligned search input and button, prominent "Ir a Ofertas" CTA button with arrow.
 * - Mobile: stacked search box inspired by Indeed/SitioEmpleos with full-width search,
 *   centered yellow direct access, and trade shortcut pills with peek + fade.
 */
export function PortadaInicio() {
  return (
    <section className="relative isolate overflow-hidden bg-brand-deep text-primary-foreground">
      {/* Mosaico institucional: en mobile ocupa solo una porción superior derecha con desvanecimiento sutil */}
      <MosaicoOficios
        cantidad={36}
        className="absolute top-0 right-0 -z-10 h-72 w-3/5 opacity-25 [mask-image:radial-gradient(ellipse_at_top_right,black_20%,transparent_75%)] md:inset-y-0 md:h-full md:w-2/3 md:opacity-100 md:[mask-image:linear-gradient(to_right,transparent_30%,black_85%)]"
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
            {/* Desktop search bar (completamente intacta como antes) */}
            <form action="/ofertas" method="get" role="search" className="hidden sm:flex sm:flex-col sm:gap-2">
              <label htmlFor="buscar-inicio-desktop" className="text-base font-medium">
                ¿Qué trabajo buscás?
              </label>
              <div className="flex flex-row items-stretch gap-2.5">
                <Input
                  id="buscar-inicio-desktop"
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

            {/* Mobile search bar: inputs y botones integrados directamente sobre el fondo limpio del hero */}
            <form
              action="/ofertas"
              method="get"
              role="search"
              className="flex flex-col gap-3 sm:hidden"
            >
              <label htmlFor="buscar-inicio-mobile" className="text-base font-semibold text-primary-foreground">
                ¿Qué trabajo buscás?
              </label>
              <div className="relative">
                <SearchIcon
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                />
                <Input
                  id="buscar-inicio-mobile"
                  name="q"
                  type="search"
                  placeholder="Puesto, rubro o palabra clave…"
                  enterKeyHint="search"
                  className="h-12 w-full border-transparent bg-background pl-10 pr-4 text-base text-foreground shadow-xs placeholder:text-muted-foreground"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="h-12 w-full bg-brand-mint font-bold text-brand-deep shadow-sm hover:bg-brand-mint/90"
              >
                <SearchIcon data-icon="inline-start" aria-hidden="true" />
                Buscar empleos
              </Button>
              <div className="flex justify-center pt-1">
                <Link
                  href="/ofertas"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "h-12 w-fit rounded-full bg-brand-sun px-8 text-base font-bold text-brand-deep shadow-md hover:bg-brand-sun/90 active:scale-95 transition-all",
                  )}
                >
                  <BriefcaseBusinessIcon data-icon="inline-start" aria-hidden="true" />
                  Ver todas las ofertas
                </Link>
              </div>
            </form>
          </div>

          {/* Pastillas de rubros con Peek (corte de pill a la mitad en borde derecho), Fade degradé y animación leve */}
          <div className="relative -mx-4 overflow-hidden lg:mx-0">
            {/* Máscara de fade ampliada en borde derecho en mobile */}
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-brand-deep via-brand-deep/85 to-transparent lg:hidden" />
            
            <nav
              aria-label="Buscar por rubro"
              className="overflow-x-auto pl-4 pr-2 [scrollbar-width:none] lg:overflow-visible lg:p-0 [&::-webkit-scrollbar]:hidden"
            >
              <ul className="flex w-max gap-2 pb-1 lg:w-auto lg:max-w-4xl lg:flex-wrap">
                {RUBROS_DESTACADOS.map((rubro, index) => (
                  <li
                    key={rubro}
                    className="transition-transform duration-300 hover:scale-[1.03]"
                    style={{
                      animation: `fade-in 0.4s ease-out ${index * 60}ms both`,
                    }}
                  >
                    <Link
                      href={`/ofertas?rubro=${rubro}`}
                      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-primary-foreground/30 bg-primary-foreground/15 px-4 text-base font-medium whitespace-nowrap shadow-md shadow-black/25 transition-all outline-none hover:bg-primary-foreground/25 focus-visible:ring-3 focus-visible:ring-brand-mint/70"
                    >
                      <IconoRubro rubro={rubro} className="size-4" />
                      {NOMBRE_RUBRO[rubro]}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </AnimarEntrada>

        <ContadorContrataciones />
      </div>
    </section>
  );
}
