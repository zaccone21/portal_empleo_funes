"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDownIcon, SearchIcon, SlidersHorizontalIcon, XIcon } from "lucide-react";

import { SelectorNativo } from "@/components/formularios/SelectorNativo";
import { AnimarColapsable } from "@/components/marca/animaciones";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  extraerBarriosDisponibles,
  FILTROS_VACIOS,
  hayFiltros,
  rutaCatalogo,
  type FiltroPagoOferta,
  type FiltrosOfertas as Filtros,
  type OrdenOfertas,
} from "@/lib/catalogo";
import { cn } from "@/lib/utils";
import type { OfertaPublica } from "@/lib/validation/ofertas";
import { NOMBRE_RUBRO, RUBROS } from "@/lib/validation/rubros";

import { IconoRubro } from "./IconoRubro";

type Props = {
  filtros: Filtros;
  ofertas?: OfertaPublica[];
};

const OPCIONES_PAGO: { valor: FiltroPagoOferta; texto: string }[] = [
  { valor: "todos", texto: "Todas" },
  { valor: "con_sueldo", texto: "Dice cuánto pagan" },
  { valor: "a_convenir", texto: "A convenir" },
];

const OPCIONES_HORARIO: { valor: string; texto: string }[] = [
  { valor: "", texto: "Cualquiera" },
  { valor: "manana", texto: "Mañana" },
  { valor: "tarde", texto: "Tarde" },
  { valor: "completo", texto: "Jornada completa" },
  { valor: "part_time", texto: "Medio tiempo" },
];

const OPCIONES_ORDEN: { valor: OrdenOfertas; texto: string }[] = [
  { valor: "recientes", texto: "Las más nuevas primero" },
  { valor: "antiguas", texto: "Las más viejas primero" },
];

const CLASE_OPCION = cn(
  "inline-flex min-h-11 items-center gap-2 rounded-full border border-input bg-background px-4 text-base font-medium whitespace-nowrap transition-colors outline-none",
  "hover:border-primary focus-visible:ring-3 focus-visible:ring-ring/50",
  "aria-[current=true]:border-primary aria-[current=true]:bg-primary aria-[current=true]:text-primary-foreground",
);

/**
 * Catalog search (P05), designed to be easy for people with little digital
 * practice: one search box, the trades as big tappable buttons, and everything
 * else (pay, schedule, zone, order) behind a single "Más opciones" button, in
 * plain words and as buttons instead of drop-down lists. The panel opens by
 * itself when one of those options is already applied, so nothing stays hidden.
 */
export function FiltrosOfertas({ filtros: filtrosParciales, ofertas = [] }: Props) {
  const router = useRouter();
  const filtros = { ...FILTROS_VACIOS, ...filtrosParciales };

  const barriosDisponibles = useMemo(() => extraerBarriosDisponibles(ofertas), [ofertas]);

  const opcionesActivas =
    Number(filtros.pago !== "todos") +
    Number(filtros.horario !== "") +
    Number(filtros.barrio !== "") +
    Number(filtros.orden !== "recientes");
  const [abierto, setAbierto] = useState(opcionesActivas > 0);

  function buscar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = String(new FormData(event.currentTarget).get("q") ?? "").trim();
    router.push(rutaCatalogo({ ...filtros, q }), { scroll: false });
  }

  const opcionesRubro = [null, ...RUBROS] as const;

  return (
    <div className="flex flex-col gap-5 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card p-4 ring-1 ring-foreground/6 sm:p-6">
      <form role="search" onSubmit={buscar} className="flex flex-col gap-2">
        <Label htmlFor="buscar-ofertas" className="text-base font-semibold">
          ¿Qué trabajo buscás?
        </Label>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
          <Input
            id="buscar-ofertas"
            name="q"
            type="search"
            placeholder="Ej: cajero, cocinero, limpieza…"
            enterKeyHint="search"
            defaultValue={filtros.q}
            key={filtros.q}
            className="h-12 flex-1 bg-background text-base"
          />
          <Button type="submit" className="h-12 shrink-0 px-6 text-base font-semibold">
            <SearchIcon data-icon="inline-start" aria-hidden="true" />
            Buscar
          </Button>
        </div>
      </form>

      <nav aria-label="Elegí un rubro" className="flex flex-col gap-2">
        <p className="text-base font-semibold">O elegí un rubro</p>
        <ul className="flex flex-wrap gap-2">
          {opcionesRubro.map((rubro) => (
            <li key={rubro ?? "todos"}>
              <Link
                href={rutaCatalogo({ ...filtros, rubro })}
                scroll={false}
                aria-current={filtros.rubro === rubro ? "true" : undefined}
                className={CLASE_OPCION}
              >
                {rubro && <IconoRubro rubro={rubro} className="size-4" />}
                {rubro ? NOMBRE_RUBRO[rubro] : "Todos"}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex flex-col gap-4 border-t border-border/70 pt-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setAbierto((v) => !v)}
            aria-expanded={abierto}
            aria-controls="mas-opciones-ofertas"
            className="h-11 gap-2 px-4 text-base"
          >
            <SlidersHorizontalIcon data-icon="inline-start" aria-hidden="true" />
            Más opciones
            {opcionesActivas > 0 && (
              <span className="rounded-full bg-primary px-2 text-sm font-semibold text-primary-foreground">
                {opcionesActivas}
              </span>
            )}
            <ChevronDownIcon
              data-icon="inline-end"
              aria-hidden="true"
              className={cn("transition-transform", abierto && "rotate-180")}
            />
          </Button>
          <span className="text-sm text-muted-foreground">Sueldo, horario, zona y orden</span>
          {hayFiltros(filtros) && (
            <Link
              href={rutaCatalogo({ ...FILTROS_VACIOS, orden: filtros.orden })}
              scroll={false}
              className={cn(buttonVariants({ variant: "ghost" }), "h-11 text-base")}
            >
              <XIcon data-icon="inline-start" aria-hidden="true" />
              Borrar todo
            </Link>
          )}
        </div>

        <AnimarColapsable abierto={abierto}>
          <div id="mas-opciones-ofertas" className="grid gap-5 pt-1 md:grid-cols-2">
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-base font-semibold">Sueldo</legend>
              <ul className="flex flex-wrap gap-2">
                {OPCIONES_PAGO.map(({ valor, texto }) => (
                  <li key={valor}>
                    <Link
                      href={rutaCatalogo({ ...filtros, pago: valor })}
                      scroll={false}
                      aria-current={filtros.pago === valor ? "true" : undefined}
                      className={CLASE_OPCION}
                    >
                      {texto}
                    </Link>
                  </li>
                ))}
              </ul>
            </fieldset>

            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-base font-semibold">Horario</legend>
              <ul className="flex flex-wrap gap-2">
                {OPCIONES_HORARIO.map(({ valor, texto }) => (
                  <li key={valor || "cualquiera"}>
                    <Link
                      href={rutaCatalogo({ ...filtros, horario: valor })}
                      scroll={false}
                      aria-current={filtros.horario === valor ? "true" : undefined}
                      className={CLASE_OPCION}
                    >
                      {texto}
                    </Link>
                  </li>
                ))}
              </ul>
            </fieldset>

            <div className="flex flex-col gap-2">
              <Label htmlFor="filtro-zona" className="text-base font-semibold">
                Zona de Funes
              </Label>
              <SelectorNativo
                id="filtro-zona"
                value={filtros.barrio}
                onChange={(e) => router.replace(rutaCatalogo({ ...filtros, barrio: e.target.value }), { scroll: false })}
                className="h-11 w-full text-base"
              >
                <option value="">Todas las zonas</option>
                {barriosDisponibles.map((barrio) => (
                  <option key={barrio} value={barrio}>
                    {barrio}
                  </option>
                ))}
              </SelectorNativo>
            </div>

            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-base font-semibold">Ordenar</legend>
              <ul className="flex flex-wrap gap-2">
                {OPCIONES_ORDEN.map(({ valor, texto }) => (
                  <li key={valor}>
                    <Link
                      href={rutaCatalogo({ ...filtros, orden: valor })}
                      scroll={false}
                      aria-current={filtros.orden === valor ? "true" : undefined}
                      className={CLASE_OPCION}
                    >
                      {texto}
                    </Link>
                  </li>
                ))}
              </ul>
            </fieldset>
          </div>
        </AnimarColapsable>
      </div>
    </div>
  );
}
