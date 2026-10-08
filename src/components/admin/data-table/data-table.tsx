"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export type Column<T> = {
  id: string;
  header: string;
  sortable?: boolean;
  cell: (row: T) => React.ReactNode;
};

type Props<T> = {
  data: T[];
  columns: Column<T>[];
  idAccessor: (row: T) => string;
  totalElements?: number;
  pageSize?: number;
  currentPage?: number;
  accionesMasivas?: (seleccionados: string[], limpiar: () => void) => React.ReactNode;
};

/**
 * Tabla declarativa guiada por servidor. Los filtros, página y orden provienen
 * de la URL. Mantiene estado de selección múltiple localmente.
 */
export function DataTable<T>({
  data,
  columns,
  idAccessor,
  totalElements = 0,
  pageSize = 25,
  currentPage = 1,
  accionesMasivas,
}: Props<T>) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());

  const sortCol = searchParams.get("orden") || "";
  const sortDir = searchParams.get("dir") || "asc";

  const totalPages = Math.ceil(totalElements / pageSize);

  const toggleAll = (checked: boolean) => {
    if (checked) {
      setSeleccionados(new Set(data.map(idAccessor)));
    } else {
      setSeleccionados(new Set());
    }
  };

  const toggleRow = (id: string, checked: boolean) => {
    const next = new Set(seleccionados);
    if (checked) next.add(id);
    else next.delete(id);
    setSeleccionados(next);
  };

  const buildUrl = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v === undefined) params.delete(k);
      else params.set(k, v);
    });
    return `${pathname}?${params.toString()}`;
  };

  return (
    <div className="space-y-4">
      {accionesMasivas && seleccionados.size > 0 && (
        <div className="flex items-center justify-between bg-primary/10 border border-primary/20 px-4 py-2 rounded-md">
          <span className="text-sm font-medium">{seleccionados.size} seleccionados</span>
          <div className="flex items-center gap-2">
            {accionesMasivas(Array.from(seleccionados), () => setSeleccionados(new Set()))}
          </div>
        </div>
      )}

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {accionesMasivas && (
                <TableHead className="w-12 text-center">
                  <Checkbox
                    checked={data.length > 0 && seleccionados.size === data.length}
                    onCheckedChange={(c) => toggleAll(c === true)}
                    aria-label="Seleccionar todos"
                  />
                </TableHead>
              )}
              {columns.map((col) => {
                if (!col.sortable) {
                  return <TableHead key={col.id}>{col.header}</TableHead>;
                }
                const isSorted = sortCol === col.id;
                const isAsc = sortDir === "asc";
                const nextDir = isSorted && isAsc ? "desc" : "asc";
                return (
                  <TableHead key={col.id}>
                    <Link
                      href={buildUrl({ orden: col.id, dir: nextDir })}
                      className="inline-flex items-center gap-1 hover:text-primary transition-colors"
                    >
                      {col.header}
                      {isSorted ? (
                        isAsc ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />
                      ) : (
                        <ChevronsUpDown className="size-3 opacity-30" />
                      )}
                    </Link>
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (accionesMasivas ? 1 : 0)} className="h-24 text-center">
                  No hay resultados.
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => {
                const id = idAccessor(row);
                return (
                  <TableRow key={id} data-state={seleccionados.has(id) ? "selected" : undefined}>
                    {accionesMasivas && (
                      <TableCell className="text-center">
                        <Checkbox
                          checked={seleccionados.has(id)}
                          onCheckedChange={(c) => toggleRow(id, c === true)}
                          aria-label="Seleccionar fila"
                        />
                      </TableCell>
                    )}
                    {columns.map((col) => (
                      <TableCell key={col.id}>{col.cell(row)}</TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {totalElements > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>Mostrar</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(v) => {
                if (!v) return;
                const url = buildUrl({ limite: v, pagina: "1" });
                router.push(url);
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={pageSize.toString()} />
              </SelectTrigger>
              <SelectContent>
                {[25, 50, 100].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span>por página</span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">
              {Math.min((currentPage - 1) * pageSize + 1, totalElements)}-{Math.min(currentPage * pageSize, totalElements)} de {totalElements}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                render={currentPage > 1 ? <Link href={buildUrl({ pagina: (currentPage - 1).toString() })} /> : <button />}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                render={currentPage < totalPages ? <Link href={buildUrl({ pagina: (currentPage + 1).toString() })} /> : <button />}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
