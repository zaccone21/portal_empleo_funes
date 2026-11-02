import type { OfertaPublica } from "@/lib/validation/ofertas";
import { NOMBRE_RUBRO, esRubro, type Rubro } from "@/lib/validation/rubros";

/*
 * The offer catalog's search, filters (category/rubro, pay, neighborhood/barrio,
 * schedule/horario) and order (P05, D-029). Everything lives in the URL
 * (/ofertas?q=...&rubro=...&pago=...&barrio=...&horario=...&orden=...), so a
 * search can be shared, reloaded and undone with the back button.
 */

export type OrdenOfertas = "recientes" | "antiguas";
export type FiltroPagoOferta = "todos" | "con_sueldo" | "a_convenir";

export type FiltrosOfertas = {
  /** Free text; every word must appear somewhere in the offer. */
  q: string;
  /** Category / trade (`Rubro | null`). */
  rubro: Rubro | null;
  /** Salary filter: all, with specified pay, or "A convenir" / unspecified. */
  pago?: FiltroPagoOferta;
  /** Neighborhood / area (`lugar` match). Empty string means all. */
  barrio?: string;
  /** Schedule / working hours (`jornada` match). Empty string means all. */
  horario?: string;
  /** Sort order: newest (`recientes`) or oldest (`antiguas`) first. */
  orden: OrdenOfertas;
};

export const FILTROS_VACIOS: Required<FiltrosOfertas> = {
  q: "",
  rubro: null,
  pago: "todos",
  barrio: "",
  horario: "",
  orden: "recientes",
};

type ParametrosUrl = Record<string, string | string[] | undefined>;

/** Reads the filters from the page's searchParams. Unknown or repeated values fall back to the defaults. */
export function leerFiltros(parametros: ParametrosUrl): Required<FiltrosOfertas> {
  const q = typeof parametros.q === "string" ? parametros.q.trim().slice(0, 100) : "";
  const rubro = typeof parametros.rubro === "string" && esRubro(parametros.rubro) ? parametros.rubro : null;
  const pago: FiltroPagoOferta =
    parametros.pago === "con_sueldo" || parametros.pago === "a_convenir"
      ? parametros.pago
      : "todos";
  const barrio = typeof parametros.barrio === "string" ? parametros.barrio.trim().slice(0, 80) : "";
  const horario = typeof parametros.horario === "string" ? parametros.horario.trim().slice(0, 80) : "";
  const orden = parametros.orden === "antiguas" ? "antiguas" : "recientes";
  return { q, rubro, pago, barrio, horario, orden };
}

/** True when the person is narrowing the list (the order alone does not count). */
export function hayFiltros(filtros: FiltrosOfertas): boolean {
  return (
    filtros.q !== "" ||
    filtros.rubro !== null ||
    (filtros.pago !== undefined && filtros.pago !== "todos") ||
    Boolean(filtros.barrio) ||
    Boolean(filtros.horario)
  );
}

/**
 * Query string for the catalog with these filters, plus an optional selected
 * offer. Default values are left out, so the plain list is just "/ofertas".
 */
export function rutaCatalogo(filtros: FiltrosOfertas, oferta?: string): string {
  const parametros = new URLSearchParams();
  if (filtros.q) parametros.set("q", filtros.q);
  if (filtros.rubro) parametros.set("rubro", filtros.rubro);
  if (filtros.pago && filtros.pago !== "todos") parametros.set("pago", filtros.pago);
  if (filtros.barrio) parametros.set("barrio", filtros.barrio);
  if (filtros.horario) parametros.set("horario", filtros.horario);
  if (filtros.orden !== "recientes") parametros.set("orden", filtros.orden);
  if (oferta) parametros.set("oferta", oferta);
  const texto = parametros.toString();
  return texto ? `/ofertas?${texto}` : "/ofertas";
}

/**
 * Lowercase and without accents, so "cocina", "Cocina" and "COCINA" match,
 * and so does "jardineria" typed without the accent on a phone keyboard.
 */
function normalizar(texto: string): string {
  return texto.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

function tieneSueldoInformado(sueldo: string | null): boolean {
  if (!sueldo) return false;
  const limpio = normalizar(sueldo).trim();
  if (!limpio) return false;
  return !limpio.includes("a convenir") && !limpio.includes("convenir");
}

function coincideHorario(jornadaOferta: string, filtroHorario: string): boolean {
  if (!filtroHorario) return true;
  const j = normalizar(jornadaOferta);
  const f = normalizar(filtroHorario);
  if (f === "manana") return j.includes("manana") || j.includes("7") || j.includes("8") || j.includes("9");
  if (f === "tarde") return j.includes("tarde") || j.includes("13") || j.includes("14") || j.includes("15") || j.includes("16");
  if (f === "completo") return j.includes("complet") || j.includes("full") || j.includes("lunes a viernes") || j.includes("corrido");
  if (f === "part_time") return j.includes("part") || j.includes("medio") || j.includes("4 hs") || j.includes("4 horas") || j.includes("6 hs");
  return j.includes(f);
}

/**
 * Extracts distinct neighborhood/location labels from the published offers
 * so the Barrio selector always includes real locations alongside common Funes zones.
 */
export function extraerBarriosDisponibles(ofertas: OfertaPublica[]): string[] {
  const fijos = ["Centro", "Zona Norte", "Zona Sur", "Zona Oeste", "Ruta 9", "Parque Industrial"];
  const mapa = new Map<string, string>();
  for (const b of fijos) {
    mapa.set(normalizar(b), b);
  }
  for (const o of ofertas) {
    const lugar = o.lugar.trim();
    if (lugar && lugar.length <= 45) {
      const clave = normalizar(lugar);
      if (!mapa.has(clave)) {
        mapa.set(clave, lugar);
      }
    }
  }
  return Array.from(mapa.values());
}

/**
 * One sentence that says what the list shows, above the results.
 */
export function describirResultados(cantidad: number, filtros: FiltrosOfertas): string {
  const base = cantidad === 1 ? "Hay 1 oferta" : `Hay ${cantidad} ofertas`;
  if (!hayFiltros(filtros)) {
    return `${base} publicada${cantidad === 1 ? "" : "s"}.`;
  }
  const partes: string[] = [];
  if (filtros.rubro) partes.push(`de ${NOMBRE_RUBRO[filtros.rubro]}`);
  if (filtros.barrio) partes.push(`en ${filtros.barrio}`);
  if (filtros.pago === "con_sueldo") partes.push("con sueldo informado");
  if (filtros.pago === "a_convenir") partes.push("con sueldo a convenir");
  if (filtros.q) partes.push(`para “${filtros.q}”`);
  return `${base} ${partes.join(" ")}.`.replace(/\s+\./, ".");
}

/**
 * The offers that pass all active filters, in the chosen order (`recientes` or `antiguas`).
 */
export function filtrarOfertas(ofertas: OfertaPublica[], filtros: FiltrosOfertas): OfertaPublica[] {
  const palabras = normalizar(filtros.q).split(/\s+/).filter(Boolean);
  const barrioNorm = normalizar(filtros.barrio ?? "");
  const horarioFiltro = filtros.horario ?? "";

  const filtradas = ofertas.filter((oferta) => {
    if (filtros.rubro && !oferta.rubros.includes(filtros.rubro)) {
      return false;
    }
    if (filtros.pago === "con_sueldo" && !tieneSueldoInformado(oferta.sueldo)) {
      return false;
    }
    if (filtros.pago === "a_convenir" && tieneSueldoInformado(oferta.sueldo)) {
      return false;
    }
    if (barrioNorm && !normalizar(oferta.lugar).includes(barrioNorm)) {
      return false;
    }
    if (horarioFiltro && !coincideHorario(oferta.jornada, horarioFiltro)) {
      return false;
    }
    if (palabras.length === 0) {
      return true;
    }
    const texto = normalizar(
      [
        oferta.titulo,
        oferta.descripcion,
        oferta.requisitos,
        oferta.lugar,
        oferta.jornada,
        oferta.sueldo ?? "",
        ...oferta.rubros.map((rubro) => NOMBRE_RUBRO[rubro]),
      ].join(" "),
    );
    return palabras.every((palabra) => texto.includes(palabra));
  });

  const signo = filtros.orden === "recientes" ? -1 : 1;
  return filtradas.sort((a, b) => signo * a.publicadaEl.localeCompare(b.publicadaEl));
}
