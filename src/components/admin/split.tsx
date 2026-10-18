import type { ReactNode } from "react";

/**
 * Split container (D-042): the table on the left and the detail panel on the
 * right (500 px) with a 1 px border. Without a panel the table takes it all.
 * It fills the height left by the header, strip and toolbar.
 */
export function Split({ tabla, panel }: { tabla: ReactNode; panel?: ReactNode }) {
  return (
    <section
      className={
        panel
          ? "grid min-h-[420px] flex-1 grid-cols-1 overflow-hidden rounded-[10px] border border-border md:min-h-0 xl:grid-cols-[minmax(0,1fr)_500px]"
          : "grid min-h-[420px] flex-1 grid-cols-1 overflow-hidden rounded-[10px] border border-border md:min-h-0"
      }
    >
      {tabla}
      {panel}
    </section>
  );
}
