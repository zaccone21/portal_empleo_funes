import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
  /** Where the card goes: the same list with this item selected, for example "/ofertas?oferta=<id>". */
  href: string;
  /** This item's detail is the one on screen. */
  seleccionada: boolean;
  /**
   * The highlight only applies from `lg` up. Used when nobody picked an item
   * yet: on desktop the first item's detail is shown next to the list, while
   * on a phone only the list is visible and nothing should look selected.
   */
  soloEnEscritorio: boolean;
  children: ReactNode;
};

/**
 * Card of a list with the detail on the same page (D-025), with the portal's
 * "leaf" shape. The whole card is a link, so the back button returns to the
 * list and an item can be shared. `aria-current` tells screen readers which
 * one is open. `scroll={false}` keeps the list where it was on desktop; on
 * phones the detail scrolls itself into view (see PanelDetalle).
 */
export function TarjetaSeleccionable({ href, seleccionada, soloEnEscritorio, children }: Props) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={seleccionada && !soloEnEscritorio ? "true" : undefined}
      className={cn(
        "flex items-start gap-3 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card p-4 ring-1 ring-foreground/5 outline-none sm:p-5",
        "hover:ring-foreground/20 focus-visible:ring-3 focus-visible:ring-ring/50",
        seleccionada &&
          (soloEnEscritorio ? "lg:bg-secondary lg:ring-2 lg:ring-primary" : "bg-secondary ring-2 ring-primary"),
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-3">{children}</div>
      <ChevronRightIcon aria-hidden="true" className="mt-1 size-5 shrink-0 text-muted-foreground" />
    </Link>
  );
}
