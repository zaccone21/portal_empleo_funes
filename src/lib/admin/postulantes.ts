import { leerParam, type ParamsBusqueda } from "@/lib/admin/url";
import type { ResultadoBusquedaPostulante } from "@/lib/dal/postulantes";

/*
 * Views of the applicants register (screen 09, D-037). Search by name, surname
 * or ID number and the trades filter run in the data layer; the rest is here.
 */

export type FilaPostulante = ResultadoBusquedaPostulante & { cantidadPostulaciones: number };

/** A profile is incomplete while it lacks name, surname, ID number or phone (D-032). */
export function perfilIncompleto(p: Pick<ResultadoBusquedaPostulante, "nombre" | "apellido" | "dni" | "telefono">): boolean {
  return !p.nombre || !p.apellido || !p.dni || !p.telefono;
}

export function tieneCv(p: Pick<ResultadoBusquedaPostulante, "cvSubidoEl">): boolean {
  return p.cvSubidoEl !== null;
}

/** Applies search, rubro, strip (all / with CV / without CV / incomplete) and the CV select from the URL. */
export function filtrarPostulantes(postulantes: FilaPostulante[], params: ParamsBusqueda): FilaPostulante[] {
  const vista = leerParam(params, "vista") ?? leerParam(params, "estado");
  const cv = leerParam(params, "cv");
  const rubro = leerParam(params, "rubro");
  const q = leerParam(params, "q")?.trim().toLowerCase();

  return postulantes.filter((p) => {
    if (q) {
      const nom = `${p.nombre ?? ""} ${p.apellido ?? ""}`.toLowerCase();
      const dni = p.dni?.toLowerCase() ?? "";
      const email = p.email?.toLowerCase() ?? "";
      if (!nom.includes(q) && !dni.includes(q) && !email.includes(q)) return false;
    }
    if (rubro && !p.rubros.includes(rubro)) return false;
    if (vista === "con-cv" && !tieneCv(p)) return false;
    if (vista === "sin-cv" && tieneCv(p)) return false;
    if (vista === "incompleto" && !perfilIncompleto(p)) return false;
    if (cv === "con" && !tieneCv(p)) return false;
    if (cv === "sin" && tieneCv(p)) return false;
    return true;
  });
}

export function contarVistasPostulantes(postulantes: FilaPostulante[]) {
  return {
    todos: postulantes.length,
    conCv: postulantes.filter(tieneCv).length,
    sinCv: postulantes.filter((p) => !tieneCv(p)).length,
    incompleto: postulantes.filter(perfilIncompleto).length,
  };
}
