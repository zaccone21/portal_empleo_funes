"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useSesion } from "@/hooks/useSesion";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/validation/role";

import { itemsNavegacion } from "./itemsNavegacion";

/**
 * Bottom bar of phones (D-028): the menu of whoever is logged in, fixed where
 * the thumb reaches, with an icon and a word per item (never an icon alone).
 * Without a session it offers the public items plus "Ingresar" and the
 * registration. From `lg` up it is hidden: the top bar has the menu.
 *
 * Its height is --alto-barra-inferior (set by the area layouts), so pinned
 * footers (like "Postularme") sit on top of it instead of under it. It also
 * leaves room for the phone's home indicator (safe-area-inset-bottom).
 * The role's main action (`destacado`, "Publicar" for companies) is painted
 * solid so it is found at a glance.
 */
export function BarraInferior({ area }: { area: Role }) {
  const { usuario } = useSesion();
  const ruta = usePathname();
  const items = itemsNavegacion(usuario, area, true);

  return (
    <nav
      aria-label="Principal"
      className="fixed inset-x-0 bottom-0 z-40 h-(--alto-barra-inferior) border-t bg-card pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul
        className="mx-auto grid h-full max-w-md"
        style={{ gridTemplateColumns: `repeat(${Math.max(items.length, 1)}, minmax(0, 1fr))` }}
      >
        {items.map(({ href, texto, icono: Icono, destacado }) => {
          const actual = ruta === href;
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={actual ? "page" : undefined}
                className={cn(
                  "flex h-full flex-col items-center justify-center gap-1 px-1 text-[0.8125rem] leading-tight font-medium text-muted-foreground outline-none",
                  "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset",
                  "aria-[current=page]:font-semibold aria-[current=page]:text-primary",
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-14 items-center justify-center rounded-full",
                    destacado ? "bg-primary text-primary-foreground" : actual && "bg-secondary",
                  )}
                >
                  <Icono aria-hidden="true" className="size-5" />
                </span>
                <span className="max-w-full truncate">{texto}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
