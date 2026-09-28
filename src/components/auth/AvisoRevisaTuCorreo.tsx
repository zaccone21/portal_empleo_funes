import type { ReactNode } from "react";
import { MailCheckIcon } from "lucide-react";

/**
 * Message that replaces a form after it sends an email (registration and
 * password recovery). It is fixed on the page and not a toast on purpose: it
 * is the only instruction left on the screen and must not disappear before
 * the user reads it (docs/DESIGN.md §5). role="status" makes screen readers
 * announce it when it appears.
 */
export function AvisoRevisaTuCorreo({ children }: { children: ReactNode }) {
  return (
    <div role="status" className="flex flex-col gap-3">
      <MailCheckIcon aria-hidden="true" className="size-10 text-primary" />
      <h2 className="text-xl font-semibold">Revisá tu correo</h2>
      <p className="text-base">{children}</p>
      <p className="text-base text-muted-foreground">
        Si no lo ves, buscalo en la carpeta de correo no deseado (spam).
      </p>
    </div>
  );
}
