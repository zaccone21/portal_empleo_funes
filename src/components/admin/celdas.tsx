import type { ReactNode } from "react";

/** A missing value: a single dash in the secondary color (D-042). */
export function Ausente() {
  return <span className="text-muted-foreground">—</span>;
}

/** Two-line cell: bold title and a small secondary line (company, ID number, age). */
export function CeldaDoble({ titulo, detalle }: { titulo: ReactNode; detalle?: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col leading-tight">
      <span className="truncate font-bold text-foreground">{titulo}</span>
      {detalle ? <small className="truncate text-[12.5px] text-muted-foreground">{detalle}</small> : null}
    </div>
  );
}

/** Full name of an applicant, or the standard text when the profile has no name yet. */
export function nombreCompleto(p: { nombre: string | null; apellido: string | null }): string | null {
  const nombre = [p.nombre, p.apellido].filter(Boolean).join(" ").trim();
  return nombre || null;
}
