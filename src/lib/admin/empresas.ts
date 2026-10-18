import { leerParam, type ParamsBusqueda } from "@/lib/admin/url";
import type { EmpresaLista } from "@/lib/dal/empresas";

export type FilaEmpresa = EmpresaLista & {
  rubros: string[];
  ofertasActivas: number;
  ofertasTotales: number;
};

export function perfilEmpresaIncompleto(e: Pick<FilaEmpresa, "razonSocial" | "cuit" | "contactoNombre" | "contactoEmail">): boolean {
  return !e.razonSocial || !e.cuit || !e.contactoNombre || !e.contactoEmail;
}

/** Filters companies by search query, trade of its offers, and active offers view. */
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
    if (vista === "activas" && e.ofertasActivas === 0) return false;
    if (vista === "sin-ofertas" && e.ofertasTotales > 0) return false;
    return true;
  });
}

export function contarVistasEmpresas(empresas: FilaEmpresa[]) {
  return {
    todas: empresas.length,
    activas: empresas.filter((e) => e.ofertasActivas > 0).length,
    sinOfertas: empresas.filter((e) => e.ofertasTotales === 0).length,
  };
}
