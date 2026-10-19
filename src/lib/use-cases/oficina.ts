import "server-only";

import { puedeTransicionarPostulacion } from "@/features/postulaciones/domain/estados";
import type { CurrentUser } from "@/lib/dal/auth";
import { crearUrlFirmadaCv, leerCv } from "@/lib/dal/cv";
import { contarDerivacionesCurso, crearDerivacionCurso, listarDerivacionesCurso } from "@/lib/dal/derivaciones-curso";
import { listarEmpresas, type EmpresaLista } from "@/lib/dal/empresas";
import {
  actualizarEstadoOferta,
  contarOfertas,
  leerOfertaParaOficina,
  listarOfertasParaOficina,
} from "@/lib/dal/ofertas";
import {
  actualizarEstadoPostulacion,
  contarDecisiones,
  contarDerivaciones,
  contarDerivadasSinDecision,
  contarPostulaciones,
  crearPostulacionDeOficina,
  guardarPreentrevista,
  leerPostulacionAdmin,
  listarDerivadasSinDecision,
  listarPostulacionesAdmin,
} from "@/lib/dal/postulaciones";
import {
  buscarPostulantes as dalBuscarPostulantes,
  contarPostulantes,
  leerPerfilPostulanteAdmin,
  type ResultadoBusquedaPostulante,
} from "@/lib/dal/postulantes";
import type {
  DatosDerivacionCurso,
  DatosPreentrevista,
  DerivacionCurso,
  IndicadoresOficina,
  OfertaOficina,
  PostulacionAdmin,
  ResumenSeguimiento,
} from "@/lib/validation/oficina";
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

/**
 * Records the pre-interview of an application (RF1.6.1, D-045): a date and
 * optional notes, in any status. Saving again replaces it, so the Office can
 * correct it. Empty notes are saved as none.
 */
export async function registrarPreentrevista(
  usuario: CurrentUser,
  id: string,
  datos: DatosPreentrevista,
): Promise<Resultado<{ postulacion: PostulacionAdmin }>> {
  const negado = sinPermiso(usuario, "admin");
  if (negado) return negado;

  const actual = await leerPostulacionAdmin(id);
  if (!actual) return falla("not_found", "No encontramos esa postulación.");

  await guardarPreentrevista(id, { fecha: datos.fecha, notas: datos.notas || null });
  const nueva = await leerPostulacionAdmin(id);
  if (!nueva) throw new Error("The application disappeared after saving the pre-interview.");
  return exito({ postulacion: nueva });
}

/**
 * Links an applicant to a published offer as if they had applied (P16,
 * RF1.5.8). Unlike the applicant's own "Postularme" (D-024), a repeated link is
 * a conflict: the operator needs to know the person was already there.
 */
export async function asociarPostulanteAOferta(
  usuario: CurrentUser,
  postulanteId: string,
  ofertaId: string,
): Promise<Resultado<{ oferta: OfertaOficina }>> {
  const negado = sinPermiso(usuario, "admin");
  if (negado) return negado;

  const postulante = await leerPerfilPostulanteAdmin(postulanteId);
  if (!postulante) return falla("not_found", "No encontramos a ese postulante.");

  const oferta = await leerOfertaParaOficina(ofertaId);
  if (!oferta) return falla("not_found", NO_ENCONTRADA);
  if (oferta.estado !== "publicada") return falla("conflict", "Solo se puede asociar a una oferta publicada.");

  const creada = await crearPostulacionDeOficina(postulanteId, ofertaId);
  if (!creada) return falla("conflict", "Esta persona ya está postulada a esa oferta.");
  return exito({ oferta: aOfertaOficina(oferta) });
}

/** Counts one applicant's follow-up from their applications (D-046, D-054). */
function resumirSeguimiento(postulaciones: PostulacionAdmin[], derivacionesCurso: number): ResumenSeguimiento {
  const contar = (condicion: (p: PostulacionAdmin) => boolean) => postulaciones.filter(condicion).length;
  return {
    postulaciones: postulaciones.length,
    preseleccionadas: contar((p) => p.estado === "preseleccionado" || p.estado === "derivado"),
    derivadas: contar((p) => p.derivadaEl !== null),
    contrataciones: contar((p) => p.decisionEmpresa === "contratado"),
    rechazos: contar((p) => p.decisionEmpresa === "no_contratado"),
    noApto: contar((p) => p.estado === "no_apto"),
    derivacionesCurso,
  };
}

/**
 * The applicant's follow-up (P18, RF1.6.5, D-046): every application with its
 * pre-interview, referral and the company's decision and reason; the course
 * referrals (P19); and the counts, among them the rejections.
 */
export async function verSeguimientoPostulante(
  usuario: CurrentUser,
  postulanteId: string,
): Promise<
  Resultado<{
    postulante: ResultadoBusquedaPostulante;
    postulaciones: PostulacionAdmin[];
    derivacionesCurso: DerivacionCurso[];
    resumen: ResumenSeguimiento;
  }>
> {
  const negado = sinPermiso(usuario, "admin");
  if (negado) return negado;

  const postulante = await leerPerfilPostulanteAdmin(postulanteId);
  if (!postulante) return falla("not_found", "No encontramos a ese postulante.");

  const [postulaciones, derivacionesCurso] = await Promise.all([
    listarPostulacionesAdmin(postulanteId),
    listarDerivacionesCurso(postulanteId),
  ]);
  return exito({
    postulante,
    postulaciones,
    derivacionesCurso,
    resumen: resumirSeguimiento(postulaciones, derivacionesCurso.length),
  });
}

/** Registers that the Office referred an applicant to a training course (P19, RF1.6.6, D-047). */
export async function registrarDerivacionCurso(
  usuario: CurrentUser,
  postulanteId: string,
  datos: DatosDerivacionCurso,
): Promise<Resultado<{ derivacion: DerivacionCurso }>> {
  const negado = sinPermiso(usuario, "admin");
  if (negado) return negado;

  const postulante = await leerPerfilPostulanteAdmin(postulanteId);
  if (!postulante) return falla("not_found", "No encontramos a ese postulante.");

  const derivacion = await crearDerivacionCurso(postulanteId, {
    curso: datos.curso,
    fecha: datos.fecha,
    notas: datos.notas || null,
  });
  return exito({ derivacion });
}

/** The panel's indicators, counted on the real data (P14, D-051). */
export async function verIndicadoresAdmin(usuario: CurrentUser): Promise<Resultado<IndicadoresOficina>> {
  const negado = sinPermiso(usuario, "admin");
  if (negado) return negado;

  const [postulantes, ofertasActivas, postulaciones, derivaciones, contrataciones, rechazos, derivacionesCurso, sinRespuesta] =
    await Promise.all([
      contarPostulantes(),
      contarOfertas("publicada"),
      contarPostulaciones(),
      contarDerivaciones(),
      contarDecisiones("contratado"),
      contarDecisiones("no_contratado"),
      contarDerivacionesCurso(),
      contarDerivadasSinDecision(),
    ]);

  return exito({ postulantes, ofertasActivas, postulaciones, derivaciones, contrataciones, rechazos, derivacionesCurso, sinRespuesta });
}

/**
 * The Office's queue of referrals the company has not answered yet, the
 * oldest first (D-054): there are no caps on companies, the Office follows
 * them up from here.
 */
export async function verDerivadasSinRespuesta(usuario: CurrentUser): Promise<Resultado<PostulacionAdmin[]>> {
  const negado = sinPermiso(usuario, "admin");
  if (negado) return negado;

  return exito(await listarDerivadasSinDecision());
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
