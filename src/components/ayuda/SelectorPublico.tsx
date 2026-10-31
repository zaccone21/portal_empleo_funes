"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

import { PUBLICOS, type Publico } from "./contenido";

/**
 * "¿Para quién es la ayuda?" (P20): two large tiles that are links
 * (`?para=empresa`), so the choice lives in the URL and the "back" of the
 * phone works. The chosen one is green-tinted and announced with aria-current.
 */
export function SelectorPublico({ elegido }: { elegido: Publico }) {
  return (
    <nav aria-label="Elegí para quién es la ayuda">
      <ul className="grid gap-3 sm:grid-cols-2">
        {(Object.keys(PUBLICOS) as Publico[]).map((publico) => {
          const { titulo, texto, icono: Icono } = PUBLICOS[publico];
          const actual = publico === elegido;
          return (
            <li key={publico} className="relative">
              <Link
                href={publico === "postulante" ? "/ayuda" : "/ayuda?para=empresa"}
                scroll={false}
                aria-current={actual ? "page" : undefined}
                className={cn(
                  "relative z-10 flex min-h-11 items-center gap-4 rounded-tl-2xl rounded-tr-md rounded-br-2xl rounded-bl-md p-4 outline-none transition-colors",
                  "hover:ring-primary/40 focus-visible:ring-3 focus-visible:ring-ring/50",
                  !actual && "bg-card ring-1 ring-foreground/10",
                )}
              >
                {actual && (
                  <motion.span
                    layoutId="selector-publico-activo"
                    className="absolute inset-0 -z-10 rounded-tl-2xl rounded-tr-md rounded-br-2xl rounded-bl-md bg-secondary ring-2 ring-primary"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-12 shrink-0 items-center justify-center rounded-tl-xl rounded-tr-sm rounded-br-xl rounded-bl-sm transition-colors",
                    actual ? "bg-primary text-primary-foreground" : "bg-secondary text-primary",
                  )}
                >
                  <Icono className="size-6" />
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className="font-heading text-lg font-semibold">{titulo}</span>
                  <span className="text-base text-muted-foreground">{texto}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
