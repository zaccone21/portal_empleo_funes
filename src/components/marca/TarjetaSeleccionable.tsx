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
 * "leaf" shape. Fills full height uniformly so footers align cleanly (D-066).
 */
export function TarjetaSeleccionable({ href, seleccionada, soloEnEscritorio, children }: Props) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={seleccionada && !soloEnEscritorio ? "true" : undefined}
      className={cn(
        "group flex h-full min-h-[12.5rem] w-full items-stretch justify-between gap-3 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card p-4.5 ring-1 ring-foreground/10 outline-none transition-all sm:p-5",
        "hover:ring-foreground/20 hover:shadow-xs focus-visible:ring-3 focus-visible:ring-ring/50",
        seleccionada &&
          (soloEnEscritorio ? "lg:bg-secondary lg:ring-2 lg:ring-primary lg:ring-inset" : "bg-secondary ring-2 ring-primary ring-inset"),
      )}
    >
      <div className="flex h-full min-w-0 flex-1 flex-col justify-between gap-3">{children}</div>
      <div className="flex shrink-0 items-center justify-center self-center">
        <ChevronRightIcon
          aria-hidden="true"
          className="size-5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
        />
      </div>
    </Link>
  );
}
