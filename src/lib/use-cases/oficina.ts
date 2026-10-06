import "server-only";

import type { CurrentUser } from "@/lib/dal/auth";
import { crearUrlFirmadaCv } from "@/lib/dal/cv";
import {
  actualizarEstadoOferta,
  leerOfertaParaOficina,
  listarOfertasParaOficina,
} from "@/lib/dal/ofertas";
import {
  actualizarEstadoPostulacion,
  leerRutaCvDePostulacion,
  listarPostulacionesDeOferta,
  type PostulacionDeOferta,
} from "@/lib/dal/postulaciones";
import type { OfertaOficina, PostulacionOficina, ResumenOficina } from "@/lib/validation/oficina";
import type { EstadoPostulacion } from "@/lib/validation/postulaciones";

import { aOfertaOficina } from "./dto-ofertas";
import { exito, falla, sinPermiso, type Resultado } from "./resultado";

/*
 * The Employment Office (P14, P15; RF1.5.1-RF1.5.6; D-030). Every action is
 * for the admin role. The Office is the only role that sees both sides: the
 * company's contact data and the applicants.
 */

const NO_ENCONTRADA = "No encontramos esa oferta.";

/** The panel's numbers (P14). PROVISIONAL until Q-012 (DT-006). */
export async function verResumen(usuario: CurrentUser): Promise<Resultado<ResumenOficina>> {
  const negado = sinPermiso(usuario, "admin");
  if (negado) return negado;

  const todasLasOfertas = await listarOfertasParaOficina();
  
  const pendientes = todasLasOfertas
    .filter((o) => o.estado === "pendiente")
    .map((o) => ({ id: o.id, titulo: o.titulo, empresa: o.empresa?.razonSocial || "Empresa", creadaEl: o.creadaEl }))
    .slice(0, 10);

  const cierres = todasLasOfertas
    .filter((o) => o.estado === "publicada" && o.cierreSolicitado)
    .map((o) => ({ id: o.id, titulo: o.titulo, empresa: o.empresa?.razonSocial || "Empresa", creadaEl: o.creadaEl }))
    .slice(0, 10);

  const { listarUltimasPostulaciones } = await import("@/lib/dal/postulaciones");
  const postulaciones = await listarUltimasPostulaciones(10);
  const ultimasPost = postulaciones.map((p) => ({
    id: p.id,
    ofertaId: p.ofertaId,
    ofertaTitulo: p.ofertaTitulo,
    postulanteNombre: (p.postulanteNombre ? p.postulanteNombre + " " : "") + (p.postulanteApellido || "") || "Postulante",
    creadaEl: p.creadaEl,
  }));

  return exito({
    ofertasPendientes: pendientes,
    pedidosDeCierre: cierres,
    ultimasPostulaciones: ultimasPost,
  });
}

export async function verOfertas(usuario: CurrentUser): Promise<Resultado<OfertaOficina[]>> {
  const negado = sinPermiso(usuario, "admin");
  if (negado) return negado;

  const ofertas = await listarOfertasParaOficina();
  return exito(ofertas.map(aOfertaOficina));
}

/** The offer after a decision, as the Office sees it. */
async function releer(id: string): Promise<Resultado<{ oferta: OfertaOficina }>> {
  const oferta = await leerOfertaParaOficina(id);
  if (!oferta) throw new Error("The offer disappeared after the decision.");
  return exito({ oferta: aOfertaOficina(oferta) });
}

/**
 * Publishes a pending offer (RF1.5.3). 409 if someone at the Office already
 * decided (the screen shows the message, D-030).
 */
export async function publicarOfertaPendiente(usuario: CurrentUser, id: string): Promise<Resultado<{ oferta: OfertaOficina }>> {
  const negado = sinPermiso(usuario, "admin");
  if (negado) return negado;

  const oferta = await leerOfertaParaOficina(id);
  if (!oferta) return falla("not_found", NO_ENCONTRADA);
  if (oferta.estado !== "pendiente") return falla("conflict", "Esta oferta ya fue revisada.");

  await actualizarEstadoOferta(id, { estado: "publicada" });
  return releer(id);
}

/** Rejects a pending offer with its reason, which the company reads (RF1.3.5, RF1.5.3). */
export async function rechazarOferta(
  usuario: CurrentUser,
  id: string,
  motivo: string,
): Promise<Resultado<{ oferta: OfertaOficina }>> {
  const negado = sinPermiso(usuario, "admin");
  if (negado) return negado;

  const oferta = await leerOfertaParaOficina(id);
  if (!oferta) return falla("not_found", NO_ENCONTRADA);
  if (oferta.estado !== "pendiente") return falla("conflict", "Esta oferta ya fue revisada.");

  await actualizarEstadoOferta(id, { estado: "rechazada", motivoRechazo: motivo });
  return releer(id);
}

/** Closes a published offer, only if its company asked for it (RF1.5.4). */
export async function cerrarOferta(usuario: CurrentUser, id: string): Promise<Resultado<{ oferta: OfertaOficina }>> {
  const negado = sinPermiso(usuario, "admin");
  if (negado) return negado;

  const oferta = await leerOfertaParaOficina(id);
  if (!oferta) return falla("not_found", NO_ENCONTRADA);
  if (oferta.estado !== "publicada" || !oferta.cierreSolicitado) {
    return falla("conflict", "Solo se cierran ofertas publicadas cuya empresa pidió el cierre.");
  }

  await actualizarEstadoOferta(id, { estado: "cerrada" });
  return releer(id);
}

function aPostulacionOficina(postulacion: PostulacionDeOferta): PostulacionOficina {
  return {
    id: postulacion.id,
    estado: postulacion.estado,
    postuladoEl: postulacion.creadaEl,
    postulante: { email: postulacion.email, cv: postulacion.cv },
  };
}

/** Who applied to an offer, in arrival order (RF1.5.5). */
export async function verPostulantes(usuario: CurrentUser, ofertaId: string): Promise<Resultado<PostulacionOficina[]>> {
  const negado = sinPermiso(usuario, "admin");
  if (negado) return negado;

  if (!(await leerOfertaParaOficina(ofertaId))) return falla("not_found", NO_ENCONTRADA);
  const postulaciones = await listarPostulacionesDeOferta(ofertaId);
  return exito(postulaciones.map(aPostulacionOficina));
}

/** Any change among the four statuses (RF1.5.6, D-030). The applicant never sees it (RF1.2.4). */
export async function cambiarEstadoPostulacion(
  usuario: CurrentUser,
  id: string,
  estado: EstadoPostulacion,
): Promise<Resultado<{ postulacion: PostulacionOficina }>> {
  const negado = sinPermiso(usuario, "admin");
  if (negado) return negado;

  const postulacion = await actualizarEstadoPostulacion(id, estado);
  if (!postulacion) return falla("not_found", "No encontramos esa postulación.");
  return exito({ postulacion: aPostulacionOficina(postulacion) });
}

/** A short-lived link to the applicant's CV (RF1.5.5, RNF1). The route redirects to it. */
export async function abrirCv(usuario: CurrentUser, postulacionId: string): Promise<Resultado<{ url: string }>> {
  const negado = sinPermiso(usuario, "admin");
  if (negado) return negado;

  const ruta = await leerRutaCvDePostulacion(postulacionId);
  if (!ruta) return falla("not_found", "Esta persona todavía no subió su CV.");
  return exito({ url: await crearUrlFirmadaCv(ruta) });
}

import { buscarPostulantes as dalBuscarPostulantes, type ResultadoBusquedaPostulante } from "@/lib/dal/postulantes";

export async function buscarPostulantes(
  usuario: CurrentUser,
  filtros: { q?: string; rubros?: string[] }
): Promise<Resultado<ResultadoBusquedaPostulante[]>> {
  const negado = sinPermiso(usuario, "admin");
  if (negado) return negado;
  
  const postulantes = await dalBuscarPostulantes(filtros);
  
  return exito(postulantes);
}
