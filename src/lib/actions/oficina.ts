"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentUser } from "@/lib/dal/auth";
import {
  cerrarOferta,
  publicarOfertaPendiente,
  rechazarOferta,
  resolverPostulacion,
} from "@/lib/use-cases/oficina";
import { rechazoSchema } from "@/lib/validation/oficina";
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

/** Rejects a pending offer. The reason is required: the company reads it (RF1.3.5, RF1.5.3). */
export async function rechazarOfertaAccion(id: string, motivo: string): Promise<RespuestaAccion> {
  const parsedId = idSchema.safeParse(id);
  const parsedMotivo = rechazoSchema.safeParse({ motivo });
  if (!parsedId.success) return DATOS_INVALIDOS;
  if (!parsedMotivo.success) return { ok: false, mensaje: parsedMotivo.error.issues[0]?.message ?? DATOS_INVALIDOS.mensaje };
  const usuario = await getCurrentUser();
  if (!usuario) return SIN_SESION;

  const resultado = await rechazarOferta(usuario, parsedId.data, parsedMotivo.data.motivo);
  if (!resultado.ok) return { ok: false, mensaje: resultado.mensaje };
  refrescarAdmin();
  return { ok: true, mensaje: `Rechazaste “${resultado.datos.oferta.titulo}”.` };
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
