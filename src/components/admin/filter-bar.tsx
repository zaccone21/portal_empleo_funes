"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Props = {
  placeholderBuscar?: string;
  filtros?: React.ReactNode;
};

/**
 * Barra de filtros superior para las colas y registros.
 * Maneja la búsqueda por texto con debounce, actualizando `q` en la URL.
 * Permite inyectar filtros adicionales a la derecha.
 */
export function FilterBar({ placeholderBuscar = "Buscar...", filtros }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const queryParam = searchParams.get("q") || "";
  const [searchTerm, setSearchTerm] = useState(queryParam);
  const [prevQuery, setPrevQuery] = useState(queryParam);

  if (queryParam !== prevQuery) {
    setPrevQuery(queryParam);
    setSearchTerm(queryParam);
  }

  // Debounce manual simple
  useEffect(() => {
    if (searchTerm === queryParam) return;

    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchTerm.trim()) {
        params.set("q", searchTerm.trim());
      } else {
        params.delete("q");
      }
      params.delete("pagina"); // resetear página al buscar
      router.push(`${pathname}?${params.toString()}`);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchTerm, pathname, router, searchParams, queryParam]);

  const hasFilters = Array.from(searchParams.keys()).some(k => !["orden", "dir", "pagina", "limite"].includes(k));

  const limpiarFiltros = useCallback(() => {
    // Conserva paginación/orden pero quita todos los filtros de negocio
    const params = new URLSearchParams(searchParams.toString());
    const keys = Array.from(params.keys());
    for (const key of keys) {
      if (!["orden", "dir", "limite"].includes(key)) {
        params.delete(key);
      }
    }
    params.delete("pagina"); // vuelve a la 1
    router.push(`${pathname}?${params.toString()}`);
  }, [pathname, router, searchParams]);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={placeholderBuscar}
          className="pl-9 bg-background"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
        {filtros}
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={limpiarFiltros} className="h-9 px-2 lg:px-3">
            Limpiar
            <X className="ml-2 size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
