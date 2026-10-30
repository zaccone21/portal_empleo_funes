import type { ReactNode } from "react";

type Props = {
  titulo: string;
  descripcion?: string;
  children: ReactNode;
  /** Links to the other screens of the flow (register, recover, go back). */
  pie?: ReactNode;
};

/**
 * Content of the card on every access screen (P02, P08, P13). The title
 * is the page's only h1, so screen readers announce where the user is.
 * Designed with a compact vertical profile to avoid page scrolling.
 */
export function TarjetaAcceso({ titulo, descripcion, children, pie }: Props) {
  return (
    <div className="flex flex-col gap-3.5 sm:gap-4">
      <header className="flex flex-col gap-0.5">
        <h1 className="text-xl sm:text-[1.375rem] font-bold tracking-tight text-foreground">
          {titulo}
        </h1>
        {descripcion && (
          <p className="text-xs sm:text-[13px] text-muted-foreground leading-snug">
            {descripcion}
          </p>
        )}
      </header>
      {children}
      {pie && (
        <div className="border-t border-border/70 pt-2.5">
          {pie}
        </div>
      )}
    </div>
  );
}
