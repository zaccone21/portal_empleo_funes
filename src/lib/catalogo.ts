import type { OfertaPublica } from "@/lib/validation/ofertas";
import { NOMBRE_RUBRO, esRubro, type Rubro } from "@/lib/validation/rubros";

/*
 * The offer catalog's search, filter and order (P05, D-029). Everything lives
 * in the URL (/ofertas?q=cocina&rubro=gastronomia&orden=antiguas), so a search
 * can be shared, reloaded and undone with the back button.
 *
 * Filtering happens in the browser over the published offers, which are few
 * for a single city. If the list grows, the same parameters can move to the
 * server (GET /api/ofertas?q=…) without changing the screen.
 */

export type OrdenOfertas = "recientes" | "antiguas";

export type FiltrosOfertas = {
  /** Free text; every word must appear somewhere in the offer. */
  q: string;
  rubro: Rubro | null;
  orden: OrdenOfertas;
};

export const FILTROS_VACIOS: FiltrosOfertas = { q: "", rubro: null, orden: "recientes" };

type ParametrosUrl = Record<string, string | string[] | undefined>;

/** Reads the filters from the page's searchParams. Unknown or repeated values fall back to the defaults. */
export function leerFiltros(parametros: ParametrosUrl): FiltrosOfertas {
  const q = typeof parametros.q === "string" ? parametros.q.trim().slice(0, 100) : "";
  const rubro = typeof parametros.rubro === "string" && esRubro(parametros.rubro) ? parametros.rubro : null;
  const orden = parametros.orden === "antiguas" ? "antiguas" : "recientes";
  return { q, rubro, orden };
}

/** True when the person is narrowing the list (the order alone does not count). */
export function hayFiltros(filtros: FiltrosOfertas): boolean {
  return filtros.q !== "" || filtros.rubro !== null;
}

/**
 * Query string for the catalog with these filters, plus an optional selected
 * offer. Default values are left out, so the plain list is just "/ofertas".
 */
export function rutaCatalogo(filtros: FiltrosOfertas, oferta?: string): string {
  const parametros = new URLSearchParams();
  if (filtros.q) parametros.set("q", filtros.q);
  if (filtros.rubro) parametros.set("rubro", filtros.rubro);
  if (filtros.orden !== "recientes") parametros.set("orden", filtros.orden);
  if (oferta) parametros.set("oferta", oferta);
  const texto = parametros.toString();
  return texto ? `/ofertas?${texto}` : "/ofertas";
}

/**
 * One sentence that says what the list shows, above the results:
 * "Hay 7 ofertas publicadas." or "Hay 2 ofertas de Gastronomía para “cocina”."
 * It also names the list for screen readers.
 */
export function describirResultados(cantidad: number, filtros: FiltrosOfertas): string {
  const base = cantidad === 1 ? "Hay 1 oferta" : `Hay ${cantidad} ofertas`;
  if (!hayFiltros(filtros)) {
    return `${base} publicada${cantidad === 1 ? "" : "s"}.`;
  }
  const rubro = filtros.rubro ? ` de ${NOMBRE_RUBRO[filtros.rubro]}` : "";
  const busqueda = filtros.q ? ` para “${filtros.q}”` : "";
  return `${base}${rubro}${busqueda}.`;
}

/**
 * Lowercase and without accents, so "cocina", "Cocina" and "COCINA" match,
 * and so does "jardineria" typed without the accent on a phone keyboard.
 */
function normalizar(texto: string): string {
  return texto.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

/**
 * The offers that pass the filters, in the chosen order:
 * - `rubro`: only that trade;
 * - `q`: every word of the search must appear in the title, description,
 *   requirements, place, hours or trade name (so "cocina centro" finds a
 *   kitchen job in the center);
 * - `orden`: by publication date, newest or oldest first.
 */
export function filtrarOfertas(ofertas: OfertaPublica[], filtros: FiltrosOfertas): OfertaPublica[] {
  const palabras = normalizar(filtros.q).split(/\s+/).filter(Boolean);

  const filtradas = ofertas.filter((oferta) => {
    if (filtros.rubro && oferta.rubro !== filtros.rubro) {
      return false;
    }
    if (palabras.length === 0) {
      return true;
    }
    const texto = normalizar(
      [oferta.titulo, oferta.descripcion, oferta.requisitos, oferta.lugar, oferta.jornada, NOMBRE_RUBRO[oferta.rubro]].join(" "),
    );
    return palabras.every((palabra) => texto.includes(palabra));
  });

  const signo = filtros.orden === "recientes" ? -1 : 1;
  return filtradas.sort((a, b) => signo * a.publicadaEl.localeCompare(b.publicadaEl));
}
