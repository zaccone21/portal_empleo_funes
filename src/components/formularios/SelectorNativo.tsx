import type { ComponentProps } from "react";
import { ChevronDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * The browser's own <select>, dressed like the portal's inputs (44px, 16px
 * text, same border and focus ring). Used instead of the shadcn Select for
 * short lists (sorting the catalog, an application's status) because on cheap
 * phones it opens the phone's own picker, which people already know and which
 * never fails to fit the screen (docs/DESIGN.md §5). Always pair it with a
 * visible <label>.
 */
export function SelectorNativo({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        className={cn(
          "h-11 w-full appearance-none rounded-md border border-input bg-background pr-10 pl-3 text-base shadow-xs outline-none",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 aria-invalid:border-destructive",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDownIcon
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  );
}
