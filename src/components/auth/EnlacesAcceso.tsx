import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type EnlaceAcceso = { href: string; texto: string };

/**
 * Secondary links at the bottom of an access screen ("Registrate", "Olvidé
 * mi contraseña", "Volver a ingresar"). They use the link look of Button so
 * each one is a 44px touch target (RNF3), aligned to the left like the rest
 * of the tile.
 */
export function EnlacesAcceso({ enlaces }: { enlaces: EnlaceAcceso[] }) {
  return (
    <ul className="-my-2 flex flex-col">
      {enlaces.map((enlace) => (
        <li key={enlace.href}>
          <Link
            href={enlace.href}
            // cn merges conflicting classes, so px-0 replaces the variant's padding.
            className={cn(
              buttonVariants({ variant: "link" }),
              "h-auto min-h-11 justify-start px-0 text-left whitespace-normal",
            )}
          >
            {enlace.texto}
          </Link>
        </li>
      ))}
    </ul>
  );
}
