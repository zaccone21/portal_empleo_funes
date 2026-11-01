"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon, XIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { AnimarColapsable } from "@/components/marca/animaciones";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  FILTROS_VACIOS,
  hayFiltros,
  rutaCatalogo,
  type FiltroPagoOferta,
  type FiltrosOfertas as Filtros,
  type OrdenOfertas,
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
  { valor: "todos", texto: "Todos" },
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
 * Filtros del catálogo de ofertas (P05).
 * Barra horizontal unificada estilo navbar con filtros shadcn/ui con labels claros
 * y buscador integrado, eliminando el filtro obsoleto de zona.
 */
export function FiltrosOfertas({ filtros: filtrosParciales, className }: Props) {
  const router = useRouter();
  const filtros = { ...FILTROS_VACIOS, ...filtrosParciales };
  const [queryTexto, setQueryTexto] = useState(filtros.q);

  function buscar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.replace(rutaCatalogo({ ...filtros, q: queryTexto.trim() }), { scroll: false });
  }

  function limpiarBusqueda() {
    setQueryTexto("");
    router.replace(rutaCatalogo({ ...filtros, q: "" }), { scroll: false });
  }

  function cambiarRubro(valor: string) {
    const rubro = valor && valor !== TODOS && esRubro(valor) ? (valor as Rubro) : null;
    router.replace(rutaCatalogo({ ...filtros, rubro }), { scroll: false });
  }

  function cambiarTipoJornada(valor: string) {
    const tipoJornada =
      valor && valor !== TODOS && (TIPOS_JORNADA as readonly string[]).includes(valor)
        ? (valor as TipoJornada)
        : "";
    router.replace(rutaCatalogo({ ...filtros, tipoJornada }), { scroll: false });
  }

  function cambiarModalidad(valor: string) {
    const modalidad =
      valor && valor !== TODOS && (MODALIDADES_LABORALES as readonly string[]).includes(valor)
        ? (valor as ModalidadLaboral)
        : "";
    router.replace(rutaCatalogo({ ...filtros, modalidad }), { scroll: false });
  }

  function cambiarPago(valor: string) {
    const pago = valor === "con_sueldo" || valor === "a_convenir" ? valor : "todos";
    router.replace(rutaCatalogo({ ...filtros, pago }), { scroll: false });
  }

  function cambiarOrden(valor: string) {
    const orden = valor === "antiguas" ? "antiguas" : "recientes";
    router.replace(rutaCatalogo({ ...filtros, orden }), { scroll: false });
  }

  const tieneFiltrosActivos = hayFiltros(filtros) || filtros.orden !== "recientes";

  // Etiquetas legibles para cada disparador
  const etiquetaRubro = filtros.rubro && esRubro(filtros.rubro) ? NOMBRE_RUBRO[filtros.rubro as Rubro] : "Todos";
  const etiquetaModalidad = filtros.modalidad ? NOMBRE_MODALIDAD[filtros.modalidad as ModalidadLaboral] : "Todas";
  const etiquetaJornada = filtros.tipoJornada ? NOMBRE_TIPO_JORNADA[filtros.tipoJornada as TipoJornada] : "Todas";
  const etiquetaPago = filtros.pago === "con_sueldo" ? "Dice cuánto pagan" : filtros.pago === "a_convenir" ? "A convenir" : "Todos";
  const etiquetaOrden = filtros.orden === "antiguas" ? "Más antiguas" : "Más recientes";

  return (
    <div className={cn("flex flex-col gap-2 rounded-xl border border-border bg-card p-2.5 sm:p-3 shadow-2xs", className)}>
      {/* Barra principal unificada en una sola fila */}
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
        {/* Lado izquierdo: Filtros con etiqueta y valor claro */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Rubro */}
          <Select
            value={filtros.rubro ?? TODOS}
            onValueChange={(val) => cambiarRubro(val ?? TODOS)}
          >
            <SelectTrigger aria-label="Rubro u oficio" className="h-9 w-auto min-w-[130px] max-w-[190px] bg-background text-xs font-medium border-border/80 gap-1.5 px-2.5">
              <span className="text-muted-foreground font-normal">Rubro:</span>
              <span className="font-semibold text-foreground truncate">{etiquetaRubro}</span>
            </SelectTrigger>
            <SelectContent align="start" className="min-w-48">
              <SelectItem value={TODOS}>Rubro: Todos</SelectItem>
              {RUBROS.map((rubro) => (
                <SelectItem key={rubro} value={rubro}>
                  {NOMBRE_RUBRO[rubro]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Modalidad */}
          <Select
            value={filtros.modalidad || TODOS}
            onValueChange={(val) => cambiarModalidad(val ?? TODOS)}
          >
            <SelectTrigger aria-label="Modalidad" className="h-9 w-auto min-w-[125px] bg-background text-xs font-medium border-border/80 gap-1.5 px-2.5">
              <span className="text-muted-foreground font-normal">Modalidad:</span>
              <span className="font-semibold text-foreground truncate">{etiquetaModalidad}</span>
            </SelectTrigger>
            <SelectContent align="start" className="min-w-40">
              <SelectItem value={TODOS}>Modalidad: Todas</SelectItem>
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
            <SelectTrigger aria-label="Jornada" className="h-9 w-auto min-w-[120px] bg-background text-xs font-medium border-border/80 gap-1.5 px-2.5">
              <span className="text-muted-foreground font-normal">Jornada:</span>
              <span className="font-semibold text-foreground truncate">{etiquetaJornada}</span>
            </SelectTrigger>
            <SelectContent align="start" className="min-w-44">
              <SelectItem value={TODOS}>Jornada: Todas</SelectItem>
              {OPCIONES_JORNADA.map(({ valor, texto }) => (
                <SelectItem key={valor} value={valor}>
                  {texto}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sueldo */}
          <Select
            value={filtros.pago ?? "todos"}
            onValueChange={(val) => cambiarPago(val ?? "todos")}
          >
            <SelectTrigger aria-label="Remuneración" className="h-9 w-auto min-w-[120px] bg-background text-xs font-medium border-border/80 gap-1.5 px-2.5">
              <span className="text-muted-foreground font-normal">Sueldo:</span>
              <span className="font-semibold text-foreground truncate">{etiquetaPago}</span>
            </SelectTrigger>
            <SelectContent align="start" className="min-w-44">
              <SelectItem value="todos">Sueldo: Todos</SelectItem>
              <SelectItem value="con_sueldo">Dice cuánto pagan</SelectItem>
              <SelectItem value="a_convenir">A convenir</SelectItem>
            </SelectContent>
          </Select>

          {/* Orden */}
          <Select
            value={filtros.orden ?? "recientes"}
            onValueChange={(val) => cambiarOrden(val ?? "recientes")}
          >
            <SelectTrigger aria-label="Ordenar" className="h-9 w-auto min-w-[125px] bg-background text-xs font-medium border-border/80 gap-1.5 px-2.5">
              <span className="text-muted-foreground font-normal">Ordenar:</span>
              <span className="font-semibold text-foreground truncate">{etiquetaOrden}</span>
            </SelectTrigger>
            <SelectContent align="start" className="min-w-40">
              <SelectItem value="recientes">Más recientes</SelectItem>
              <SelectItem value="antiguas">Más antiguas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lado derecho: Buscador integrado con acción clara */}
        <form role="search" onSubmit={buscar} className="flex shrink-0 items-center gap-1.5 w-full lg:w-auto lg:min-w-[280px] lg:max-w-[360px]">
          <div className="relative flex-1">
            <SearchIcon
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="buscar-ofertas"
              name="q"
              type="search"
              aria-label="¿Qué trabajo buscás?"
              placeholder="¿Qué trabajo buscás? (ej: mozo, chofer…)"
              enterKeyHint="search"
              value={queryTexto}
              onChange={(e) => setQueryTexto(e.target.value)}
              className="h-9 pl-8.5 pr-8 text-xs sm:text-sm bg-background w-full"
            />
            {queryTexto && (
              <button
                type="button"
                onClick={limpiarBusqueda}
                aria-label="Borrar texto de búsqueda"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <XIcon className="size-3.5" />
              </button>
            )}
          </div>
          <Button type="submit" size="sm" className="h-9 shrink-0 px-3.5 text-xs font-semibold">
            Buscar
          </Button>
        </form>
      </div>

      {/* Franja de filtros activos y atajo de limpieza */}
      <AnimarColapsable abierto={tieneFiltrosActivos}>
        <div className="flex flex-wrap items-center gap-1.5 border-t border-border/60 pt-2 text-xs">
          <span className="text-[11.5px] font-semibold text-muted-foreground">Filtros activos:</span>

          <AnimatePresence>
            {filtros.q && (
              <motion.button
                key="filtro-q"
                type="button"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                onClick={limpiarBusqueda}
                className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
              >
                <span>Búsqueda: {filtros.q}</span>
                <XIcon className="size-3" aria-hidden="true" />
              </motion.button>
            )}

            {filtros.rubro && esRubro(filtros.rubro) && (
              <motion.button
                key="filtro-rubro"
                type="button"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                onClick={() => cambiarRubro("")}
                className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
              >
                <span>Rubro: {NOMBRE_RUBRO[filtros.rubro as Rubro]}</span>
                <XIcon className="size-3" aria-hidden="true" />
              </motion.button>
            )}

            {filtros.modalidad && (
              <motion.button
                key="filtro-modalidad"
                type="button"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                onClick={() => cambiarModalidad("")}
                className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
              >
                <span>Modalidad: {NOMBRE_MODALIDAD[filtros.modalidad as ModalidadLaboral]}</span>
                <XIcon className="size-3" aria-hidden="true" />
              </motion.button>
            )}

            {filtros.tipoJornada && (
              <motion.button
                key="filtro-jornada"
                type="button"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                onClick={() => cambiarTipoJornada("")}
                className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
              >
                <span>Jornada: {NOMBRE_TIPO_JORNADA[filtros.tipoJornada as TipoJornada]}</span>
                <XIcon className="size-3" aria-hidden="true" />
              </motion.button>
            )}

            {filtros.pago !== "todos" && (
              <motion.button
                key="filtro-pago"
                type="button"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                onClick={() => cambiarPago("todos")}
                className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
              >
                <span>Sueldo: {filtros.pago === "con_sueldo" ? "Dice cuánto pagan" : "A convenir"}</span>
                <XIcon className="size-3" aria-hidden="true" />
              </motion.button>
            )}

            {filtros.orden === "antiguas" && (
              <motion.button
                key="filtro-orden"
                type="button"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                onClick={() => cambiarOrden("recientes")}
                className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
              >
                <span>Más antiguas primero</span>
                <XIcon className="size-3" aria-hidden="true" />
              </motion.button>
            )}
          </AnimatePresence>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setQueryTexto("");
              router.replace(rutaCatalogo(FILTROS_VACIOS), { scroll: false });
            }}
            className="h-6 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Limpiar todo
          </Button>
        </div>
      </AnimarColapsable>
    </div>
  );
}
