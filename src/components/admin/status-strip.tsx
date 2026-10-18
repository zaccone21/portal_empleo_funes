"use client";

import Link from "next/link";

import { useUrlAdmin } from "@/hooks/useUrlAdmin";
import { cn } from "@/lib/utils";

export type OpcionTira = { valor: string; etiqueta: string; cantidad: number };

type Props = {
  opciones: OpcionTira[];
  /** The value that means "no filter": it removes the parameter from the URL. */
  valorTodos: string;
  /** Query parameter the strip filters by. */
  param?: string;
};

/**
 * Status strip (D-042): equal cells with the count of each state; each cell is
 * a link that filters by URL. The active cell has a mint background and a 3 px
 * green line below. It scrolls sideways on phones.
 */
export function StatusStrip({ opciones, valorTodos, param = "estado" }: Props) {
  const { params, construir } = useUrlAdmin();
  const actual = params.get(param) ?? valorTodos;

  return (
    <nav aria-label="Filtrar por estado" className="overflow-x-auto rounded-[10px] border border-border">
      <ul className="grid min-w-max grid-flow-col auto-cols-fr md:min-w-0">
        {opciones.map((opcion) => {
          const activa = opcion.valor === actual;
          return (
            <li key={opcion.valor} className="border-r border-border last:border-r-0">
              <Link
                href={construir({ [param]: opcion.valor === valorTodos ? undefined : opcion.valor })}
                scroll={false}
                aria-current={activa ? "true" : undefined}
                className={cn(
                  "flex min-w-24 flex-col px-3.5 py-2 text-[12px] text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset",
                  activa && "bg-mint-soft shadow-[inset_0_-3px_0_var(--primary)]",
                )}
              >
                {opcion.etiqueta}
                <span className="text-[20px] leading-tight font-bold text-foreground tabular-nums">{opcion.cantidad}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
