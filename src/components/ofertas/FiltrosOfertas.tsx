"use client";

import { useMemo, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon, XIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { AnimarColapsable } from "@/components/marca/animaciones";
import { SelectorNativo } from "@/components/formularios/SelectorNativo";
import { Button } from "@/components/ui/button";
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

const OPCIONES_JORNADA: { valor: TipoJornada | ""; texto: string }[] = [
  { valor: "", texto: "Cualquier jornada" },
  { valor: "completa", texto: "Jornada Completa" },
  { valor: "media_jornada", texto: "Media Jornada" },
  { valor: "flexible", texto: "Flexible" },
];

const OPCIONES_MODALIDAD: { valor: ModalidadLaboral | ""; texto: string }[] = [
  { valor: "", texto: "Cualquier modalidad" },
  { valor: "presencial", texto: "Presencial" },
  { valor: "hibrido", texto: "Híbrido" },
  { valor: "remoto", texto: "Remoto" },
];

const OPCIONES_ORDEN: { valor: OrdenOfertas; texto: string }[] = [
  { valor: "recientes", texto: "Más recientes primero" },
  { valor: "antiguas", texto: "Más antiguas primero" },
];

/**
 * Filtros del catálogo de ofertas (P05).
 * Grilla adaptable y eficiente con selectores nativos accesibles.
 */
export function FiltrosOfertas({ filtros: filtrosParciales, ofertas = [], className }: Props) {
  const router = useRouter();
  const filtros = { ...FILTROS_VACIOS, ...filtrosParciales };

  const barriosDisponibles = useMemo(() => extraerBarriosDisponibles(ofertas), [ofertas]);

  function buscar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = String(new FormData(event.currentTarget).get("q") ?? "").trim();
    router.replace(rutaCatalogo({ ...filtros, q }), { scroll: false });
  }

  function cambiarRubro(valor: string) {
    const rubro = valor && esRubro(valor) ? (valor as Rubro) : null;
    router.replace(rutaCatalogo({ ...filtros, rubro }), { scroll: false });
  }

  function cambiarTipoJornada(valor: string) {
    const tipoJornada =
      valor && (TIPOS_JORNADA as readonly string[]).includes(valor)
        ? (valor as TipoJornada)
        : "";
    router.replace(rutaCatalogo({ ...filtros, tipoJornada }), { scroll: false });
  }

  function cambiarModalidad(valor: string) {
    const modalidad =
      valor && (MODALIDADES_LABORALES as readonly string[]).includes(valor)
        ? (valor as ModalidadLaboral)
        : "";
    router.replace(rutaCatalogo({ ...filtros, modalidad }), { scroll: false });
  }

  function cambiarPago(valor: string) {
    const pago = valor === "con_sueldo" || valor === "a_convenir" ? valor : "todos";
    router.replace(rutaCatalogo({ ...filtros, pago }), { scroll: false });
  }

  function cambiarBarrio(valor: string) {
    router.replace(rutaCatalogo({ ...filtros, barrio: valor }), { scroll: false });
  }

  function cambiarOrden(valor: string) {
    const orden = valor === "antiguas" ? "antiguas" : "recientes";
    router.replace(rutaCatalogo({ ...filtros, orden }), { scroll: false });
  }

  const tieneFiltrosActivos = hayFiltros(filtros) || filtros.orden !== "recientes";

  return (
    <div className={cn("flex flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-2xs sm:p-4", className)}>
      {/* Buscador de texto */}
      <form role="search" onSubmit={buscar} className="flex flex-col gap-1.5 sm:flex-row sm:items-end sm:gap-2">
        <div className="flex flex-1 flex-col gap-1">
          <Label htmlFor="buscar-ofertas" className="text-xs font-semibold text-muted-foreground">
            ¿Qué trabajo buscás?
          </Label>
          <div className="relative">
            <SearchIcon
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="buscar-ofertas"
              name="q"
              type="search"
              placeholder="Puesto, oficio o palabra clave (ej: cocinero, chofer, ventas…)"
              enterKeyHint="search"
              defaultValue={filtros.q}
              key={filtros.q}
              className="h-10 pl-9 text-sm sm:h-11 sm:text-base bg-background"
            />
          </div>
        </div>
        <Button type="submit" className="h-10 shrink-0 px-5 text-sm font-semibold sm:h-11 sm:text-base">
          Buscar
        </Button>
      </form>

      {/* Grilla compacta de filtros en selectores */}
      <div className="grid grid-cols-1 gap-2 border-t border-border/60 pt-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {/* Filtro: Rubro */}
        <div className="flex flex-col gap-1">
          <Label htmlFor="filtro-rubro" className="text-xs font-semibold text-muted-foreground">
            Rubro u oficio
          </Label>
          <SelectorNativo
            id="filtro-rubro"
            value={filtros.rubro ?? ""}
            onChange={(e) => cambiarRubro(e.target.value)}
            className="h-10 text-xs sm:text-sm font-medium"
          >
            <option value="">Todos los rubros</option>
            {RUBROS.map((rubro) => (
              <option key={rubro} value={rubro}>
                {NOMBRE_RUBRO[rubro]}
              </option>
            ))}
          </SelectorNativo>
        </div>

        {/* Filtro: Tipo de Jornada */}
        <div className="flex flex-col gap-1">
          <Label htmlFor="filtro-tipo-jornada" className="text-xs font-semibold text-muted-foreground">
            Jornada
          </Label>
          <SelectorNativo
            id="filtro-tipo-jornada"
            value={filtros.tipoJornada ?? ""}
            onChange={(e) => cambiarTipoJornada(e.target.value)}
            className="h-10 text-xs sm:text-sm font-medium"
          >
            {OPCIONES_JORNADA.map(({ valor, texto }) => (
              <option key={valor} value={valor}>
                {texto}
              </option>
            ))}
          </SelectorNativo>
        </div>

        {/* Filtro: Modalidad */}
        <div className="flex flex-col gap-1">
          <Label htmlFor="filtro-modalidad" className="text-xs font-semibold text-muted-foreground">
            Modalidad
          </Label>
          <SelectorNativo
            id="filtro-modalidad"
            value={filtros.modalidad ?? ""}
            onChange={(e) => cambiarModalidad(e.target.value)}
            className="h-10 text-xs sm:text-sm font-medium"
          >
            {OPCIONES_MODALIDAD.map(({ valor, texto }) => (
              <option key={valor} value={valor}>
                {texto}
              </option>
            ))}
          </SelectorNativo>
        </div>

        {/* Filtro: Remuneración */}
        <div className="flex flex-col gap-1">
          <Label htmlFor="filtro-pago" className="text-xs font-semibold text-muted-foreground">
            Remuneración
          </Label>
          <SelectorNativo
            id="filtro-pago"
            value={filtros.pago ?? "todos"}
            onChange={(e) => cambiarPago(e.target.value)}
            className="h-10 text-xs sm:text-sm font-medium"
          >
            {OPCIONES_PAGO.map(({ valor, texto }) => (
              <option key={valor} value={valor}>
                {texto}
              </option>
            ))}
          </SelectorNativo>
        </div>

        {/* Filtro: Zona de Funes */}
        <div className="flex flex-col gap-1">
          <Label htmlFor="filtro-zona" className="text-xs font-semibold text-muted-foreground">
            Zona de Funes
          </Label>
          <SelectorNativo
            id="filtro-zona"
            value={filtros.barrio ?? ""}
            onChange={(e) => cambiarBarrio(e.target.value)}
            className="h-10 text-xs sm:text-sm font-medium"
          >
            <option value="">Todas las zonas</option>
            {barriosDisponibles.map((barrio) => (
              <option key={barrio} value={barrio}>
                {barrio}
              </option>
            ))}
          </SelectorNativo>
        </div>

        {/* Filtro: Ordenar */}
        <div className="flex flex-col gap-1">
          <Label htmlFor="filtro-orden" className="text-xs font-semibold text-muted-foreground">
            Ordenar
          </Label>
          <SelectorNativo
            id="filtro-orden"
            value={filtros.orden ?? "recientes"}
            onChange={(e) => cambiarOrden(e.target.value)}
            className="h-10 text-xs sm:text-sm font-medium"
          >
            {OPCIONES_ORDEN.map(({ valor, texto }) => (
              <option key={valor} value={valor}>
                {texto}
              </option>
            ))}
          </SelectorNativo>
        </div>
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
                transition={{ duration: 0.15 }}
                onClick={() => router.replace(rutaCatalogo({ ...filtros, q: "" }), { scroll: false })}
                className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-secondary/70 px-2 py-0.5 text-[11px] font-medium text-foreground hover:bg-secondary transition-colors"
                title="Quitar búsqueda de texto"
              >
                <span>&ldquo;{filtros.q}&rdquo;</span>
                <XIcon className="size-3 text-muted-foreground" />
              </motion.button>
            )}

            {filtros.rubro && (
              <motion.button
                key="filtro-rubro"
                type="button"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.15 }}
                onClick={() => cambiarRubro("")}
                className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-secondary/70 px-2 py-0.5 text-[11px] font-medium text-foreground hover:bg-secondary transition-colors"
                title="Quitar rubro"
              >
                <span>{NOMBRE_RUBRO[filtros.rubro]}</span>
                <XIcon className="size-3 text-muted-foreground" />
              </motion.button>
            )}

            {filtros.tipoJornada && (
              <motion.button
                key="filtro-tipo-jornada"
                type="button"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.15 }}
                onClick={() => cambiarTipoJornada("")}
                className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-secondary/70 px-2 py-0.5 text-[11px] font-medium text-foreground hover:bg-secondary transition-colors"
                title="Quitar filtro de jornada"
              >
                <span>{NOMBRE_TIPO_JORNADA[filtros.tipoJornada]}</span>
                <XIcon className="size-3 text-muted-foreground" />
              </motion.button>
            )}

            {filtros.modalidad && (
              <motion.button
                key="filtro-modalidad"
                type="button"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.15 }}
                onClick={() => cambiarModalidad("")}
                className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-secondary/70 px-2 py-0.5 text-[11px] font-medium text-foreground hover:bg-secondary transition-colors"
                title="Quitar filtro de modalidad"
              >
                <span>{NOMBRE_MODALIDAD[filtros.modalidad]}</span>
                <XIcon className="size-3 text-muted-foreground" />
              </motion.button>
            )}

            {filtros.pago && filtros.pago !== "todos" && (
              <motion.button
                key="filtro-pago"
                type="button"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.15 }}
                onClick={() => cambiarPago("todos")}
                className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-secondary/70 px-2 py-0.5 text-[11px] font-medium text-foreground hover:bg-secondary transition-colors"
                title="Quitar filtro de remuneración"
              >
                <span>{filtros.pago === "con_sueldo" ? "Dice sueldo" : "A convenir"}</span>
                <XIcon className="size-3 text-muted-foreground" />
              </motion.button>
            )}

            {filtros.barrio && (
              <motion.button
                key="filtro-barrio"
                type="button"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.15 }}
                onClick={() => cambiarBarrio("")}
                className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-secondary/70 px-2 py-0.5 text-[11px] font-medium text-foreground hover:bg-secondary transition-colors"
                title="Quitar filtro de zona"
              >
                <span>{filtros.barrio}</span>
                <XIcon className="size-3 text-muted-foreground" />
              </motion.button>
            )}

            {filtros.orden === "antiguas" && (
              <motion.button
                key="filtro-orden"
                type="button"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.15 }}
                onClick={() => cambiarOrden("recientes")}
                className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-secondary/70 px-2 py-0.5 text-[11px] font-medium text-foreground hover:bg-secondary transition-colors"
                title="Restablecer orden más recientes"
              >
                <span>Más antiguas</span>
                <XIcon className="size-3 text-muted-foreground" />
              </motion.button>
            )}
          </AnimatePresence>

          <button
            type="button"
            onClick={() => router.replace(rutaCatalogo(FILTROS_VACIOS), { scroll: false })}
            className="ml-auto inline-flex items-center gap-1 text-[11.5px] font-semibold text-primary hover:underline"
          >
            <XIcon className="size-3" />
            Limpiar todo
          </button>
        </div>
      </AnimarColapsable>
    </div>
  );
}
