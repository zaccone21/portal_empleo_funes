import type { ReactNode } from "react";

import { Separator } from "@/components/ui/separator";

type Props = {
  titulo: string;
  descripcion?: string;
  children: ReactNode;
  /** Links to the other screens of the flow (register, recover, go back). */
  pie?: ReactNode;
};

/**
 * Content of the white tile on every access screen (P02, P08, P13). The title
 * is the page's only h1, so screen readers announce where the user is. It
 * keeps one primary action per screen (RNF3): the form in the middle and the
 * secondary links below a separator. Text is left-aligned, like the form.
 */
export function TarjetaAcceso({ titulo, descripcion, children, pie }: Props) {
  return (
    <div className="flex flex-col gap-7">
      <header className="flex flex-col gap-2">
        <h1 className="text-[1.75rem] leading-tight font-semibold tracking-[-0.02em]">{titulo}</h1>
        {descripcion && <p className="text-base text-muted-foreground">{descripcion}</p>}
      </header>
      {children}
      {pie && (
        <>
          <Separator />
          {pie}
        </>
      )}
    </div>
  );
}
