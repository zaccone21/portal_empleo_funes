import { diasDesde, hoyArgentino } from "@/lib/admin/fechas";
import type { ClavesOrden, OrdenTabla } from "@/lib/admin/orden";
import { leerParam, type ParamsBusqueda } from "@/lib/admin/url";
import type { EmpresaLista } from "@/lib/dal/empresas";
import { NOMBRE_RUBRO, type Rubro } from "@/lib/validation/rubros";

export type FilaEmpresa = EmpresaLista & {
  rubros: string[];
  ofertasActivas: number;
  ofertasTotales: number;
};

/**
 * A company is "new" for the Office during its first week (D-064). It needs no
 * approval (D-052): the view and the menu counter are there so the Office gets
 * to know it before its first offer arrives.
 */
export const DIAS_EMPRESA_NUEVA = 7;

export function esEmpresaNueva(e: Pick<FilaEmpresa, "creadaEl">, ahora: Date = new Date()): boolean {
  return diasDesde(e.creadaEl, ahora) < DIAS_EMPRESA_NUEVA;
}

const MS_POR_DIA = 86_400_000;

/**
 * The first instant a company still counts as new: midnight in Argentina six
 * days ago, the same calendar-day rule as `esEmpresaNueva`, for counting in
 * the database. Argentina has no daylight saving time, so the offset is fixed.
 */
export function inicioEmpresasNuevas(ahora: Date = new Date()): string {
  const hoy = Date.parse(`${hoyArgentino(ahora)}T00:00:00Z`);
  const dia = new Date(hoy - (DIAS_EMPRESA_NUEVA - 1) * MS_POR_DIA).toISOString().slice(0, 10);
  return `${dia}T00:00:00-03:00`;
}

export function perfilEmpresaIncompleto(e: Pick<FilaEmpresa, "razonSocial" | "cuit" | "contactoNombre" | "contactoEmail">): boolean {
  return !e.razonSocial || !e.cuit || !e.contactoNombre || !e.contactoEmail;
}

/** Filters companies by search query, trade of its offers, and the strip view. */
export function filtrarEmpresas(empresas: FilaEmpresa[], params: ParamsBusqueda, ahora: Date = new Date()): FilaEmpresa[] {
  const vista = leerParam(params, "vista") ?? leerParam(params, "estado");
  const rubro = leerParam(params, "rubro");
  const q = leerParam(params, "q")?.trim().toLowerCase();

  return empresas.filter((e) => {
    if (q) {
      const rs = e.razonSocial?.toLowerCase() ?? "";
      const cuit = e.cuit?.toLowerCase() ?? "";
      const email = e.contactoEmail?.toLowerCase() ?? "";
      const contacto = e.contactoNombre?.toLowerCase() ?? "";
      if (!rs.includes(q) && !cuit.includes(q) && !email.includes(q) && !contacto.includes(q)) return false;
    }
    if (rubro && !e.rubros.includes(rubro)) return false;
    if (vista === "nuevas" && !esEmpresaNueva(e, ahora)) return false;
    if (vista === "activas" && e.ofertasActivas === 0) return false;
    if (vista === "sin-ofertas" && e.ofertasTotales > 0) return false;
    return true;
  });
}

export function contarVistasEmpresas(empresas: FilaEmpresa[], ahora: Date = new Date()) {
  return {
    todas: empresas.length,
    nuevas: empresas.filter((e) => esEmpresaNueva(e, ahora)).length,
    activas: empresas.filter((e) => e.ofertasActivas > 0).length,
    sinOfertas: empresas.filter((e) => e.ofertasTotales === 0).length,
  };
}

/** What each sortable column of the companies table sorts by (D-063); the keys are the column ids. */
export const CLAVES_ORDEN_EMPRESAS: ClavesOrden<FilaEmpresa> = {
  empresa: (e) => e.razonSocial?.trim() || null,
  rubros: (e) => (e.rubros.length > 0 ? e.rubros.map((r) => NOMBRE_RUBRO[r as Rubro] ?? r).join(", ") : null),
  registrada: (e) => e.creadaEl,
  activas: (e) => e.ofertasActivas,
  totales: (e) => e.ofertasTotales,
};

/** Companies come newest first (the data layer sorts them so). */
export const ORDEN_POR_DEFECTO_EMPRESAS: OrdenTabla = { columna: "registrada", direccion: "desc" };
