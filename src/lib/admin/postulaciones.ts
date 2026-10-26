import { DECISIONES_EMPRESA, ESTADOS_POSTULACION } from "@/features/postulaciones/domain/estados";
import type { ClavesOrden, OrdenTabla } from "@/lib/admin/orden";
import { leerParam, type ParamsBusqueda } from "@/lib/admin/url";
import type { PostulacionAdmin } from "@/lib/validation/oficina";

export type ModoPostulaciones = "por-evaluar" | "por-comunicar" | "registro";

/** Surname first, so sorting by person reads like a list of names. */
function apellidoYNombre(p: { nombre: string | null; apellido: string | null }): string | null {
  return [p.apellido, p.nombre].filter(Boolean).join(" ") || null;
}

/** What each sortable column of the application tables sorts by (D-063); the keys are the column ids. */
export const CLAVES_ORDEN_POSTULACIONES: ClavesOrden<PostulacionAdmin> = {
  postulante: (p) => apellidoYNombre(p.postulante),
  puesto: (p) => p.oferta.titulo,
  estado: (p) => ESTADOS_POSTULACION[p.estado].etiqueta,
  resultado: (p) => (p.decisionEmpresa ? DECISIONES_EMPRESA[p.decisionEmpresa].etiqueta : null),
  cv: (p) => (p.postulante.cvNombre ? 1 : 0),
  fecha: (p) => p.postuladoEl,
  // Ascending means the shortest wait first: the newest application.
  espera: (p) => -Date.parse(p.postuladoEl),
};

/** The order each application screen comes in without ?orden (see `postulacionesDelModo`). */
export const ORDEN_POR_DEFECTO_POSTULACIONES: Record<ModoPostulaciones, OrdenTabla> = {
  "por-evaluar": { columna: "espera", direccion: "desc" },
  "por-comunicar": { columna: "fecha", direccion: "asc" },
  registro: { columna: "fecha", direccion: "desc" },
};

/** Returns the applications that belong to this mode, sorted correctly. */
export function postulacionesDelModo(
  postulaciones: PostulacionAdmin[],
  modo: ModoPostulaciones,
): PostulacionAdmin[] {
  switch (modo) {
    case "por-evaluar":
      // Oldest first for resolution queue
      return postulaciones
        .filter((p) => p.estado === "postulado")
        .sort((a, b) => a.postuladoEl.localeCompare(b.postuladoEl));
    case "por-comunicar":
      // Oldest first for communication queue
      return postulaciones
        .filter((p) => p.estado === "preseleccionado")
        .sort((a, b) => a.postuladoEl.localeCompare(b.postuladoEl));
    case "registro":
      // Newest first for general register
      return [...postulaciones].sort((a, b) => b.postuladoEl.localeCompare(a.postuladoEl));
  }
}

/** Filters applications by search query, company, trade, and status. */
export function filtrarPostulaciones(
  postulaciones: PostulacionAdmin[],
  params: ParamsBusqueda,
  modo: ModoPostulaciones,
): PostulacionAdmin[] {
  const q = leerParam(params, "q")?.trim().toLowerCase();
  const empresa = leerParam(params, "empresa");
  const rubro = leerParam(params, "rubro");
  const estado = leerParam(params, "estado");

  return postulaciones.filter((p) => {
    if (modo === "registro" && estado && estado !== "todas" && p.estado !== estado) {
      return false;
    }
    if (empresa && p.oferta.empresa?.razonSocial !== empresa) {
      return false;
    }
    if (rubro && !p.oferta.rubros.includes(rubro) && !p.postulante.rubros.includes(rubro)) {
      return false;
    }
    if (q) {
      const postulanteNombre = `${p.postulante.nombre ?? ""} ${p.postulante.apellido ?? ""}`.toLowerCase();
      const dni = p.postulante.dni?.toLowerCase() ?? "";
      const email = p.postulante.email?.toLowerCase() ?? "";
      const puesto = p.oferta.titulo.toLowerCase();
      const razonSocial = p.oferta.empresa?.razonSocial?.toLowerCase() ?? "";

      if (
        !postulanteNombre.includes(q) &&
        !dni.includes(q) &&
        !email.includes(q) &&
        !puesto.includes(q) &&
        !razonSocial.includes(q)
      ) {
        return false;
      }
    }
    return true;
  });
}

/** Counts applications by status for the status strip. */
export function contarPorEstadoPostulaciones(postulaciones: PostulacionAdmin[]) {
  return {
    todas: postulaciones.length,
    postulado: postulaciones.filter((p) => p.estado === "postulado").length,
    preseleccionado: postulaciones.filter((p) => p.estado === "preseleccionado").length,
    derivado: postulaciones.filter((p) => p.estado === "derivado").length,
    no_apto: postulaciones.filter((p) => p.estado === "no_apto").length,
  };
}

/** Unique company names for toolbar select. */
export function empresasDePostulaciones(
  postulaciones: PostulacionAdmin[],
): { valor: string; etiqueta: string }[] {
  const nombres = Array.from(
    new Set(
      postulaciones
        .map((p) => p.oferta.empresa?.razonSocial?.trim())
        .filter((nom): nom is string => Boolean(nom)),
    ),
  ).sort((a, b) => a.localeCompare(b, "es-AR"));

  return nombres.map((n) => ({ valor: n, etiqueta: n }));
}
