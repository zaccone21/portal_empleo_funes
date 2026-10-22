"use client";

import Link from "next/link";
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";

import { EmptyState } from "@/components/admin/empty-state";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useUrlAdmin } from "@/hooks/useUrlAdmin";
import type { OrdenTabla } from "@/lib/admin/orden";
import { FILAS_POR_PAGINA } from "@/lib/admin/url";
import { cn } from "@/lib/utils";

export type ColumnaAdmin<T> = {
  id: string;
  cabecera: string;
  celda: (fila: T) => ReactNode;
  /** Numeric columns go to the right. */
  alinear?: "derecha";
  /** Tailwind width class for the column. */
  ancho?: string;
  /** The header sorts the whole list by this column (D-063); its id must be a key of the screen's `ClavesOrden`. */
  ordenable?: boolean;
};

type Props<T> = {
  columnas: ColumnaAdmin<T>[];
  filas: T[];
  idDe: (fila: T) => string;
  /** Clicking a row (or Enter on it) opens this page (D-062). Without it the row only holds its own buttons. */
  hrefFila?: (fila: T) => string;
  /** Bulk selection with checkboxes; renders the actions of the selection bar. */
  masiva?: (ids: string[], limpiar: () => void) => ReactNode;
  pager: { desde: number; hasta: number; total: number; pagina: number; paginas: number; pista?: string };
  vacio: { titulo: string; descripcion: string; accion?: ReactNode };
  /** Accessible name of the row, for screen readers. */
  etiquetaFila?: (fila: T) => string;
  /** The order the rows are in (from ?orden= or the screen's default), to mark its column. */
  orden?: OrdenTabla;
};

// 56 px rows (D-063): the whole row opens the record, so it has to be an easy target.
const CELDA = "h-14 px-3 py-2 text-[14px]";
const ENLACE_PAGINA =
  "inline-flex items-center gap-0.5 rounded-md px-1.5 py-1 font-semibold text-primary hover:bg-accent focus-visible:outline-2 focus-visible:outline-primary";

/** True when the key press comes from a field or a dialog, where our shortcuts must not act. */
function eventoDeEscritura(e: globalThis.KeyboardEvent): boolean {
  const el = e.target as HTMLElement | null;
  if (!el) return false;
  return Boolean(el.closest("input, textarea, select, [contenteditable='true'], [role='dialog'], [role='listbox'], [role='menu']"));
}

/**
 * Table of the Office registers and queues (D-042). 56 px rows that open their
 * record's page (D-062, D-063), headers that sort the whole list by their
 * column (?orden=), optional bulk selection and a pager. Keyboard: Tab moves
 * between rows, Enter opens the focused one and "/" focuses the search box.
 */
export function AdminTable<T>({ columnas, filas, idDe, hrefFila, masiva, pager, vacio, etiquetaFila, orden }: Props<T>) {
  const { construir } = useUrlAdmin();
  const router = useRouter();
  const [marcadas, setMarcadas] = useState<Set<string>>(new Set());

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
      }
    }
    document.addEventListener("keydown", alTeclear);
    return () => document.removeEventListener("keydown", alTeclear);
  }, []);

  function alTocarFila(e: MouseEvent<HTMLTableRowElement>, href: string) {
    // A link or button inside the row does its own thing; the row must not navigate on top of it.
    if ((e.target as HTMLElement).closest("a, button")) return;
    router.push(href);
  }

  function alTeclearFila(e: KeyboardEvent<HTMLTableRowElement>, href: string) {
    if (e.target !== e.currentTarget) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      router.push(href);
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
                {columnas.map((c, i) => {
                  const activa = orden?.columna === c.id;
                  return (
                    <TableHead
                      key={c.id}
                      aria-sort={c.ordenable ? (activa ? (orden.direccion === "asc" ? "ascending" : "descending") : "none") : undefined}
                      className={cn(
                        "sticky top-0 z-[1] h-auto bg-muted px-3 py-2 text-[11px] font-medium tracking-[0.07em] text-muted-foreground uppercase",
                        c.alinear === "derecha" && "text-right",
                        c.ancho,
                        i === 0 && !masiva && "max-md:left-0 max-md:z-[2]",
                      )}
                    >
                      {c.ordenable ? (
                        <Link
                          href={construir({ orden: c.id, dir: activa && orden.direccion === "asc" ? "desc" : "asc" })}
                          scroll={false}
                          className={cn(
                            "-mx-1.5 inline-flex h-8 items-center gap-1 rounded-md px-1.5 uppercase outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary",
                            activa && "font-bold text-foreground",
                          )}
                        >
                          {c.cabecera}
                          {activa ? (
                            orden.direccion === "asc" ? (
                              <ArrowUpIcon aria-hidden="true" className="size-3.5" />
                            ) : (
                              <ArrowDownIcon aria-hidden="true" className="size-3.5" />
                            )
                          ) : (
                            <ArrowUpDownIcon aria-hidden="true" className="size-3.5 opacity-50" />
                          )}
                        </Link>
                      ) : (
                        c.cabecera
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filas.map((fila) => {
                const id = idDe(fila);
                const href = hrefFila?.(fila);
                return (
                  <TableRow
                    key={id}
                    data-fila-id={id}
                    aria-label={etiquetaFila?.(fila)}
                    tabIndex={href ? 0 : undefined}
                    onClick={href ? (e) => alTocarFila(e, href) : undefined}
                    onKeyDown={href ? (e) => alTeclearFila(e, href) : undefined}
                    className={cn(
                      "border-b border-border bg-background hover:bg-row-hover",
                      href &&
                        "cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-inset",
                    )}
                  >
                    {masiva && (
                      <TableCell className={cn(CELDA, "w-[34px]")} onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={marcadas.has(id)}
                          onCheckedChange={(c) => alternar(id, c === true)}
                          aria-label="Seleccionar fila"
                        />
                      </TableCell>
                    )}
                    {columnas.map((c, i) => (
                      <TableCell
                        key={c.id}
                        className={cn(
                          CELDA,
                          c.alinear === "derecha" && "text-right tabular-nums",
                          c.ancho,
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
            <Link href={construir({ pagina: String(pager.pagina - 1) })} scroll={false} className={ENLACE_PAGINA}>
              <ChevronLeftIcon aria-hidden="true" className="size-3.5" />
              Anterior
            </Link>
          )}
          <span>
            {pager.desde}–{pager.hasta} de {pager.total}
          </span>
          {pager.pagina < pager.paginas && (
            <Link href={construir({ pagina: String(pager.pagina + 1) })} scroll={false} className={ENLACE_PAGINA}>
              Siguiente
              <ChevronRightIcon aria-hidden="true" className="size-3.5" />
            </Link>
          )}
        </span>
      </footer>
    </div>
  );
}
