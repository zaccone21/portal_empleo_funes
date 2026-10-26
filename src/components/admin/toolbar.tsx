"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUrlAdmin } from "@/hooks/useUrlAdmin";

type Opcion = { valor: string; etiqueta: string };

export type FiltroToolbar =
  | { tipo: "select"; param: string; etiqueta: string; opciones: Opcion[] }
  | { tipo: "multi"; param: string; etiqueta: string; opciones: Opcion[] };

type Props = {
  /** Descriptive placeholder, also the accessible name of the search box. */
  placeholder: string;
  filtros?: FiltroToolbar[];
};

const TODOS = "__todos";
const CLASE_DISPARADOR =
  "h-auto gap-1.5 rounded-lg border-input bg-background px-2.5 py-1.5 text-[13px] text-foreground shadow-none";

/** Debounced search box: writes `q` in the URL; the "/" key focuses it (see AdminTable). */
function Busqueda({ placeholder }: { placeholder: string }) {
  const { params, ir } = useUrlAdmin();
  const enUrl = params.get("q") ?? "";
  const [texto, setTexto] = useState(enUrl);
  const [vistoEnUrl, setVistoEnUrl] = useState(enUrl);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keeps the box in sync when the URL changes from outside (for example "Limpiar").
  if (enUrl !== vistoEnUrl) {
    setVistoEnUrl(enUrl);
    setTexto(enUrl);
  }

  useEffect(() => () => {
    if (temporizador.current) clearTimeout(temporizador.current);
  }, []);

  function alEscribir(valor: string) {
    setTexto(valor);
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => ir({ q: valor.trim() || undefined }), 300);
  }

  return (
    <Input
      type="search"
      data-busqueda
      value={texto}
      onChange={(e) => alEscribir(e.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
      className="h-auto w-full rounded-lg border-input px-2.5 py-[7px] text-[13px] shadow-none sm:w-[280px] md:text-[13px]"
    />
  );
}

function FiltroUnico({ filtro }: { filtro: Extract<FiltroToolbar, { tipo: "select" }> }) {
  const { params, ir } = useUrlAdmin();
  const valor = params.get(filtro.param) ?? TODOS;
  const items = [{ value: TODOS, label: filtro.etiqueta }, ...filtro.opciones.map((o) => ({ value: o.valor, label: o.etiqueta }))];

  return (
    <Select
      value={valor}
      items={items}
      onValueChange={(nuevo) => ir({ [filtro.param]: !nuevo || nuevo === TODOS ? undefined : nuevo })}
    >
      <SelectTrigger aria-label={filtro.etiqueta} className={CLASE_DISPARADOR}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false} align="start" className="w-auto min-w-40">
        <SelectItem value={TODOS}>{filtro.etiqueta}: todos</SelectItem>
        {filtro.opciones.map((o) => (
          <SelectItem key={o.valor} value={o.valor}>
            {o.etiqueta}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function FiltroMultiple({ filtro }: { filtro: Extract<FiltroToolbar, { tipo: "multi" }> }) {
  const { params, ir } = useUrlAdmin();
  const elegidos = (params.get(filtro.param) ?? "").split(",").filter(Boolean);

  function alternar(valor: string, activo: boolean) {
    const nuevos = activo ? [...elegidos, valor] : elegidos.filter((e) => e !== valor);
    ir({ [filtro.param]: nuevos.join(",") || undefined });
  }

  return (
    <Popover>
      <PopoverTrigger
        aria-label={filtro.etiqueta}
        className={`${CLASE_DISPARADOR} inline-flex items-center border outline-none focus-visible:ring-2 focus-visible:ring-primary`}
      >
        {elegidos.length > 0 ? `${filtro.etiqueta} (${elegidos.length})` : filtro.etiqueta}
        <ChevronDown className="size-4 text-muted-foreground" aria-hidden="true" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 gap-1 p-2">
        {filtro.opciones.map((o) => (
          <label key={o.valor} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-[13px] hover:bg-accent">
            <Checkbox checked={elegidos.includes(o.valor)} onCheckedChange={(c) => alternar(o.valor, c === true)} />
            {o.etiqueta}
          </label>
        ))}
      </PopoverContent>
    </Popover>
  );
}

/**
 * Toolbar of a register or queue (D-042): search box (280 px), one control per
 * filter and "Limpiar", which only shows when something is filtered.
 */
export function Toolbar({ placeholder, filtros = [] }: Props) {
  const { params, construir } = useUrlAdmin();
  const claves = ["q", ...filtros.map((f) => f.param)];
  const hayFiltros = claves.some((clave) => params.has(clave));

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Busqueda placeholder={placeholder} />
      {filtros.map((filtro) =>
        filtro.tipo === "select" ? (
          <FiltroUnico key={filtro.param} filtro={filtro} />
        ) : (
          <FiltroMultiple key={filtro.param} filtro={filtro} />
        ),
      )}
      {hayFiltros && (
        <Link
          scroll={false}
          href={construir(Object.fromEntries(claves.map((clave) => [clave, undefined])))}
          className="text-[13px] font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary"
        >
          Limpiar
        </Link>
      )}
    </div>
  );
}
