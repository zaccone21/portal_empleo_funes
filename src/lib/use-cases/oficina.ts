import "server-only";

import { puedeTransicionarPostulacion } from "@/features/postulaciones/domain/estados";
import { perfilEmpresaIncompleto } from "@/lib/admin/empresas";
import { fechaDia, fechaHora, hoyArgentino } from "@/lib/admin/fechas";
import type { CurrentUser } from "@/lib/dal/auth";
import { cambiarEstadoCurso, crearCurso, leerCurso, listarCursos } from "@/lib/dal/cursos";
import { crearUrlFirmadaCv, leerCv } from "@/lib/dal/cv";
import { listarVisitasDiarias, type VisitaDiaria } from "@/lib/dal/metricas";
import {
  contarDerivacionesCurso,
  crearDerivacionCurso,
  listarDerivacionesCurso,
  listarDerivacionesCursoTodas,
} from "@/lib/dal/derivaciones-curso";
import {
  actualizarEstadoEmpresa,
  contarEmpresasPendientes,
  leerEmpresaParaOficina,
  listarEmpresas,
  type EmpresaLista,
} from "@/lib/dal/empresas";
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
import { enviarCorreoPortal } from "@/lib/email/envio";
import {
  plantillaAsignacionCurso,
  plantillaConfirmarPreentrevista,
  plantillaReprogramarPreentrevista,
} from "@/lib/email/plantillas";
import { enviarCorreo } from "@/lib/email/resend";
import {
  plantillaCandidatoDerivadoEmpresa,
  plantillaOfertaAprobadaEmpresa,
  plantillaPostulacionDerivadaPostulante,
} from "@/lib/email/templates";
import type {
  CursoOficina,
  DatosCursoCatalogo,
  DatosDerivacionCurso,
  DatosPreentrevista,
  DerivacionCurso,
  EstadoPreentrevista,
  IndicadoresOficina,
  OfertaOficina,
  PostulacionAdmin,
  PostulanteConRechazos,
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
const EMPRESA_NO_ENCONTRADA = "No encontramos esa empresa.";

/** Counters of the Office's side menu and dashboard (P14). */
export async function getConteosAdmin(usuario: CurrentUser) {
  const negado = sinPermiso(usuario, "admin");
  if (negado) return { ofertasPendientes: 0, postulacionesNuevas: 0, cierresSolicitados: 0, porDerivar: 0, empresasPorAprobar: 0 };

  const [ofertasPendientes, postulacionesNuevas, cierresSolicitados, porDerivar, empresasPorAprobar] = await Promise.all([
    contarOfertas("pendiente"),
    contarPostulaciones("postulado"),
    contarOfertas("publicada", true),
    contarPostulaciones("preseleccionado"),
    contarEmpresasPendientes(),
  ]);

  return { ofertasPendientes, postulacionesNuevas, cierresSolicitados, porDerivar, empresasPorAprobar };
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
 * Sends an email notification to the company.
 */
export async function publicarOfertaPendiente(usuario: CurrentUser, id: string): Promise<Resultado<{ oferta: OfertaOficina }>> {
  const negado = sinPermiso(usuario, "admin");
  if (negado) return negado;

  const oferta = await leerOfertaParaOficina(id);
  if (!oferta) return falla("not_found", NO_ENCONTRADA);
  if (oferta.estado !== "pendiente") return falla("conflict", "Esta oferta ya fue revisada.");
  if (!oferta.empresa || !oferta.empresa.cuit?.trim() || !oferta.empresa.razonSocial?.trim()) {
    return falla(
      "conflict",
      "No se puede publicar esta oferta porque la empresa todavía no tiene cargado su CUIT o razón social.",
    );
  }

  await actualizarEstadoOferta(id, { estado: "publicada" });
  const resultado = await releer(id);

  // Email notification to company (non-blocking)
  const emailDestino = oferta.empresa?.contactoEmail || oferta.emailEmpresa;
  if (emailDestino) {
    const { asunto, html } = plantillaOfertaAprobadaEmpresa({
      razonSocial: oferta.empresa?.razonSocial || "Empresa",
      tituloOferta: oferta.titulo,
    });
    void enviarCorreo({ para: emailDestino, asunto, html }).catch(() => {});
  }

  return resultado;
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

/** The company after a decision, as the Office sees it. */
async function releerEmpresa(id: string): Promise<Resultado<{ empresa: EmpresaLista }>> {
  const empresa = await leerEmpresaParaOficina(id);
  if (!empresa) throw new Error("The company disappeared after the decision.");
  return exito({ empresa });
}

/**
 * Approves a company, so it can send offers (D-068). It must have filled in its
 * data (without them the Office has nothing to check), and it must not be
 * approved already. A rejected company can be approved later, for example after
 * correcting its data. 409 if another operator decided first.
 */
export async function aprobarEmpresa(usuario: CurrentUser, id: string): Promise<Resultado<{ empresa: EmpresaLista }>> {
  const negado = sinPermiso(usuario, "admin");
  if (negado) return negado;

  const empresa = await leerEmpresaParaOficina(id);
  if (!empresa) return falla("not_found", EMPRESA_NO_ENCONTRADA);
  if (empresa.estado === "aprobada") return falla("conflict", "Esta empresa ya está aprobada.");
  if (perfilEmpresaIncompleto(empresa)) {
    return falla("conflict", "Esta empresa todavía no completó sus datos. No se puede aprobar hasta que los cargue.");
  }

  const cambiada = await actualizarEstadoEmpresa(id, empresa.estado, { estado: "aprobada" });
  if (!cambiada) return falla("conflict", "Otra persona de la Oficina ya revisó esta empresa.");
  return releerEmpresa(id);
}

/**
 * Rejects a pending company with its reason, which the company reads (D-068,
 * D-069). An approved company is not taken back in this delivery.
 */
export async function rechazarEmpresa(
  usuario: CurrentUser,
  id: string,
  motivo: string,
): Promise<Resultado<{ empresa: EmpresaLista }>> {
  const negado = sinPermiso(usuario, "admin");
  if (negado) return negado;

  const empresa = await leerEmpresaParaOficina(id);
  if (!empresa) return falla("not_found", EMPRESA_NO_ENCONTRADA);
  if (empresa.estado !== "pendiente") return falla("conflict", "Esta empresa ya fue revisada.");

  const cambiada = await actualizarEstadoEmpresa(id, "pendiente", { estado: "rechazada", motivoRechazo: motivo });
  if (!cambiada) return falla("conflict", "Otra persona de la Oficina ya revisó esta empresa.");
  return releerEmpresa(id);
}

export async function verPostulante(usuario: CurrentUser, id: string): Promise<Resultado<ResultadoBusquedaPostulante>> {
  const negado = sinPermiso(usuario, "admin");
  if (negado) return negado;

  const postulante = await leerPerfilPostulanteAdmin(id);
  if (!postulante) return falla("not_found", "No encontramos a ese postulante.");

  return exito(postulante);
}

/** All applications with their offer and applicant, newest action first (D-042). */
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
 * When moved to 'derivado', notifies company and applicant via email.
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

  // If application was referred to the company, notify company and applicant (non-blocking)
  if (estado === "derivado") {
    const emailEmpresa = nueva.oferta.empresa?.contactoEmail;
    if (emailEmpresa) {
      const emailInfo = plantillaCandidatoDerivadoEmpresa({
        razonSocial: nueva.oferta.empresa?.razonSocial || "Empresa",
        tituloOferta: nueva.oferta.titulo,
      });
      void enviarCorreo({ para: emailEmpresa, asunto: emailInfo.asunto, html: emailInfo.html }).catch(() => {});
    }

    const emailPostulante = nueva.postulante.email;
    if (emailPostulante) {
      const nombreCompleto = [nueva.postulante.nombre, nueva.postulante.apellido].filter(Boolean).join(" ");
      const emailPostulanteInfo = plantillaPostulacionDerivadaPostulante({
        nombrePostulante: nombreCompleto || "Postulante",
        tituloOferta: nueva.oferta.titulo,
      });
      void enviarCorreo({ para: emailPostulante, asunto: emailPostulanteInfo.asunto, html: emailPostulanteInfo.html }).catch(() => {});
    }
  }

  return exito({ postulacion: nueva });
}

function resolverUrlBase(urlBase?: string): string {
  if (urlBase?.trim()) return urlBase.trim().replace(/\/$/, "");
  if (process.env.NEXT_PUBLIC_SITE_URL?.trim()) return process.env.NEXT_PUBLIC_SITE_URL.trim().replace(/\/$/, "");
  return "http://localhost:3000";
}

/**
 * Records the pre-interview of an application (RF1.6.1, D-045): sets state to
 * `pendiente_confirmacion` (or `agendada` when `confirmarDirecto` is true) and
 * sends an email to the candidate so they can confirm or ask to reschedule.
 */
export async function registrarPreentrevista(
  usuario: CurrentUser,
  id: string,
  datos: DatosPreentrevista,
  urlBase?: string,
): Promise<Resultado<{ postulacion: PostulacionAdmin; emailEnviado?: boolean }>> {
  const negado = sinPermiso(usuario, "admin");
  if (negado) return negado;

  const actual = await leerPostulacionAdmin(id);
  if (!actual) return falla("not_found", "No encontramos esa postulación.");

  const confirmarDirecto = Boolean(datos.confirmarDirecto);
  const estado: EstadoPreentrevista = confirmarDirecto ? "agendada" : "pendiente_confirmacion";
  const token = confirmarDirecto ? null : crypto.randomUUID();
  const notas = datos.notas || null;

  await guardarPreentrevista(id, { fecha: datos.fecha, notas, estado, token });
  const nueva = await leerPostulacionAdmin(id);
  if (!nueva) throw new Error("The application disappeared after saving the pre-interview.");

  let emailEnviado = false;
  if (actual.postulante.email && token) {
    const base = resolverUrlBase(urlBase);
    const nombrePostulante = [actual.postulante.nombre, actual.postulante.apellido].filter(Boolean).join(" ");
    const { asunto, html } = plantillaConfirmarPreentrevista({
      nombrePostulante,
      tituloOferta: actual.oferta.titulo,
      fechaHoraTexto: fechaHora(datos.fecha),
      notas,
      urlConfirmar: `${base}/acceso/preentrevista?token=${encodeURIComponent(token)}&accion=confirmar`,
      urlCancelar: `${base}/acceso/preentrevista?token=${encodeURIComponent(token)}&accion=cancelar`,
    });
    const resCorreo = await enviarCorreoPortal({ para: actual.postulante.email, asunto, html });
    emailEnviado = resCorreo.enviado;
  }

  return exito({ postulacion: nueva, emailEnviado });
}

/**
 * Manual proactive rescheduling of a pre-interview by the Office. Allows either
 * keeping it directly as `agendada` (if agreed by phone/in person) or setting it
 * to `pendiente_confirmacion` so the candidate confirms the new slot by email.
 */
export async function reprogramarPreentrevista(
  usuario: CurrentUser,
  id: string,
  datos: DatosPreentrevista,
  urlBase?: string,
): Promise<Resultado<{ postulacion: PostulacionAdmin; emailEnviado?: boolean }>> {
  const negado = sinPermiso(usuario, "admin");
  if (negado) return negado;

  const actual = await leerPostulacionAdmin(id);
  if (!actual) return falla("not_found", "No encontramos esa postulación.");

  const confirmarDirecto = Boolean(datos.confirmarDirecto);
  const estado: EstadoPreentrevista = confirmarDirecto ? "agendada" : "pendiente_confirmacion";
  const token = crypto.randomUUID();
  const notas = datos.notas || null;

  await guardarPreentrevista(id, {
    fecha: datos.fecha,
    notas,
    estado,
    token: confirmarDirecto ? null : token,
  });
  const nueva = await leerPostulacionAdmin(id);
  if (!nueva) throw new Error("The application disappeared after rescheduling the pre-interview.");

  let emailEnviado = false;
  if (actual.postulante.email) {
    const base = resolverUrlBase(urlBase);
    const nombrePostulante = [actual.postulante.nombre, actual.postulante.apellido].filter(Boolean).join(" ");
    const { asunto, html } = plantillaReprogramarPreentrevista({
      nombrePostulante,
      tituloOferta: actual.oferta.titulo,
      fechaHoraTexto: fechaHora(datos.fecha),
      notas,
      requiereConfirmacion: !confirmarDirecto,
      urlConfirmar: `${base}/acceso/preentrevista?token=${encodeURIComponent(token)}&accion=confirmar`,
      urlCancelar: `${base}/acceso/preentrevista?token=${encodeURIComponent(token)}&accion=cancelar`,
    });
    const resCorreo = await enviarCorreoPortal({ para: actual.postulante.email, asunto, html });
    emailEnviado = resCorreo.enviado;
  }

  return exito({ postulacion: nueva, emailEnviado });
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

/** Lists all courses in the Office's catalog (or only active ones). */
export async function verCursosAdmin(
  usuario: CurrentUser,
  soloActivos = false,
): Promise<Resultado<CursoOficina[]>> {
  const negado = sinPermiso(usuario, "admin");
  if (negado) return negado;

  return exito(await listarCursos(soloActivos));
}

/** Creates a new training course in the Office's catalog. */
export async function crearCursoAdmin(
  usuario: CurrentUser,
  datos: DatosCursoCatalogo,
): Promise<Resultado<{ curso: CursoOficina }>> {
  const negado = sinPermiso(usuario, "admin");
  if (negado) return negado;

  const curso = await crearCurso(datos);
  return exito({ curso });
}

/** Activates or pauses a training course in the catalog. */
export async function alternarCursoAdmin(
  usuario: CurrentUser,
  cursoId: string,
  activo: boolean,
): Promise<Resultado<undefined>> {
  const negado = sinPermiso(usuario, "admin");
  if (negado) return negado;

  const curso = await leerCurso(cursoId);
  if (!curso) return falla("not_found", "No encontramos ese curso.");

  await cambiarEstadoCurso(cursoId, activo);
  return exito(undefined);
}

/**
 * Lists applicants who accumulated 3 or more company rejections (`decisionEmpresa === "no_contratado"`),
 * ordered from the most recent rejection to the oldest, along with any courses already assigned to them.
 */
export async function verPostulantesConTresRechazos(
  usuario: CurrentUser,
): Promise<Resultado<PostulanteConRechazos[]>> {
  const negado = sinPermiso(usuario, "admin");
  if (negado) return negado;

  const [postulaciones, derivaciones] = await Promise.all([
    listarPostulacionesAdmin(),
    listarDerivacionesCursoTodas(),
  ]);

  const cursosPorPostulante = new Map<string, string[]>();
  for (const d of derivaciones) {
    const lista = cursosPorPostulante.get(d.postulanteId) ?? [];
    lista.push(d.curso);
    cursosPorPostulante.set(d.postulanteId, lista);
  }

  const agrupados = new Map<string, PostulanteConRechazos>();
  for (const p of postulaciones) {
    if (p.decisionEmpresa !== "no_contratado") continue;
    const fechaEvento = p.actualizadaEl ?? p.derivadaEl ?? p.postuladoEl;
    const existente = agrupados.get(p.postulante.id);
    if (!existente) {
      agrupados.set(p.postulante.id, {
        postulanteId: p.postulante.id,
        nombre: p.postulante.nombre,
        apellido: p.postulante.apellido,
        dni: p.postulante.dni,
        email: p.postulante.email,
        telefono: p.postulante.telefono,
        cantidadRechazos: 1,
        ultimoRechazoEl: fechaEvento,
        cursosAsignados: cursosPorPostulante.get(p.postulante.id) ?? [],
      });
    } else {
      existente.cantidadRechazos += 1;
      if (fechaEvento > existente.ultimoRechazoEl) {
        existente.ultimoRechazoEl = fechaEvento;
      }
    }
  }

  const resultado = [...agrupados.values()]
    .filter((item) => item.cantidadRechazos >= 3)
    .sort((a, b) => b.ultimoRechazoEl.localeCompare(a.ultimoRechazoEl));

  return exito(resultado);
}

/**
 * Registers that the Office referred an applicant to a training course (P19, RF1.6.6, D-047)
 * and sends an email notification to the applicant with the course details.
 */
export async function registrarDerivacionCurso(
  usuario: CurrentUser,
  postulanteId: string,
  datos: DatosDerivacionCurso,
): Promise<Resultado<{ derivacion: DerivacionCurso; emailEnviado?: boolean }>> {
  const negado = sinPermiso(usuario, "admin");
  if (negado) return negado;

  const postulante = await leerPerfilPostulanteAdmin(postulanteId);
  if (!postulante) return falla("not_found", "No encontramos a ese postulante.");

  const cursoCatalogo = datos.cursoId ? await leerCurso(datos.cursoId) : null;
  const nombreCurso = cursoCatalogo ? cursoCatalogo.nombre : datos.curso;

  const derivacion = await crearDerivacionCurso(postulanteId, {
    cursoId: cursoCatalogo?.id,
    curso: nombreCurso,
    fecha: datos.fecha,
    notas: datos.notas || null,
  });

  let emailEnviado = false;
  if (postulante.email) {
    const nombrePostulante = [postulante.nombre, postulante.apellido].filter(Boolean).join(" ");
    const { asunto, html } = plantillaAsignacionCurso({
      nombrePostulante,
      nombreCurso,
      descripcion: cursoCatalogo?.descripcion,
      modalidad: cursoCatalogo?.modalidad,
      horario: cursoCatalogo?.horario,
      fechaTexto: fechaDia(derivacion.fecha || hoyArgentino()),
      notas: datos.notas || null,
    });
    const resCorreo = await enviarCorreoPortal({ para: postulante.email, asunto, html });
    emailEnviado = resCorreo.enviado;
  }

  return exito({ derivacion, emailEnviado });
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
 * The Office's queue of referrals the company has not answered yet, newest
 * first (D-054): there are no caps on companies, the Office follows
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

  const extension = cv.nombre.toLowerCase().endsWith(".png") ? "png" : "pdf";
  const ruta = cv.ruta ?? `${postulanteId}/cv.${extension}`;
  const url = await crearUrlFirmadaCv(ruta, descargar);
  return exito({ url });
}

export type DatosMetricasPortal = {
  visitasDiarias: VisitaDiaria[];
  totalPostulantesPadron: number;
  ofertas: OfertaOficina[];
  postulaciones: PostulacionAdmin[];
  derivacionesCurso: Array<{
    postulanteId: string;
    postulanteNombre: string;
    dni: string;
    curso: string;
    fecha: string;
  }>;
};

/**
 * Loads all raw datasets needed by the Office's Metrics & Reports view (`/admin/metricas`),
 * including daily site visits, published/historical offers, applications with timestamps
 * and company decisions, and course referrals enriched with applicant identity.
 */
export async function verDatosMetricasAdmin(
  usuario: CurrentUser,
): Promise<Resultado<DatosMetricasPortal>> {
  const negado = sinPermiso(usuario, "admin");
  if (negado) return negado;

  const [visitasRaw, totalPostulantesPadron, ofertasRaw, postulaciones, derivacionesRaw, postulantesRaw] =
    await Promise.all([
      listarVisitasDiarias(),
      contarPostulantes(),
      listarOfertasParaOficina(),
      listarPostulacionesAdmin(),
      listarDerivacionesCursoTodas(),
      dalBuscarPostulantes({}),
    ]);

  const mapaPostulantes = new Map<string, { nombre: string; dni: string }>();
  for (const p of postulantesRaw) {
    const nombreCompleto =
      [p.nombre, p.apellido].filter(Boolean).join(" ") || p.email || "Postulante";
    mapaPostulantes.set(p.id, { nombre: nombreCompleto, dni: p.dni ?? "—" });
  }
  for (const post of postulaciones) {
    if (!mapaPostulantes.has(post.postulante.id)) {
      const nombreCompleto =
        [post.postulante.nombre, post.postulante.apellido].filter(Boolean).join(" ") ||
        post.postulante.email ||
        "Postulante";
      mapaPostulantes.set(post.postulante.id, {
        nombre: nombreCompleto,
        dni: post.postulante.dni ?? "—",
      });
    }
  }

  const derivacionesCurso = derivacionesRaw.map((d) => {
    const ficha = mapaPostulantes.get(d.postulanteId);
    return {
      postulanteId: d.postulanteId,
      postulanteNombre: ficha?.nombre ?? "Postulante",
      dni: ficha?.dni ?? "—",
      curso: d.curso,
      fecha: d.fecha,
    };
  });

  // Only real counts: isitas_diarias starts counting when its migration is applied,
  // so days before that have no number (the screen says so; nothing is estimated).
  const visitasDiarias: VisitaDiaria[] = [...visitasRaw].sort((a, b) => a.fecha.localeCompare(b.fecha));
  return exito({
    visitasDiarias,
    totalPostulantesPadron,
    ofertas: ofertasRaw.map(aOfertaOficina),
    postulaciones,
    derivacionesCurso,
  });
}
