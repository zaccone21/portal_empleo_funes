"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { useSesion } from "@/hooks/useSesion";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/validation/role";

import { BotonCuenta } from "./BotonCuenta";
import { itemsNavegacion, type ItemNavegacion } from "./itemsNavegacion";
import { MarcaPortal } from "./MarcaPortal";

/** The item of the current page: the longest href the path starts with, so /empresa/ofertas/1 marks "Mis ofertas". */
function itemActual(items: ItemNavegacion[], ruta: string): string | undefined {
  return items
    .filter(({ href }) => ruta === href || (href !== "/" && ruta.startsWith(`${href}/`)))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
}

/**
 * Top bar of the portal (D-022, D-028, D-065), on the deep green brand
 * surface, 64 px (72 px from `lg`), spanning the whole width of the screen:
 * - left, the lockup with the municipal logo, which leads home;
 * - desktop only, the role's screens as text links; the current one is white
 *   with a mint bar on the bar's bottom edge. On phones the menu is BarraInferior;
 * - right, the role's main action ("Publicar") as a mint button and the
 *   account corner (BotonCuenta): "Mi cuenta", or "Ingresar" and the registration.
 * From `lg` it stays pinned on top while the page scrolls.
 *
 * `area` is the role the layout belongs to; it decides what to offer to someone
 * who is not logged in. The current page is marked with aria-current="page",
 * which also paints the underline, so the visual and the accessible state
 * cannot drift apart.
 */
export function EncabezadoPortal({ area }: { area: Role }) {
  const { usuario } = useSesion();
  const ruta = usePathname();
  const items = itemsNavegacion(usuario, area, false);
  const enlaces = items.filter((item) => !item.destacado);
  const principal = items.find((item) => item.destacado);
  const actual = itemActual(items, ruta);

  return (
    <header className="z-40 border-b border-primary-foreground/10 bg-brand-deep text-primary-foreground lg:sticky lg:top-0">
      <div className="flex h-16 w-full items-center gap-4 px-4 sm:px-6 lg:h-[4.5rem] lg:gap-8 lg:px-10">
        {/* MarcaPortal aligns itself to the start (for the sign-in frame); this wrapper centers it in the bar. */}
        <div className="flex min-w-0">
          <MarcaPortal />
        </div>
        {enlaces.length > 0 && (
          <nav aria-label="Principal" className="hidden h-full lg:block">
            <ul className="flex h-full items-stretch gap-1">
              {enlaces.map(({ href, texto }) => (
                <li key={href} className="flex">
                  <Link
                    href={href}
                    aria-current={actual === href ? "page" : undefined}
                    className={cn(
                      "relative inline-flex items-center px-3 text-[0.9375rem] font-medium whitespace-nowrap text-primary-foreground/75 outline-none hover:text-primary-foreground",
                      "focus-visible:ring-3 focus-visible:ring-brand-mint/70 focus-visible:ring-inset",
                      "after:absolute after:inset-x-3 after:bottom-0 after:h-[3px] after:rounded-t-full after:bg-brand-mint after:opacity-0",
                      "aria-[current=page]:text-primary-foreground aria-[current=page]:after:opacity-100",
                    )}
                  >
                    {texto}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
        <div className="ml-auto flex items-center gap-3">
          {principal && (
            <Link
              href={principal.href}
              aria-current={actual === principal.href ? "page" : undefined}
              className={cn(buttonVariants(), "hidden bg-brand-mint text-brand-deep hover:bg-brand-mint/90 lg:inline-flex")}
            >
              <principal.icono data-icon="inline-start" aria-hidden="true" />
              {principal.texto}
            </Link>
          )}
          <BotonCuenta area={area} />
        </div>
      </div>
    </header>
  );
}
