import "server-only";

import { puedeTransicionarPostulacion } from "@/features/postulaciones/domain/estados";
import type { CurrentUser } from "@/lib/dal/auth";
import { crearUrlFirmadaCv, leerCv } from "@/lib/dal/cv";
import { listarEmpresas, type EmpresaLista } from "@/lib/dal/empresas";
import {
  actualizarEstadoOferta,
  contarOfertas,
  leerOfertaParaOficina,
  listarOfertasParaOficina,
} from "@/lib/dal/ofertas";
import {
  actualizarEstadoPostulacion,
  contarPostulaciones,
  leerPostulacionAdmin,
  listarPostulacionesAdmin,
} from "@/lib/dal/postulaciones";
import {
  buscarPostulantes as dalBuscarPostulantes,
  leerPerfilPostulanteAdmin,
  type ResultadoBusquedaPostulante,
} from "@/lib/dal/postulantes";
import type { OfertaOficina, PostulacionAdmin } from "@/lib/validation/oficina";
import type { EstadoPostulacion } from "@/lib/validation/postulaciones";

import { aOfertaOficina } from "./dto-ofertas";
import { exito, falla, sinPermiso, type Resultado } from "./resultado";

/*
 * The Employment Office (P14-P16; RF1.5.1-RF1.5.7; D-030, D-042). Every action
 * is for the admin role. The Office is the only role that sees both sides: the
 * company's contact data and the applicants.
 */

const NO_ENCONTRADA = "No encontramos esa oferta.";

/** Counters of the Office's side menu and dashboard (P14). */
export async function getConteosAdmin(usuario: CurrentUser) {
  const negado = sinPermiso(usuario, "admin");
  if (negado) return { ofertasPendientes: 0, postulacionesNuevas: 0, cierresSolicitados: 0, porDerivar: 0 };

  const [ofertasPendientes, postulacionesNuevas, cierresSolicitados, porDerivar] = await Promise.all([
    contarOfertas("pendiente"),
    contarPostulaciones("postulado"),
    contarOfertas("publicada", true),
    contarPostulaciones("preseleccionado"),
  ]);

  return { ofertasPendientes, postulacionesNuevas, cierresSolicitados, porDerivar };
}

export async function verOfertas(usuario: CurrentUser): Promise<Resultado<OfertaOficina[]>> {
  const negado = sinPermiso(usuario, "admin");
  if (negado) return negado;

  const ofertas = await listarOfertasParaOficina();
  return exito(ofertas.map(aOfertaOficina));
}

export async function verOferta(usuario: CurrentUser, id: string): Promise<Resultado<OfertaOficina>> {
  const negado = sinPermiso(usuario, "admin");
  if (negado) return negado;

  const oferta = await leerOfertaParaOficina(id);
  if (!oferta) return falla("not_found", NO_ENCONTRADA);

  return exito(aOfertaOficina(oferta));
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

/** The applicant pool, optionally filtered by text and trades (P16, RF1.5.7). */
export async function buscarPostulantes(
  usuario: CurrentUser,
  filtros: { q?: string; rubros?: string[] },
): Promise<Resultado<ResultadoBusquedaPostulante[]>> {
  const negado = sinPermiso(usuario, "admin");
  if (negado) return negado;

  return exito(await dalBuscarPostulantes(filtros));
}

export async function buscarEmpresas(usuario: CurrentUser, filtros: { q?: string }): Promise<Resultado<EmpresaLista[]>> {
  const negado = sinPermiso(usuario, "admin");
  if (negado) return negado;

  return exito(await listarEmpresas(filtros));
}

export async function verPostulante(usuario: CurrentUser, id: string): Promise<Resultado<ResultadoBusquedaPostulante>> {
  const negado = sinPermiso(usuario, "admin");
  if (negado) return negado;

  const postulante = await leerPerfilPostulanteAdmin(id);
  if (!postulante) return falla("not_found", "No encontramos a ese postulante.");

  return exito(postulante);
}

/** All applications with their offer and applicant, oldest first: the Office queues and registers (D-042). */
export async function verPostulacionesAdmin(usuario: CurrentUser): Promise<Resultado<PostulacionAdmin[]>> {
  const negado = sinPermiso(usuario, "admin");
  if (negado) return negado;

  return exito(await listarPostulacionesAdmin());
}

/** One application for the evaluation screen. */
export async function verPostulacionAdmin(usuario: CurrentUser, id: string): Promise<Resultado<PostulacionAdmin>> {
  const negado = sinPermiso(usuario, "admin");
  if (negado) return negado;

  const postulacion = await leerPostulacionAdmin(id);
  if (!postulacion) return falla("not_found", "No encontramos esa postulación.");
  return exito(postulacion);
}

/**
 * Moves an application to a new status following the allowed transitions
 * (postulado → preseleccionado | no_apto, preseleccionado → derivado | no_apto).
 * 409 when another operator already decided or the move is not allowed, so the
 * screen can say so instead of showing a generic error (D-042).
 */
export async function resolverPostulacion(
  usuario: CurrentUser,
  id: string,
  estado: EstadoPostulacion,
): Promise<Resultado<{ postulacion: PostulacionAdmin }>> {
  const negado = sinPermiso(usuario, "admin");
  if (negado) return negado;

  const actual = await leerPostulacionAdmin(id);
  if (!actual) return falla("not_found", "No encontramos esa postulación.");
  if (!puedeTransicionarPostulacion(actual.estado, estado)) {
    return falla("conflict", "Esta postulación ya fue resuelta por otra persona de la Oficina.");
  }

  await actualizarEstadoPostulacion(id, estado);
  const nueva = await leerPostulacionAdmin(id);
  if (!nueva) throw new Error("The application disappeared after the decision.");
  return exito({ postulacion: nueva });
}

/** Generates a short-lived signed URL to open or download an applicant's CV (RF1.5.5, RNF1). */
export async function abrirCvPostulante(
  usuario: CurrentUser,
  postulanteId: string,
  descargar = false,
): Promise<Resultado<{ url: string }>> {
  const negado = sinPermiso(usuario, "admin");
  if (negado) return negado;

  const cv = await leerCv(postulanteId);
  if (!cv) return falla("not_found", "Esta persona todavía no subió su CV.");

  const url = await crearUrlFirmadaCv(`${postulanteId}/cv.pdf`, descargar);
  return exito({ url });
}
