"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

/**
 * Lets a client component change the URL state of an Office screen (filters,
 * search, selection). `construir` returns the URL for some changes; `ir` goes
 * there without scrolling. A change other than `sel`/`pagina`/`tab` also resets the
 * page and closes the panel, because the old selection may not be in the new list.
 */
export function useUrlAdmin() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const construir = useCallback(
    (cambios: Record<string, string | undefined>) => {
      const nuevo = new URLSearchParams(params.toString());
      const soloSeleccion = Object.keys(cambios).every((clave) => clave === "sel" || clave === "pagina" || clave === "tab");
      if (!soloSeleccion) {
        nuevo.delete("pagina");
        nuevo.delete("sel");
        nuevo.delete("tab");
      } else if ("sel" in cambios && !("tab" in cambios)) {
        nuevo.delete("tab");
      }
      for (const [clave, valor] of Object.entries(cambios)) {
        if (valor === undefined || valor === "") nuevo.delete(clave);
        else nuevo.set(clave, valor);
      }
      const query = nuevo.toString();
      return query ? `${pathname}?${query}` : pathname;
    },
    [params, pathname],
  );

  const ir = useCallback(
    (cambios: Record<string, string | undefined>) => router.replace(construir(cambios), { scroll: false }),
    [construir, router],
  );

  return { params, pathname, construir, ir };
}
