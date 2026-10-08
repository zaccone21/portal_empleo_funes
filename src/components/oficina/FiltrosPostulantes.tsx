"use client";

import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SearchIcon, XIcon } from "lucide-react";

import { IconoRubro } from "@/components/ofertas/IconoRubro";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  alternarRubro,
  hayFiltrosPostulantes,
  rutaPostulantes,
  type FiltrosPostulantes,
} from "@/lib/busqueda-postulantes";
import { cn } from "@/lib/utils";
import { NOMBRE_RUBRO, RUBROS } from "@/lib/validation/rubros";

type Props = {
  filtros: FiltrosPostulantes;
};

/**
 * Filters of the Office's applicant search (P16, RF1.5.7), in one panel above
 * the results. Every control changes the URL (rutaPostulantes), like the
 * offer catalog, so the list, the back button and a shared link agree.
 *
 * - The text (name, surname or DNI) applies on "Buscar" or Enter, not on every
 *   key, and uses router.push so "back" undoes a search.
 * - The trades are links that toggle each one: a person matches if they have
 *   any of the chosen trades. The chosen ones are painted green and marked
 *   with aria-current; the row scrolls sideways on phones and wraps on desktop.
 * - "Limpiar filtros" appears only while something is narrowing the list.
 */
export function FiltrosPostulantes({ filtros }: Props) {
  const router = useRouter();

  function buscar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = String(new FormData(event.currentTarget).get("q") ?? "").trim();
    router.push(rutaPostulantes({ ...filtros, q }), { scroll: false });
  }

  return (
    <div className="flex flex-col gap-5 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card p-4 ring-1 ring-foreground/5 sm:p-5">
      <form role="search" onSubmit={buscar} className="flex flex-col gap-2">
        <Label htmlFor="buscar-postulantes" className="text-base">
          Buscá por nombre, apellido o DNI
        </Label>
        <div className="flex gap-2">
          <Input
            id="buscar-postulantes"
            name="q"
            type="search"
            enterKeyHint="search"
            defaultValue={filtros.q}
            key={filtros.q}
          />
          <Button type="submit" size="lg" className="shrink-0">
            <SearchIcon data-icon="inline-start" aria-hidden="true" />
            Buscar
          </Button>
        </div>
      </form>

      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-0.5">
          <p id="rubros-postulantes" className="text-base font-medium">
            Rubros
          </p>
          <p className="text-sm text-muted-foreground">Podés elegir varios: se muestra quien tenga alguno de ellos.</p>
        </div>
        <nav
          aria-labelledby="rubros-postulantes"
          className="-mx-4 overflow-x-auto px-4 sm:-mx-5 sm:px-5 lg:mx-0 lg:px-0"
        >
          <ul className="flex w-max gap-2 pb-1 lg:w-auto lg:flex-wrap">
            <li>
              <Link
                href={rutaPostulantes({ ...filtros, rubros: [] })}
                scroll={false}
                aria-current={filtros.rubros.length === 0 ? "true" : undefined}
                className={cn(CHIP, CHIP_ACTIVO)}
              >
                Todos
              </Link>
            </li>
            {RUBROS.map((rubro) => (
              <li key={rubro}>
                <Link
                  href={rutaPostulantes(alternarRubro(filtros, rubro))}
                  scroll={false}
                  aria-current={filtros.rubros.includes(rubro) ? "true" : undefined}
                  className={cn(CHIP, CHIP_ACTIVO)}
                >
                  <IconoRubro rubro={rubro} className="size-4" />
                  {NOMBRE_RUBRO[rubro]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {hayFiltrosPostulantes(filtros) && (
        <Link
          href={rutaPostulantes({ q: "", rubros: [] })}
          scroll={false}
          className={cn(buttonVariants({ variant: "ghost" }), "self-start")}
        >
          <XIcon data-icon="inline-start" aria-hidden="true" />
          Limpiar filtros
        </Link>
      )}
    </div>
  );
}

const CHIP =
  "inline-flex min-h-11 items-center gap-2 rounded-full border border-input bg-background px-4 text-base whitespace-nowrap outline-none hover:border-primary focus-visible:ring-3 focus-visible:ring-ring/50";
const CHIP_ACTIVO =
  "aria-[current=true]:border-primary aria-[current=true]:bg-primary aria-[current=true]:text-primary-foreground";
