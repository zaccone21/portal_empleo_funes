import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
  href: string;
  children: string;
  /** "primario" for the action a queue is for (Evaluar, Resolver); the rest stay quiet. */
  variante?: "primario" | "secundario";
  /** False for links that only change ?sel= and must keep the scroll of the table. */
  scroll?: boolean;
  className?: string;
};

/**
 * Link with the shape of a small Office button (D-042) for the action column of
 * tables and lists: "Resolver", "Evaluar", "Ver". It replaces the text links
 * that ended in "→" (DESIGN.md §0). It stays a link, so screen readers announce
 * it as one (DESIGN.md §5), and the hover tints the button without changing
 * the text color.
 */
export function EnlaceAccion({ href, children, variante = "secundario", scroll, className }: Props) {
  return (
    <Link
      href={href}
      scroll={scroll}
      className={cn(
        "inline-flex h-7 shrink-0 items-center gap-0.5 rounded-lg border pr-1.5 pl-2.5 text-[12.5px] font-semibold whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
        variante === "primario"
          ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
          : "border-input bg-background text-primary hover:border-primary/40 hover:bg-accent",
        className,
      )}
    >
      {children}
      <ChevronRightIcon aria-hidden="true" className="size-3.5" />
    </Link>
  );
}
