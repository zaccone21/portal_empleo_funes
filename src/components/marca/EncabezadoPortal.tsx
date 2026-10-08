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
 * brand surface: the lockup with the municipal logo, the menu of whoever is
 * logged in (desktop only; on phones the menu is BarraInferior) and the
 * account corner ("Salir" / "Ingresar").
 *
 * `area` is the role the layout belongs to; it decides what to offer to
 * someone who is not logged in. The current page is marked with
 * aria-current="page", which also paints the mint underline, so the visual
 * and the accessible state cannot drift apart.
 */
export function EncabezadoPortal({ area }: { area: Role }) {
  const { usuario } = useSesion();
  const ruta = usePathname();
  const items = itemsNavegacion(usuario, area, false);

  return (
    <header className="bg-brand-deep text-primary-foreground">
      <div className="flex w-full items-center justify-between gap-4 px-4 py-2 lg:px-6 lg:py-3">
        <MarcaPortal />
        <div className="flex items-center gap-4">
          {items.length > 0 && (
            <nav aria-label="Principal" className="hidden lg:block">
              <ul className="flex gap-1">
                {items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={ruta === item.href ? "page" : undefined}
                      className={cn(
                        "relative inline-flex min-h-11 items-center rounded-md px-3 text-base font-medium text-primary-foreground/75 outline-none",
                        "hover:text-primary-foreground focus-visible:ring-3 focus-visible:ring-brand-mint/70",
                        "after:absolute after:inset-x-3 after:bottom-1 after:h-0.5 after:rounded-full after:bg-brand-mint after:opacity-0",
                        "aria-[current=page]:text-primary-foreground aria-[current=page]:after:opacity-100",
                      )}
                    >
                      {item.texto}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          <BotonCuenta area={area} />
        </div>
      </div>
    </header>
  );
}
