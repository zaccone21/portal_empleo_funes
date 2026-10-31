"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { getCurrentUser } from "@/lib/dal/auth";
import { crearCuentaOficina } from "@/lib/use-cases/equipo";
import {
  alternarCursoAdmin,
  aprobarEmpresa,
  asociarPostulanteAOferta,
  cerrarOferta,
  crearCursoAdmin,
  publicarOfertaPendiente,
  rechazarEmpresa,
  rechazarOferta,
  registrarDerivacionCurso,
  registrarPreentrevista,
  reprogramarPreentrevista,
  resolverPostulacion,
} from "@/lib/use-cases/oficina";
import { nuevaCuentaOficinaSchema } from "@/lib/validation/equipo";
import {
  armarMotivoRechazo,
  ETIQUETA_MOTIVO_EMPRESA,
  ETIQUETA_MOTIVO_OFERTA,
  rechazoEmpresaSchema,
  rechazoOfertaSchema,
} from "@/lib/validation/motivos-rechazo";
import { cursoCatalogoSchema, derivacionCursoSchema, preentrevistaSchema } from "@/lib/validation/oficina";
import { estadoPostulacionSchema } from "@/lib/validation/postulaciones";

/*
 * Server Actions of the Office screens (D-042). Same rules as a Route Handler
 * (AGENTS §6): validate with Zod, get the session user, call ONE use case, and
 * answer with a short Spanish message the screen shows in a toast. The role and
 * the transition checks live in the use case, never here.
 */

export type RespuestaAccion = { ok: true; mensaje: string } | { ok: false; mensaje: string };

export type RespuestaLote = { ok: true; aprobadas: number; fallidas: number; mensaje: string } | { ok: false; mensaje: string };

const SIN_SESION: RespuestaAccion = { ok: false, mensaje: "Tu sesión terminó. Volvé a ingresar." };
const DATOS_INVALIDOS: RespuestaAccion = { ok: false, mensaje: "No pudimos leer el pedido. Probá de nuevo." };

const idSchema = z.string().min(1).max(100);

/** Refreshes every Office screen so counters, queues and panels show the new state. */
function refrescarAdmin() {
  revalidatePath("/admin", "layout");
}

async function obtenerUrlBasePedido(): Promise<string> {
  const encabezados = await headers();
  const host = encabezados.get("x-forwarded-host") ?? encabezados.get("host");
  const proto = encabezados.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  return host ? `${proto}://${host}` : "http://localhost:3000";
}

/** Approves one pending offer with a single click (RF1.5.3). */
export async function aprobarOfertaAccion(id: string): Promise<RespuestaAccion> {
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return DATOS_INVALIDOS;
  const usuario = await getCurrentUser();
  if (!usuario) return SIN_SESION;

  const resultado = await publicarOfertaPendiente(usuario, parsed.data);
  if (!resultado.ok) return { ok: false, mensaje: resultado.mensaje };
  refrescarAdmin();
  return { ok: true, mensaje: `Aprobaste “${resultado.datos.oferta.titulo}”.` };
}

/** Approves several pending offers; each one is reported on its own (D-042). */
export async function aprobarOfertasLoteAccion(ids: string[]): Promise<RespuestaLote> {
  const parsed = z.array(idSchema).min(1).max(100).safeParse(ids);
  if (!parsed.success) return { ok: false, mensaje: DATOS_INVALIDOS.mensaje };
  const usuario = await getCurrentUser();
  if (!usuario) return { ok: false, mensaje: SIN_SESION.mensaje };

  let aprobadas = 0;
  let fallidas = 0;
  for (const id of parsed.data) {
    const resultado = await publicarOfertaPendiente(usuario, id);
    if (resultado.ok) aprobadas += 1;
    else fallidas += 1;
  }
  refrescarAdmin();

  const texto = (n: number, singular: string, plural: string) => `${n} ${n === 1 ? singular : plural}`;
  const mensaje =
    fallidas === 0
      ? `${texto(aprobadas, "aprobada", "aprobadas")}.`
      : `${texto(aprobadas, "aprobada", "aprobadas")}, ${fallidas === 1 ? "1 no se pudo" : `${fallidas} no se pudieron`} aprobar.`;
  return { ok: true, aprobadas, fallidas, mensaje };
}

/**
 * Rejects a pending offer. The reason is one of the fixed ones, with an optional
 * note; the company reads the resulting sentence (RF1.3.5, RF1.5.3, D-069).
 */
export async function rechazarOfertaAccion(id: string, motivo: string, observacion?: string): Promise<RespuestaAccion> {
  const parsedId = idSchema.safeParse(id);
  const parsedRechazo = rechazoOfertaSchema.safeParse({ motivo, observacion });
  if (!parsedId.success) return DATOS_INVALIDOS;
  if (!parsedRechazo.success) return { ok: false, mensaje: parsedRechazo.error.issues[0]?.message ?? DATOS_INVALIDOS.mensaje };
  const usuario = await getCurrentUser();
  if (!usuario) return SIN_SESION;

  const texto = armarMotivoRechazo(ETIQUETA_MOTIVO_OFERTA[parsedRechazo.data.motivo], parsedRechazo.data.observacion);
  const resultado = await rechazarOferta(usuario, parsedId.data, texto);
  if (!resultado.ok) return { ok: false, mensaje: resultado.mensaje };
  refrescarAdmin();
  return { ok: true, mensaje: `Rechazaste “${resultado.datos.oferta.titulo}”.` };
}

/** Approves a company so it can send offers (D-068). */
export async function aprobarEmpresaAccion(id: string): Promise<RespuestaAccion> {
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return DATOS_INVALIDOS;
  const usuario = await getCurrentUser();
  if (!usuario) return SIN_SESION;

  const resultado = await aprobarEmpresa(usuario, parsed.data);
  if (!resultado.ok) return { ok: false, mensaje: resultado.mensaje };
  refrescarAdmin();
  return { ok: true, mensaje: `Aprobaste a ${resultado.datos.empresa.razonSocial ?? "la empresa"}.` };
}

/** Rejects a pending company with one of the fixed reasons and an optional note; the company reads it (D-068, D-069). */
export async function rechazarEmpresaAccion(id: string, motivo: string, observacion?: string): Promise<RespuestaAccion> {
  const parsedId = idSchema.safeParse(id);
  const parsedRechazo = rechazoEmpresaSchema.safeParse({ motivo, observacion });
  if (!parsedId.success) return DATOS_INVALIDOS;
  if (!parsedRechazo.success) return { ok: false, mensaje: parsedRechazo.error.issues[0]?.message ?? DATOS_INVALIDOS.mensaje };
  const usuario = await getCurrentUser();
  if (!usuario) return SIN_SESION;

  const texto = armarMotivoRechazo(ETIQUETA_MOTIVO_EMPRESA[parsedRechazo.data.motivo], parsedRechazo.data.observacion);
  const resultado = await rechazarEmpresa(usuario, parsedId.data, texto);
  if (!resultado.ok) return { ok: false, mensaje: resultado.mensaje };
  refrescarAdmin();
  return { ok: true, mensaje: `Rechazaste a ${resultado.datos.empresa.razonSocial ?? "la empresa"}.` };
}

/** Closes a published offer whose company asked for it (RF1.5.4). */
export async function cerrarOfertaAccion(id: string): Promise<RespuestaAccion> {
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return DATOS_INVALIDOS;
  const usuario = await getCurrentUser();
  if (!usuario) return SIN_SESION;

  const resultado = await cerrarOferta(usuario, parsed.data);
  if (!resultado.ok) return { ok: false, mensaje: resultado.mensaje };
  refrescarAdmin();
  return { ok: true, mensaje: `Cerraste “${resultado.datos.oferta.titulo}”.` };
}

const MENSAJE_ESTADO = {
  preseleccionado: "Quedó pre-seleccionada.",
  derivado: "Quedó marcada como derivada.",
  no_apto: "Quedó marcada como no apta.",
  postulado: "Volvió a postulada.",
} as const;

/** Moves an application to a new status; the use case validates the transition (RF1.5.6). */
export async function resolverPostulacionAccion(id: string, estado: string): Promise<RespuestaAccion> {
  const parsedId = idSchema.safeParse(id);
  const parsedEstado = estadoPostulacionSchema.safeParse(estado);
  if (!parsedId.success || !parsedEstado.success) return DATOS_INVALIDOS;
  const usuario = await getCurrentUser();
  if (!usuario) return SIN_SESION;

  const resultado = await resolverPostulacion(usuario, parsedId.data, parsedEstado.data);
  if (!resultado.ok) return { ok: false, mensaje: resultado.mensaje };
  refrescarAdmin();
  return { ok: true, mensaje: MENSAJE_ESTADO[parsedEstado.data] };
}

/** Saves the pre-interview of an application and notifies the candidate by email (RF1.6.1, D-045). */
export async function registrarPreentrevistaAccion(id: string, datos: unknown): Promise<RespuestaAccion> {
  const parsedId = idSchema.safeParse(id);
  const parsedDatos = preentrevistaSchema.safeParse(datos);
  if (!parsedId.success) return DATOS_INVALIDOS;
  if (!parsedDatos.success) return { ok: false, mensaje: parsedDatos.error.issues[0]?.message ?? DATOS_INVALIDOS.mensaje };
  const usuario = await getCurrentUser();
  if (!usuario) return SIN_SESION;

  const urlBase = await obtenerUrlBasePedido();
  const resultado = await registrarPreentrevista(usuario, parsedId.data, parsedDatos.data, urlBase);
  if (!resultado.ok) return { ok: false, mensaje: resultado.mensaje };
  refrescarAdmin();

  if (parsedDatos.data.confirmarDirecto) {
    return { ok: true, mensaje: "Guardaste la pre-entrevista como agendada." };
  }
  return {
    ok: true,
    mensaje: resultado.datos.emailEnviado
      ? "Pre-entrevista registrada (pendiente de confirmación). Se envió el mail al candidato."
      : "Pre-entrevista registrada como pendiente de confirmación.",
  };
}

/** Proactively reschedules a pre-interview from the Office calendar or evaluation screen. */
export async function reprogramarPreentrevistaAccion(id: string, datos: unknown): Promise<RespuestaAccion> {
  const parsedId = idSchema.safeParse(id);
  const parsedDatos = preentrevistaSchema.safeParse(datos);
  if (!parsedId.success) return DATOS_INVALIDOS;
  if (!parsedDatos.success) return { ok: false, mensaje: parsedDatos.error.issues[0]?.message ?? DATOS_INVALIDOS.mensaje };
  const usuario = await getCurrentUser();
  if (!usuario) return SIN_SESION;

  const urlBase = await obtenerUrlBasePedido();
  const resultado = await reprogramarPreentrevista(usuario, parsedId.data, parsedDatos.data, urlBase);
  if (!resultado.ok) return { ok: false, mensaje: resultado.mensaje };
  refrescarAdmin();

  return {
    ok: true,
    mensaje: resultado.datos.emailEnviado
      ? "Reprogramaste la pre-entrevista y se envió el aviso por mail."
      : "Reprogramaste la pre-entrevista.",
  };
}

/** Creates a new training course in the Office catalog (`public.cursos`). */
export async function crearCursoAccion(datos: unknown): Promise<RespuestaAccion> {
  const parsedDatos = cursoCatalogoSchema.safeParse(datos);
  if (!parsedDatos.success) return { ok: false, mensaje: parsedDatos.error.issues[0]?.message ?? DATOS_INVALIDOS.mensaje };
  const usuario = await getCurrentUser();
  if (!usuario) return SIN_SESION;

  const resultado = await crearCursoAdmin(usuario, parsedDatos.data);
  if (!resultado.ok) return { ok: false, mensaje: resultado.mensaje };
  refrescarAdmin();
  return { ok: true, mensaje: `Cargaste el curso “${resultado.datos.curso.nombre}”.` };
}

/** Activates or pauses a course in the Office catalog. */
export async function alternarCursoAccion(cursoId: string, activo: boolean): Promise<RespuestaAccion> {
  const parsedId = idSchema.safeParse(cursoId);
  if (!parsedId.success) return DATOS_INVALIDOS;
  const usuario = await getCurrentUser();
  if (!usuario) return SIN_SESION;

  const resultado = await alternarCursoAdmin(usuario, parsedId.data, Boolean(activo));
  if (!resultado.ok) return { ok: false, mensaje: resultado.mensaje };
  refrescarAdmin();
  return { ok: true, mensaje: activo ? "Activaste el curso." : "Pausaste el curso." };
}

/** Registers a course referral and sends an email notification to the applicant (P19, RF1.6.6, D-047). */
export async function registrarDerivacionCursoAccion(postulanteId: string, datos: unknown): Promise<RespuestaAccion> {
  const parsedId = idSchema.safeParse(postulanteId);
  const parsedDatos = derivacionCursoSchema.safeParse(datos);
  if (!parsedId.success) return DATOS_INVALIDOS;
  if (!parsedDatos.success) return { ok: false, mensaje: parsedDatos.error.issues[0]?.message ?? DATOS_INVALIDOS.mensaje };
  const usuario = await getCurrentUser();
  if (!usuario) return SIN_SESION;

  const resultado = await registrarDerivacionCurso(usuario, parsedId.data, parsedDatos.data);
  if (!resultado.ok) return { ok: false, mensaje: resultado.mensaje };
  refrescarAdmin();
  return {
    ok: true,
    mensaje: resultado.datos.emailEnviado
      ? `Asignaste el curso “${resultado.datos.derivacion.curso}” y se le envió el correo al postulante.`
      : `Registraste la derivación a “${resultado.datos.derivacion.curso}”.`,
  };
}

/** Links an applicant to a published offer from the pool, as if they had applied (P16, RF1.5.8). */
export async function asociarPostulanteAccion(postulanteId: string, ofertaId: string): Promise<RespuestaAccion> {
  const parsedPostulante = idSchema.safeParse(postulanteId);
  const parsedOferta = idSchema.safeParse(ofertaId);
  if (!parsedPostulante.success || !parsedOferta.success) return DATOS_INVALIDOS;
  const usuario = await getCurrentUser();
  if (!usuario) return SIN_SESION;

  const resultado = await asociarPostulanteAOferta(usuario, parsedPostulante.data, parsedOferta.data);
  if (!resultado.ok) return { ok: false, mensaje: resultado.mensaje };
  refrescarAdmin();
  return { ok: true, mensaje: `Quedó postulada a “${resultado.datos.oferta.titulo}”.` };
}

export type RespuestaCrearCuenta =
  | { ok: true; email: string; contrasenaTemporal: string }
  | { ok: false; mensaje: string };

/**
 * Creates an Office account (P21, D-058). The temporary password comes back
 * only in this answer, so the operator can hand it over in person; it is never
 * stored or shown again.
 */
export async function crearCuentaOficinaAccion(datos: unknown): Promise<RespuestaCrearCuenta> {
  const parsed = nuevaCuentaOficinaSchema.safeParse(datos);
  if (!parsed.success) return { ok: false, mensaje: parsed.error.issues[0]?.message ?? DATOS_INVALIDOS.mensaje };
  const usuario = await getCurrentUser();
  if (!usuario) return { ok: false, mensaje: SIN_SESION.mensaje };

  const resultado = await crearCuentaOficina(usuario, parsed.data);
  if (!resultado.ok) return { ok: false, mensaje: resultado.mensaje };
  revalidatePath("/admin/equipo");
  return { ok: true, ...resultado.datos };
}
