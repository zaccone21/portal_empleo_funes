import { useEffect, useState } from "react";

import { getJson, mensajeDeError } from "@/lib/http";
import type { FiltrosOfertas } from "@/lib/catalogo";
import {
  listaOfertasSchema,
  respuestaPaginadaOfertasSchema,
  type OfertaPublica,
} from "@/lib/validation/ofertas";

export type OpcionesOfertasPublicadas = {
  todas?: boolean;
};

/**
 * Loads the published job offers (P05) from GET /api/ofertas. The endpoint is
 * public: anyone can see the list (RF1.4.1, D-024).
 *
 * Supports real server-side pagination and filtering:
 * - If `filtros` is provided (and not `todas: true`), passes pagination and filter query params.
 * - If `opciones.todas === true` or no filtros provided, queries all offers (`?todas=true`).
 *
 * Uses `AbortController` to cleanly cancel in-flight requests when filters or search
 * terms change rapidly (debounced typing).
 */
export function useOfertasPublicadas(
  filtros?: FiltrosOfertas,
  pagina?: number,
  porPagina?: number,
  opciones?: OpcionesOfertasPublicadas,
) {
  const [ofertas, setOfertas] = useState<OfertaPublica[] | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [paginaActual, setPaginaActual] = useState<number>(1);
  const [porPaginaActual, setPorPaginaActual] = useState<number>(12);
  const [totalPaginas, setTotalPaginas] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);

  const todas = opciones?.todas ?? !filtros;
  const pag = pagina ?? filtros?.pagina ?? 1;
  const limite = porPagina ?? 12;

  const currentKey = `${todas ? "todas" : `${filtros?.q || ""}_${filtros?.rubro || ""}_${filtros?.modalidad || ""}_${filtros?.tipoJornada || ""}_${filtros?.pago || ""}_${filtros?.orden || ""}_${pag}_${limite}`}_${intento}`;
  const [queryKey, setQueryKey] = useState<string>("");

  useEffect(() => {
    let vigente = true;
    const controller = new AbortController();

    async function cargar() {
      try {
        if (todas) {
          const lista = await getJson("/api/ofertas?todas=true", listaOfertasSchema, {
            signal: controller.signal,
          });
          if (vigente) {
            setOfertas(lista);
            setTotal(lista.length);
            setPaginaActual(1);
            setPorPaginaActual(lista.length);
            setTotalPaginas(1);
            setError(null);
            setQueryKey(currentKey);
          }
        } else {
          const params = new URLSearchParams();
          params.set("pagina", String(pag));
          params.set("porPagina", String(limite));

          if (filtros?.q) params.set("q", filtros.q);
          if (filtros?.rubro) params.set("rubro", filtros.rubro);
          if (filtros?.modalidad) params.set("modalidad", filtros.modalidad);
          if (filtros?.tipoJornada) params.set("tipoJornada", filtros.tipoJornada);
          if (filtros?.pago && filtros.pago !== "todos") params.set("pago", filtros.pago);
          if (filtros?.orden && filtros.orden !== "recientes") params.set("orden", filtros.orden);

          const respuesta = await getJson(
            `/api/ofertas?${params.toString()}`,
            respuestaPaginadaOfertasSchema,
            { signal: controller.signal },
          );
          if (vigente) {
            setOfertas(respuesta.items);
            setTotal(respuesta.total);
            setPaginaActual(respuesta.pagina);
            setPorPaginaActual(respuesta.porPagina);
            setTotalPaginas(respuesta.totalPaginas);
            setError(null);
            setQueryKey(currentKey);
          }
        }
      } catch (e: unknown) {
        if (controller.signal.aborted) {
          return;
        }
        if (vigente) {
          setError(mensajeDeError(e));
          setQueryKey(currentKey);
        }
      }
    }

    cargar();

    return () => {
      vigente = false;
      controller.abort();
    };
  }, [
    todas,
    pag,
    limite,
    filtros?.q,
    filtros?.rubro,
    filtros?.modalidad,
    filtros?.tipoJornada,
    filtros?.pago,
    filtros?.orden,
    currentKey,
  ]);

  function recargar() {
    setIntento((n) => n + 1);
  }

  /** Marks an offer as applied to, right after applying, without loading the list again. */
  function marcarPostulada(ofertaId: string) {
    setOfertas(
      (lista) => lista?.map((oferta) => (oferta.id === ofertaId ? { ...oferta, yaTePostulaste: true } : oferta)) ?? null,
    );
  }

  const cargandoInicial = ofertas === null && error === null;
  const actualizando = currentKey !== queryKey;
  const loading = cargandoInicial || actualizando;

  return {
    ofertas,
    total,
    pagina: paginaActual,
    porPagina: porPaginaActual,
    totalPaginas,
    loading,
    cargandoInicial,
    actualizando,
    error,
    recargar,
    marcarPostulada,
  };
}
