"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";

import { EmptyState } from "@/components/admin/empty-state";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useUrlAdmin } from "@/hooks/useUrlAdmin";
import { FILAS_POR_PAGINA } from "@/lib/admin/url";
import { cn } from "@/lib/utils";

export type ColumnaAdmin<T> = {
  id: string;
  cabecera: string;
  celda: (fila: T) => ReactNode;
  /** Numeric columns go to the right. */
  alinear?: "derecha";
  /** Shown only while the detail panel is closed (the compact layout drops it). */
  soloAncha?: boolean;
  /** Tailwind width class for the column. */
  ancho?: string;
};

type Props<T> = {
  columnas: ColumnaAdmin<T>[];
  filas: T[];
  idDe: (fila: T) => string;
  /** The detail panel is open: compact columns and the row stays highlighted. */
  conPanel: boolean;
  /** Clicking a row sets ?sel=<id>. Off for the full-width tables without panel. */
  seleccionable?: boolean;
  /** For tables without a panel: clicking a row (or Enter on it) opens this page instead of selecting it. */
  hrefFila?: (fila: T) => string;
  /** Bulk selection with checkboxes; renders the actions of the selection bar. */
  masiva?: (ids: string[], limpiar: () => void) => ReactNode;
  pager: { desde: number; hasta: number; total: number; pagina: number; paginas: number; pista?: string };
  vacio: { titulo: string; descripcion: string; accion?: ReactNode };
  /** Accessible name of the row, for screen readers. */
  etiquetaFila?: (fila: T) => string;
};

const CELDA = "h-10 px-[10px] py-0 text-[13px]";

/** True when the key press comes from a field or a dialog, where our shortcuts must not act. */
function eventoDeEscritura(e: globalThis.KeyboardEvent): boolean {
  const el = e.target as HTMLElement | null;
  if (!el) return false;
  return Boolean(el.closest("input, textarea, select, [contenteditable='true'], [role='dialog'], [role='listbox'], [role='menu']"));
}

/**
 * Table of the Office registers and queues (D-037). 40 px rows, mint selected
 * row bound to ?sel=<id>, optional bulk selection and a pager. Keyboard:
 * ↑/↓ move the selection, Enter opens the focused row, Esc closes the panel
 * and "/" focuses the search box.
 */
export function AdminTable<T>({
  columnas,
  filas,
  idDe,
  conPanel,
  seleccionable = true,
  hrefFila,
  masiva,
  pager,
  vacio,
  etiquetaFila,
}: Props<T>) {
  const { params, construir, ir } = useUrlAdmin();
  const router = useRouter();
  const sel = params.get("sel");
  const [marcadas, setMarcadas] = useState<Set<string>>(new Set());

  const visibles = columnas.filter((c) => !c.soloAncha || !conPanel);
  const ids = filas.map(idDe);
  const idsMarcadas = ids.filter((id) => marcadas.has(id));

  useEffect(() => {
    function alTeclear(e: globalThis.KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey || eventoDeEscritura(e)) return;
      if (e.key === "/") {
        const caja = document.querySelector<HTMLInputElement>("input[data-busqueda]");
        if (caja) {
          e.preventDefault();
          caja.focus();
        }
        return;
      }
      // Rows that open a page have no selection to move with the arrows.
      if (!seleccionable || hrefFila) return;
      if (e.key === "Escape" && sel) {
        ir({ sel: undefined });
      } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        if (ids.length === 0) return;
        e.preventDefault();
        const actual = sel ? ids.indexOf(sel) : -1;
        const destino = e.key === "ArrowDown" ? Math.min(ids.length - 1, actual + 1) : Math.max(0, actual - 1);
        if (ids[destino] !== sel) ir({ sel: ids[destino] });
      }
    }
    document.addEventListener("keydown", alTeclear);
    return () => document.removeEventListener("keydown", alTeclear);
  }, [ids, sel, seleccionable, hrefFila, ir]);

  useEffect(() => {
    if (sel) document.querySelector(`[data-fila-id="${CSS.escape(sel)}"]`)?.scrollIntoView({ block: "nearest" });
  }, [sel]);

  function abrir(fila: T) {
    if (hrefFila) router.push(hrefFila(fila));
    else ir({ sel: idDe(fila) });
  }

  function alTocarFila(e: MouseEvent<HTMLTableRowElement>, fila: T) {
    // A link or button inside the row does its own thing; the row must not navigate on top of it.
    if (hrefFila && (e.target as HTMLElement).closest("a, button")) return;
    abrir(fila);
  }

  function alTeclearFila(e: KeyboardEvent<HTMLTableRowElement>, fila: T) {
    if (e.target !== e.currentTarget) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      abrir(fila);
    }
  }

  function alternarTodas(activo: boolean) {
    setMarcadas(activo ? new Set(ids) : new Set());
  }

  function alternar(id: string, activo: boolean) {
    const nuevas = new Set(marcadas);
    if (activo) nuevas.add(id);
    else nuevas.delete(id);
    setMarcadas(nuevas);
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      {masiva && idsMarcadas.length > 0 && (
        <div className="flex items-center gap-2.5 border-b border-border bg-mint-soft px-3 py-2" role="status">
          <span className="text-[13px] font-bold">
            {idsMarcadas.length} {idsMarcadas.length === 1 ? "seleccionada" : "seleccionadas"}
          </span>
          {masiva(idsMarcadas, () => setMarcadas(new Set()))}
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-auto">
        {filas.length === 0 ? (
          <EmptyState titulo={vacio.titulo} descripcion={vacio.descripcion}>
            {vacio.accion}
          </EmptyState>
        ) : (
          <Table className="border-collapse">
            <TableHeader>
              <TableRow className="border-b border-border hover:bg-muted">
                {masiva && (
                  <TableHead className="sticky top-0 z-[1] h-auto w-[34px] bg-muted px-[10px] py-2">
                    <Checkbox
                      checked={idsMarcadas.length === ids.length}
                      indeterminate={idsMarcadas.length > 0 && idsMarcadas.length < ids.length}
                      onCheckedChange={(c) => alternarTodas(c === true)}
                      aria-label="Seleccionar todas"
                    />
                  </TableHead>
                )}
                {visibles.map((c, i) => (
                  <TableHead
                    key={c.id}
                    className={cn(
                      "sticky top-0 z-[1] h-auto bg-muted px-[10px] py-2 text-[10.5px] font-medium tracking-[0.07em] text-muted-foreground uppercase",
                      c.alinear === "derecha" && "text-right",
                      c.ancho,
                      i === 0 && !masiva && "max-md:left-0 max-md:z-[2]",
                    )}
                  >
                    {c.cabecera}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filas.map((fila) => {
                const id = idDe(fila);
                const elegida = seleccionable && sel === id;
                return (
                  <TableRow
                    key={id}
                    data-fila-id={id}
                    data-state={elegida ? "selected" : undefined}
                    aria-selected={seleccionable ? elegida : undefined}
                    aria-label={etiquetaFila?.(fila)}
                    tabIndex={seleccionable ? 0 : undefined}
                    onClick={seleccionable ? (e) => alTocarFila(e, fila) : undefined}
                    onKeyDown={seleccionable ? (e) => alTeclearFila(e, fila) : undefined}
                    className={cn(
                      "border-b border-border bg-background hover:bg-row-hover data-[state=selected]:bg-accent",
                      seleccionable &&
                        "cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-inset",
                    )}
                  >
                    {masiva && (
                      <TableCell
                        className={cn(CELDA, "w-[34px]", elegida && "shadow-[inset_2px_0_0_var(--primary)]")}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={marcadas.has(id)}
                          onCheckedChange={(c) => alternar(id, c === true)}
                          aria-label="Seleccionar fila"
                        />
                      </TableCell>
                    )}
                    {visibles.map((c, i) => (
                      <TableCell
                        key={c.id}
                        className={cn(
                          CELDA,
                          c.alinear === "derecha" && "text-right tabular-nums",
                          c.ancho,
                          i === 0 && !masiva && elegida && "shadow-[inset_2px_0_0_var(--primary)]",
                          i === 0 && !masiva && "max-md:sticky max-md:left-0 max-md:bg-inherit",
                        )}
                      >
                        {c.celda(fila)}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <footer className="flex items-center justify-between gap-3 border-t border-border px-[10px] py-2 text-[12px] text-muted-foreground tabular-nums">
        <span>{pager.pista ?? `Mostrar ${FILAS_POR_PAGINA} por página`}</span>
        <span className="flex items-center gap-3">
          {pager.paginas > 1 && pager.pagina > 1 && (
            <Link href={construir({ pagina: String(pager.pagina - 1) })} scroll={false} className="font-semibold text-primary hover:underline">
              ← Anterior
            </Link>
          )}
          <span>
            {pager.desde}–{pager.hasta} de {pager.total}
          </span>
          {pager.pagina < pager.paginas && (
            <Link href={construir({ pagina: String(pager.pagina + 1) })} scroll={false} className="font-semibold text-primary hover:underline">
              Siguiente →
            </Link>
          )}
        </span>
      </footer>
    </div>
  );
}
