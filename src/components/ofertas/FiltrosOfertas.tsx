"use client";

import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SearchIcon, XIcon } from "lucide-react";

import { SelectorNativo } from "@/components/formularios/SelectorNativo";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { hayFiltros, rutaCatalogo, type FiltrosOfertas as Filtros, type OrdenOfertas } from "@/lib/catalogo";
import { cn } from "@/lib/utils";
import { NOMBRE_RUBRO, RUBROS } from "@/lib/validation/rubros";

import { IconoRubro } from "./IconoRubro";

type Props = {
  filtros: Filtros;
};

/**
 * Search, trade filter and order of the offer catalog (P05, D-029). Every
 * control changes the URL (rutaCatalogo), so the list, the back button and a
 * shared link always agree.
 *
 * - The search applies when the person presses "Buscar" or Enter, not on
 *   every key: on a slow phone each change asks the server for the page.
 *   It uses router.push, so "back" undoes a search.
 * - The trades are links ("chips") in a row that scrolls sideways on phones;
 *   the current one is marked with aria-current and the green fill.
 * - The order uses the phone's own picker (SelectorNativo) and router.replace
 *   (changing the order is not a new search).
 * - "Limpiar filtros" appears only while something is narrowing the list.
 * How many results there are is said right above the list (describirResultados).
 */
export function FiltrosOfertas({ filtros }: Props) {
  const router = useRouter();

  function buscar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = String(new FormData(event.currentTarget).get("q") ?? "").trim();
    router.push(rutaCatalogo({ ...filtros, q }), { scroll: false });
  }

  function ordenar(orden: OrdenOfertas) {
    router.replace(rutaCatalogo({ ...filtros, orden }), { scroll: false });
  }

  const opciones = [null, ...RUBROS] as const;

  return (
    <div className="flex flex-col gap-4">
      <form role="search" onSubmit={buscar} className="flex flex-col gap-2">
        <Label htmlFor="buscar-ofertas" className="text-base">
          Buscá por puesto, tarea o barrio
        </Label>
        <div className="flex gap-2">
          <Input
            id="buscar-ofertas"
            name="q"
            type="search"
            enterKeyHint="search"
            defaultValue={filtros.q}
            key={filtros.q}
            className="bg-background"
          />
          <Button type="submit" size="lg" className="shrink-0">
            <SearchIcon data-icon="inline-start" aria-hidden="true" />
            Buscar
          </Button>
        </div>
      </form>

      <nav aria-label="Rubros" className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:px-0">
        <ul className="flex w-max gap-2 pb-1 lg:w-auto lg:flex-wrap">
          {opciones.map((rubro) => {
            const actual = filtros.rubro === rubro;
            return (
              <li key={rubro ?? "todos"}>
                <Link
                  href={rutaCatalogo({ ...filtros, rubro })}
                  scroll={false}
                  aria-current={actual ? "true" : undefined}
                  className={cn(
                    "inline-flex min-h-11 items-center gap-2 rounded-full border border-input bg-background px-4 text-base whitespace-nowrap outline-none",
                    "hover:border-primary focus-visible:ring-3 focus-visible:ring-ring/50",
                    "aria-[current=true]:border-primary aria-[current=true]:bg-primary aria-[current=true]:text-primary-foreground",
                  )}
                >
                  {rubro && <IconoRubro rubro={rubro} className="size-4" />}
                  {rubro ? NOMBRE_RUBRO[rubro] : "Todos"}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="flex flex-wrap items-end justify-end gap-2">
        <div className="flex items-end gap-2">
          {hayFiltros(filtros) && (
            <Link href={rutaCatalogo({ q: "", rubro: null, orden: filtros.orden })} scroll={false} className={buttonVariants({ variant: "ghost" })}>
              <XIcon data-icon="inline-start" aria-hidden="true" />
              Limpiar filtros
            </Link>
          )}
          <div className="flex flex-col gap-1">
            <Label htmlFor="orden-ofertas" className="text-sm text-muted-foreground">
              Ordenar
            </Label>
            <SelectorNativo
              id="orden-ofertas"
              value={filtros.orden}
              onChange={(event) => ordenar(event.target.value === "antiguas" ? "antiguas" : "recientes")}
              className="w-44"
            >
              <option value="recientes">Más recientes</option>
              <option value="antiguas">Más antiguas</option>
            </SelectorNativo>
          </div>
        </div>
      </div>
    </div>
  );
}
