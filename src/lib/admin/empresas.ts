import type { ClavesOrden, OrdenTabla } from "@/lib/admin/orden";
import { leerParam, type ParamsBusqueda } from "@/lib/admin/url";
import type { EmpresaLista } from "@/lib/dal/empresas";
import { NOMBRE_RUBRO, type Rubro } from "@/lib/validation/rubros";

export type FilaEmpresa = EmpresaLista & {
  rubros: string[];
  ofertasActivas: number;
  ofertasTotales: number;
};

export function perfilEmpresaIncompleto(
  e: Pick<FilaEmpresa, "razonSocial" | "cuit" | "contactoNombre" | "contactoEmail"> & {
    contactoTelefono?: string | null;
  },
): boolean {
  return (
    !e.razonSocial?.trim() ||
    !e.cuit?.trim() ||
    !e.contactoNombre?.trim() ||
    !e.contactoEmail?.trim() ||
    (e.contactoTelefono !== undefined && !e.contactoTelefono?.trim())
  );
}

/**
 * Filters companies by search query, trade of its offers, and the strip view.
 * "pendientes" is the queue of companies waiting for the Office's approval (D-068).
 */
export function filtrarEmpresas(empresas: FilaEmpresa[], params: ParamsBusqueda): FilaEmpresa[] {
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
    if (vista === "pendientes" && e.estado !== "pendiente") return false;
    if (vista === "rechazadas" && e.estado !== "rechazada") return false;
    if (vista === "activas" && e.ofertasActivas === 0) return false;
    if (vista === "sin-ofertas" && e.ofertasTotales > 0) return false;
    return true;
  });
}

export function contarVistasEmpresas(empresas: FilaEmpresa[]) {
  return {
    todas: empresas.length,
    pendientes: empresas.filter((e) => e.estado === "pendiente").length,
    rechazadas: empresas.filter((e) => e.estado === "rechazada").length,
    activas: empresas.filter((e) => e.ofertasActivas > 0).length,
    sinOfertas: empresas.filter((e) => e.ofertasTotales === 0).length,
  };
}

/** What each sortable column of the companies table sorts by (D-063); the keys are the column ids. */
export const CLAVES_ORDEN_EMPRESAS: ClavesOrden<FilaEmpresa> = {
  empresa: (e) => e.razonSocial?.trim() || null,
  rubros: (e) => (e.rubros.length > 0 ? e.rubros.map((r) => NOMBRE_RUBRO[r as Rubro] ?? r).join(", ") : null),
  estado: (e) => e.estado,
  registrada: (e) => e.creadaEl,
  activas: (e) => e.ofertasActivas,
  totales: (e) => e.ofertasTotales,
};

/** Companies come newest first (the data layer sorts them so). */
export const ORDEN_POR_DEFECTO_EMPRESAS: OrdenTabla = { columna: "registrada", direccion: "desc" };
