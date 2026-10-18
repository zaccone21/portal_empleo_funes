import { SearchX } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  titulo: string;
  descripcion: string;
  /** Next step for the person (a link or a button). */
  children?: ReactNode;
};

/** Sober empty state for a table or queue: gray icon, message and next step (D-037). */
export function EmptyState({ titulo, descripcion, children }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 px-6 py-14 text-center">
      <SearchX className="mb-2 size-8 text-muted-foreground/60" aria-hidden="true" />
      <h3 className="text-[14px] font-bold text-foreground">{titulo}</h3>
      <p className="max-w-sm text-[13px] text-muted-foreground">{descripcion}</p>
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}
