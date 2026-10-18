"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";

import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useUrlAdmin } from "@/hooks/useUrlAdmin";

/** "✕" of the panel: removes ?sel (and the tab) from the URL. */
export function BotonCerrarPanel() {
  const { ir } = useUrlAdmin();
  return (
    <button
      type="button"
      aria-label="Cerrar panel"
      onClick={() => ir({ sel: undefined, tab: undefined })}
      className="inline-flex size-6 items-center justify-center rounded-md text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary"
    >
      <X className="size-4" aria-hidden="true" />
    </button>
  );
}

/**
 * Where the detail panel lives (D-042): a 500 px column next to the table from
 * 1280 px up, and a side Sheet below (min(500px, 100vw)). Closing it (✕, Esc,
 * click outside) removes ?sel from the URL.
 */
export function PanelLateral({ children }: { children: ReactNode }) {
  const { ir } = useUrlAdmin();
  const escritorio = useMediaQuery("(min-width: 1280px)");

  if (escritorio) {
    return (
      <aside aria-label="Detalle" className="flex min-h-0 min-w-0 flex-col overflow-hidden border-l border-border">
        {children}
      </aside>
    );
  }

  return (
    <Sheet open onOpenChange={(abierto) => !abierto && ir({ sel: undefined, tab: undefined })}>
      <SheetContent side="right" showCloseButton={false} className="w-[min(500px,100vw)] gap-0 p-0 data-[side=right]:sm:max-w-none">
        <SheetTitle className="sr-only">Detalle</SheetTitle>
        {children}
      </SheetContent>
    </Sheet>
  );
}
