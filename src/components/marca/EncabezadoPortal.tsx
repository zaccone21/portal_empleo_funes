"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useSesion } from "@/hooks/useSesion";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/validation/role";

import { BotonCuenta } from "./BotonCuenta";
import { itemsNavegacion } from "./itemsNavegacion";
import { MarcaPortal } from "./MarcaPortal";

/**
 * Top bar of the portal's inner screens (D-022, D-028), on the deep green
 * brand surface, aligned with the content (max-w-6xl):
 * - left, the lockup with the municipal logo;
 * - desktop only, the menu of whoever is looking (itemsNavegacion), with the
 *   role's main action ("Publicar") as a mint button; on phones the menu is
 *   BarraInferior;
 * - right, the account corner (BotonCuenta).
 * From `lg` it stays pinned on top while the page scrolls.
 *
 * `area` is the role the layout belongs to; it decides what to offer to someone
 * who is not logged in. The current page is marked with aria-current="page",
 * which also paints the mint underline, so the visual and the accessible state
 * cannot drift apart.
 */
export function EncabezadoPortal({ area }: { area: Role }) {
  const { usuario } = useSesion();
  const ruta = usePathname();
  const items = itemsNavegacion(usuario, area, false);

  return (
    <header className="z-40 border-b border-primary-foreground/10 bg-brand-deep text-primary-foreground lg:sticky lg:top-0">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-2 lg:px-10 lg:py-2.5">
        <MarcaPortal />
        {items.length > 0 && (
          <nav aria-label="Principal" className="hidden lg:block">
            <ul className="flex items-center gap-0.5 xl:gap-1">
              {items.map(({ href, texto, icono: Icono, destacado }) => (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={ruta === href ? "page" : undefined}
                    className={cn(
                      "relative inline-flex min-h-11 items-center gap-1.5 rounded-md px-2.5 text-base font-medium whitespace-nowrap outline-none focus-visible:ring-3 focus-visible:ring-brand-mint/70 xl:px-3",
                      destacado
                        ? "ml-1 bg-brand-mint text-brand-deep hover:bg-brand-mint/90"
                        : "text-primary-foreground/75 hover:bg-primary-foreground/10 hover:text-primary-foreground",
                      !destacado &&
                        "after:absolute after:inset-x-3 after:bottom-1 after:h-0.5 after:rounded-full after:bg-brand-mint after:opacity-0",
                      !destacado && "aria-[current=page]:text-primary-foreground aria-[current=page]:after:opacity-100",
                    )}
                  >
                    {destacado && <Icono aria-hidden="true" className="size-4" />}
                    {texto}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
        <BotonCuenta area={area} />
      </div>
    </header>
  );
}
