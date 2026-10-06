import { NOMBRE_RUBRO, RUBROS, type Rubro } from "@/lib/validation/rubros";

/*
 * The Office's applicant search (P16, RF1.5.7). Like the offer catalog, the
 * whole filter lives in the URL (/admin/postulantes?q=perez&rubro=limpieza),
 * so a search can be shared, reloaded and undone with the back button.
 */

export type FiltrosPostulantes = {
  /** Free text: name, surname or DNI. */
  q: string;
  /** Trades the person chose. A person matches if they have any of them. */
  rubros: Rubro[];
};

type ParametrosUrl = Record<string, string | string[] | undefined>;

const RUTA = "/admin/postulantes";

/**
 * Reads the filters from the page's searchParams. Unknown or repeated trades
 * are dropped, and the valid ones come back in the portal's own order, so the
 * same selection always produces the same URL.
 */
export function leerFiltrosPostulantes(parametros: ParametrosUrl): FiltrosPostulantes {
  const q = typeof parametros.q === "string" ? parametros.q.trim().slice(0, 100) : "";
  const pedidos = parametros.rubro === undefined ? [] : [parametros.rubro].flat();
  return { q, rubros: RUBROS.filter((rubro) => pedidos.includes(rubro)) };
}

/** True when something is narrowing the list. */
export function hayFiltrosPostulantes(filtros: FiltrosPostulantes): boolean {
  return filtros.q !== "" || filtros.rubros.length > 0;
}

/** URL of the search with these filters. Empty filters are left out, so the plain list is just "/admin/postulantes". */
export function rutaPostulantes(filtros: FiltrosPostulantes): string {
  const parametros = new URLSearchParams();
  if (filtros.q) parametros.set("q", filtros.q);
  for (const rubro of filtros.rubros) parametros.append("rubro", rubro);
  const texto = parametros.toString();
  return texto ? `${RUTA}?${texto}` : RUTA;
}

/** The same filters with `rubro` added if it was off, or removed if it was on (a chip toggles it). */
export function alternarRubro(filtros: FiltrosPostulantes, rubro: Rubro): FiltrosPostulantes {
  const rubros = filtros.rubros.includes(rubro)
    ? filtros.rubros.filter((actual) => actual !== rubro)
    : RUBROS.filter((actual) => actual === rubro || filtros.rubros.includes(actual));
  return { ...filtros, rubros };
}

const listaConO = new Intl.ListFormat("es-AR", { style: "long", type: "disjunction" });

/**
 * One sentence that says what the list shows, above the results:
 * "Hay 12 postulantes registrados." or
 * "Hay 3 postulantes de Gastronomía o Limpieza para “perez”."
 * It also names the list for screen readers.
 */
export function describirPostulantes(cantidad: number, filtros: FiltrosPostulantes): string {
  const base = cantidad === 1 ? "Hay 1 postulante" : `Hay ${cantidad} postulantes`;
  if (!hayFiltrosPostulantes(filtros)) {
    return `${base} registrado${cantidad === 1 ? "" : "s"}.`;
  }
  const rubros = filtros.rubros.length > 0 ? ` de ${listaConO.format(filtros.rubros.map((rubro) => NOMBRE_RUBRO[rubro]))}` : "";
  const busqueda = filtros.q ? ` para “${filtros.q}”` : "";
  return `${base}${rubros}${busqueda}.`;
}
