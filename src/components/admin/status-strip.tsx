"use client";

import Link from "next/link";
import { motion } from "motion/react";

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
            <li key={opcion.valor} className="relative border-r border-border last:border-r-0">
              <Link
                href={construir({ [param]: opcion.valor === valorTodos ? undefined : opcion.valor })}
                scroll={false}
                aria-current={activa ? "true" : undefined}
                className="relative z-10 flex min-w-24 flex-col px-3.5 py-2 text-[12px] text-muted-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset hover:text-foreground"
              >
                {activa && (
                  <motion.span
                    layoutId={`status-strip-${param}`}
                    className="absolute inset-0 -z-10 bg-mint-soft shadow-[inset_0_-3px_0_var(--primary)]"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <span className={cn("transition-colors", activa && "font-semibold text-primary")}>
                  {opcion.etiqueta}
                </span>
                <span className="text-[20px] leading-tight font-bold text-foreground tabular-nums">{opcion.cantidad}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
