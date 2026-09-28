"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import { MarcaPortal } from "./MarcaPortal";

export type EnlaceNavegacion = { href: string; texto: string };

/**
 * Top bar of the portal's inner screens: the lockup on the left and the main
 * navigation on the right, on the deep green brand surface (D-022).
 *
 * The current page is marked with aria-current="page", which screen readers
 * announce, and it is also what shows the mint underline, so the visual state
 * and the accessible state cannot drift apart. The path ignores the query,
 * so /ofertas?oferta=… still marks "Ofertas". It needs the current path, so
 * this is a Client Component.
 *
 * "Salir" and the session-aware links come in the navigation phase (they need
 * to know whether someone is logged in).
 */
export function EncabezadoPortal({ enlaces }: { enlaces: EnlaceNavegacion[] }) {
  const ruta = usePathname();

  return (
    <header className="bg-brand-deep text-primary-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 lg:px-10">
        <MarcaPortal />
        <nav aria-label="Principal">
          <ul className="flex flex-wrap gap-1">
            {enlaces.map((enlace) => (
              <li key={enlace.href}>
                <Link
                  href={enlace.href}
                  aria-current={ruta === enlace.href ? "page" : undefined}
                  className={cn(
                    "relative inline-flex min-h-11 items-center rounded-md px-3 text-base font-medium text-primary-foreground/75 outline-none",
                    "hover:text-primary-foreground focus-visible:ring-3 focus-visible:ring-brand-mint/70",
                    "after:absolute after:inset-x-3 after:bottom-1 after:h-0.5 after:rounded-full after:bg-brand-mint after:opacity-0",
                    "aria-[current=page]:text-primary-foreground aria-[current=page]:after:opacity-100",
                  )}
                >
                  {enlace.texto}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
