"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpDownIcon,
  BadgeDollarSignIcon,
  BriefcaseIcon,
  Building2Icon,
  ClockIcon,
  RotateCcwIcon,
  SearchIcon,
  XIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
} from "@/components/ui/select";
import {
  FILTROS_VACIOS,
  hayFiltros,
  rutaCatalogo,
  type FiltroPagoOferta,
  type FiltrosOfertas as Filtros,
} from "@/lib/catalogo";
import {
  MODALIDADES_LABORALES,
  NOMBRE_MODALIDAD,
  NOMBRE_TIPO_JORNADA,
  TIPOS_JORNADA,
  type ModalidadLaboral,
  type TipoJornada,
} from "@/lib/validation/estandarizacion";
import type { OfertaPublica } from "@/lib/validation/ofertas";
import { NOMBRE_RUBRO, RUBROS, esRubro, type Rubro } from "@/lib/validation/rubros";
import { cn } from "@/lib/utils";

type Props = {
  filtros: Filtros;
  ofertas?: OfertaPublica[];
  className?: string;
};

const OPCIONES_PAGO: { valor: FiltroPagoOferta; texto: string }[] = [
  { valor: "todos", texto: "Todas las remuneraciones" },
  { valor: "con_sueldo", texto: "Dice cuánto pagan" },
  { valor: "a_convenir", texto: "A convenir" },
];

const OPCIONES_JORNADA: { valor: TipoJornada; texto: string }[] = [
  { valor: "completa", texto: "Jornada Completa" },
  { valor: "media_jornada", texto: "Media Jornada" },
  { valor: "flexible", texto: "Flexible" },
];

const OPCIONES_MODALIDAD: { valor: ModalidadLaboral; texto: string }[] = [
  { valor: "presencial", texto: "Presencial" },
  { valor: "hibrido", texto: "Híbrido" },
  { valor: "remoto", texto: "Remoto" },
];

const TODOS = "__todos";

/**
 * Barra lineal de búsqueda y filtros compacta estilo CompuTrabajo / Indeed (P05).
 * - Buscador alargado a la izquierda para máxima comodidad de lectura.
 * - Chips de filtros agrupados hacia la derecha con íconos representativos en cada uno.
 * - Tipografía institucional consistente (Be Vietnam Pro / Sora).
 * - Selector de ordenación como opción pequeña aparte.
 */
export function FiltrosOfertas({ filtros: filtrosParciales, ofertas = [], className }: Props) {
  const router = useRouter();
  const filtros = useMemo(
    () => ({ ...FILTROS_VACIOS, ...filtrosParciales }),
    [filtrosParciales],
  );
  const [queryTexto, setQueryTexto] = useState(filtros.q);
  const [prevFiltroQ, setPrevFiltroQ] = useState(filtros.q);

  // Mantiene sincronizado el input con cambios externos de la URL sin setState en effect
  if (filtros.q !== prevFiltroQ) {
    setPrevFiltroQ(filtros.q);
    setQueryTexto(filtros.q);
  }

  // Búsqueda en vivo mientras el usuario tipea (debounced ~280ms)
  useEffect(() => {
    if (queryTexto.trim() === filtros.q.trim()) return;

    const timer = setTimeout(() => {
      router.replace(
        rutaCatalogo({ ...filtros, q: queryTexto.trim() }, undefined, 1),
        { scroll: false },
      );
    }, 280);

    return () => clearTimeout(timer);
  }, [queryTexto, filtros, router]);

  // Cantidad de ofertas activas por cada rubro
  const conteosRubros = useMemo(() => {
    const conteos: Partial<Record<Rubro, number>> = {};
    for (const rubro of RUBROS) {
      conteos[rubro] = 0;
    }
    for (const oferta of ofertas) {
      for (const rubro of oferta.rubros) {
        conteos[rubro] = (conteos[rubro] ?? 0) + 1;
      }
    }
    return conteos;
  }, [ofertas]);

  function buscar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.replace(
      rutaCatalogo({ ...filtros, q: queryTexto.trim() }, undefined, 1),
      { scroll: false },
    );
  }

  function limpiarBusqueda() {
    setQueryTexto("");
    router.replace(rutaCatalogo({ ...filtros, q: "" }, undefined, 1), { scroll: false });
  }

  function cambiarRubro(valor: string) {
    const rubro = valor && valor !== TODOS && esRubro(valor) ? (valor as Rubro) : null;
    router.replace(rutaCatalogo({ ...filtros, rubro }, undefined, 1), { scroll: false });
  }

  function cambiarTipoJornada(valor: string) {
    const tipoJornada =
      valor && valor !== TODOS && (TIPOS_JORNADA as readonly string[]).includes(valor)
        ? (valor as TipoJornada)
        : "";
    router.replace(rutaCatalogo({ ...filtros, tipoJornada }, undefined, 1), { scroll: false });
  }

  function cambiarModalidad(valor: string) {
    const modalidad =
      valor && valor !== TODOS && (MODALIDADES_LABORALES as readonly string[]).includes(valor)
        ? (valor as ModalidadLaboral)
        : "";
    router.replace(rutaCatalogo({ ...filtros, modalidad }, undefined, 1), { scroll: false });
  }

  function cambiarPago(valor: string) {
    const pago = valor === "con_sueldo" || valor === "a_convenir" ? valor : "todos";
    router.replace(rutaCatalogo({ ...filtros, pago }, undefined, 1), { scroll: false });
  }

  function cambiarOrden(valor: string) {
    const orden = valor === "antiguas" ? "antiguas" : "recientes";
    router.replace(rutaCatalogo({ ...filtros, orden }, undefined, 1), { scroll: false });
  }

  function limpiarTodo() {
    setQueryTexto("");
    router.replace(rutaCatalogo(FILTROS_VACIOS, undefined, 1), { scroll: false });
  }

  const tieneFiltrosActivos = hayFiltros(filtros) || filtros.orden !== "recientes";

  return (
    <div className={cn("flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between font-sans", className)}>
      {/* 1. Lado izquierdo: Searchbar alargada y cómoda */}
      <form
        role="search"
        onSubmit={buscar}
        className="flex items-center gap-1.5 w-full lg:w-[420px] xl:w-[480px] 2xl:w-[540px] shrink-0"
      >
        <div className="relative flex-1">
          <SearchIcon
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="buscar-ofertas"
            name="q"
            type="text"
            inputMode="search"
            enterKeyHint="search"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            aria-label="Buscar empleo o palabra clave"
            placeholder="Puesto, oficio o palabra clave…"
            value={queryTexto}
            onChange={(e) => setQueryTexto(e.target.value)}
            className="h-11 pl-10 pr-9 text-base sm:text-sm font-sans bg-background rounded-full border-input shadow-2xs w-full placeholder:text-muted-foreground/80 focus-visible:ring-1 focus-visible:ring-primary [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden [&::-ms-clear]:hidden"
          />
          {queryTexto && (
            <button
              type="button"
              onClick={limpiarBusqueda}
              aria-label="Borrar texto de búsqueda"
              className="absolute right-2 top-1/2 -translate-y-1/2 flex size-8 items-center justify-center rounded-full text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            >
              <XIcon className="size-4" />
            </button>
          )}
        </div>
        <Button
          type="submit"
          className="h-11 px-5 text-base sm:text-sm font-sans font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shrink-0 shadow-2xs cursor-pointer transition-colors"
        >
          Buscar
        </Button>
      </form>

      {/* 2. Lado derecho: Pastillas de filtros con iconos + Ordenar chiquito con Peek y Fade en mobile */}
      <div className="relative -mr-4 pr-0 sm:mr-0 sm:pr-0 lg:ml-auto overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-muted to-transparent lg:hidden" />
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-0.5 pl-0.5 pr-8 sm:pr-0">
        {/* Rubro */}
        <Select
          value={filtros.rubro ?? TODOS}
          onValueChange={(val) => cambiarRubro(val ?? TODOS)}
        >
          <SelectTrigger
            aria-label="Rubro u oficio"
            className={cn(
              "h-11 rounded-full px-4 text-sm font-sans font-medium transition-all border shadow-sm hover:shadow-md gap-1.5 shrink-0 cursor-pointer",
              filtros.rubro
                ? "border-primary/50 bg-primary/10 text-primary font-semibold"
                : "border-border/80 bg-background text-foreground hover:bg-secondary/60 hover:border-primary/40"
            )}
          >
            <BriefcaseIcon
              className={cn("size-3.5 shrink-0", filtros.rubro ? "text-primary" : "text-muted-foreground")}
              aria-hidden="true"
            />
            <span>{filtros.rubro ? `Rubro: ${NOMBRE_RUBRO[filtros.rubro]}` : "Rubro"}</span>
          </SelectTrigger>
          <SelectContent align="start" side="bottom" sideOffset={6} alignItemWithTrigger={false} className="min-w-56 font-sans">
            <SelectItem value={TODOS}>Todos los rubros</SelectItem>
            <SelectSeparator />
            {RUBROS.map((rubro) => {
              const cantidad = conteosRubros[rubro] ?? 0;
              return (
                <SelectItem key={rubro} value={rubro}>
                  <div className="flex items-center justify-between w-full gap-3">
                    <span>{NOMBRE_RUBRO[rubro]}</span>
                    {cantidad > 0 && (
                      <span className="text-[11px] font-semibold text-muted-foreground">({cantidad})</span>
                    )}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        {/* Modalidad */}
        <Select
          value={filtros.modalidad || TODOS}
          onValueChange={(val) => cambiarModalidad(val ?? TODOS)}
        >
          <SelectTrigger
            aria-label="Modalidad laboral"
            className={cn(
              "h-11 rounded-full px-4 text-sm font-sans font-medium transition-all border shadow-sm hover:shadow-md gap-1.5 shrink-0 cursor-pointer",
              filtros.modalidad
                ? "border-primary/50 bg-primary/10 text-primary font-semibold"
                : "border-border/80 bg-background text-foreground hover:bg-secondary/60 hover:border-primary/40"
            )}
          >
            <Building2Icon
              className={cn("size-3.5 shrink-0", filtros.modalidad ? "text-primary" : "text-muted-foreground")}
              aria-hidden="true"
            />
            <span>{filtros.modalidad ? `Modalidad: ${NOMBRE_MODALIDAD[filtros.modalidad]}` : "Modalidad"}</span>
          </SelectTrigger>
          <SelectContent align="start" side="bottom" sideOffset={6} alignItemWithTrigger={false} className="min-w-44 font-sans">
            <SelectItem value={TODOS}>Todas las modalidades</SelectItem>
            <SelectSeparator />
            {OPCIONES_MODALIDAD.map(({ valor, texto }) => (
              <SelectItem key={valor} value={valor}>
                {texto}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Jornada */}
        <Select
          value={filtros.tipoJornada || TODOS}
          onValueChange={(val) => cambiarTipoJornada(val ?? TODOS)}
        >
          <SelectTrigger
            aria-label="Jornada laboral"
            className={cn(
              "h-11 rounded-full px-4 text-sm font-sans font-medium transition-all border shadow-sm hover:shadow-md gap-1.5 shrink-0 cursor-pointer",
              filtros.tipoJornada
                ? "border-primary/50 bg-primary/10 text-primary font-semibold"
                : "border-border/80 bg-background text-foreground hover:bg-secondary/60 hover:border-primary/40"
            )}
          >
            <ClockIcon
              className={cn("size-3.5 shrink-0", filtros.tipoJornada ? "text-primary" : "text-muted-foreground")}
              aria-hidden="true"
            />
            <span>{filtros.tipoJornada ? `Jornada: ${NOMBRE_TIPO_JORNADA[filtros.tipoJornada]}` : "Jornada"}</span>
          </SelectTrigger>
          <SelectContent align="start" side="bottom" sideOffset={6} alignItemWithTrigger={false} className="min-w-44 font-sans">
            <SelectItem value={TODOS}>Todas las jornadas</SelectItem>
            <SelectSeparator />
            {OPCIONES_JORNADA.map(({ valor, texto }) => (
              <SelectItem key={valor} value={valor}>
                {texto}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Salario */}
        <Select
          value={filtros.pago ?? "todos"}
          onValueChange={(val) => cambiarPago(val ?? "todos")}
        >
          <SelectTrigger
            aria-label="Salario o remuneración"
            className={cn(
              "h-11 rounded-full px-4 text-sm font-sans font-medium transition-all border shadow-sm hover:shadow-md gap-1.5 shrink-0 cursor-pointer",
              filtros.pago !== "todos"
                ? "border-primary/50 bg-primary/10 text-primary font-semibold"
                : "border-border/80 bg-background text-foreground hover:bg-secondary/60 hover:border-primary/40"
            )}
          >
            <BadgeDollarSignIcon
              className={cn("size-3.5 shrink-0", filtros.pago !== "todos" ? "text-primary" : "text-muted-foreground")}
              aria-hidden="true"
            />
            <span>
              {filtros.pago !== "todos"
                ? filtros.pago === "con_sueldo"
                  ? "Salario: Dice sueldo"
                  : "Salario: A convenir"
                : "Salario"}
            </span>
          </SelectTrigger>
          <SelectContent align="start" side="bottom" sideOffset={6} alignItemWithTrigger={false} className="min-w-48 font-sans">
            <SelectItem value="todos">Todas las remuneraciones</SelectItem>
            <SelectSeparator />
            {OPCIONES_PAGO.filter((o) => o.valor !== "todos").map(({ valor, texto }) => (
              <SelectItem key={valor} value={valor}>
                {texto}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Ordenar (opción chiquita aparte, presente en mobile y desktop) */}
        <div className="shrink-0 flex items-center pl-1 sm:pl-1.5 border-l border-border/60">
          <Select
            value={filtros.orden ?? "recientes"}
            onValueChange={(val) => cambiarOrden(val ?? "recientes")}
          >
            <SelectTrigger
              aria-label="Ordenar ofertas"
              className={cn(
                "h-11 sm:h-9 rounded-full px-3 text-xs font-sans font-medium transition-all border shadow-sm hover:shadow-md gap-1.5 shrink-0 cursor-pointer",
                filtros.orden === "antiguas"
                  ? "border-primary/40 bg-primary/10 text-primary font-semibold"
                  : "border-border/70 bg-background text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
            >
              <ArrowUpDownIcon className="size-3 text-muted-foreground shrink-0" aria-hidden="true" />
              <span>{filtros.orden === "antiguas" ? "Más antiguas" : "Ordenar"}</span>
            </SelectTrigger>
            <SelectContent align="end" side="bottom" sideOffset={6} alignItemWithTrigger={false} className="min-w-44 font-sans">
              <SelectItem value="recientes">Más recientes primero</SelectItem>
              <SelectItem value="antiguas">Más antiguas primero</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Botón rápido para limpiar filtros si hay alguno activo */}
        {tieneFiltrosActivos && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={limpiarTodo}
            className="h-11 sm:h-8 px-3 text-xs font-sans font-semibold text-muted-foreground hover:text-foreground gap-1 shrink-0 cursor-pointer"
            title="Restablecer todos los filtros"
          >
            <RotateCcwIcon className="size-3" aria-hidden="true" />
            <span>Limpiar</span>
          </Button>
        )}
        </div>
      </div>
    </div>
  );
}
