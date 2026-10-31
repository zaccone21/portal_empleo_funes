import type { ReactNode } from "react";

/**
 * Box of a register or queue table (D-042): 1 px border and rounded corners,
 * filling the height left by the header, strip and toolbar. The detail opens
 * on its own page (D-062), so the table takes the whole width.
 */
export function Split({ tabla }: { tabla: ReactNode }) {
  return (
    <section className="grid min-h-[420px] flex-1 grid-cols-1 overflow-hidden rounded-[10px] border border-border md:min-h-0">
      {tabla}
    </section>
  );
}
