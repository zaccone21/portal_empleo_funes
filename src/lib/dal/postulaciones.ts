import "server-only";

import { z } from "zod";

import { fechaSchema } from "@/lib/dal/fecha";
import { createClient } from "@/lib/supabase/server";
import { decisionEmpresaSchema, type DecisionEmpresa } from "@/lib/validation/candidatos";
import type { PostulacionAdmin } from "@/lib/validation/oficina";
import { estadoPostulacionSchema, type EstadoPostulacion } from "@/lib/validation/postulaciones";

/*
 * Applications in the database (`postulaciones`). RLS lets an applicant see
 * only their own and the Office all of them; companies see none by RLS: their
 * referred applicants go through lib/dal/candidatos.ts (D-044, DT-019).
 */

/** Ids of the offers this applicant already applied to (for `yaTePostulaste`, D-028). */
export async function idsDeOfertasPostuladas(postulanteId: string): Promise<Set<string>> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("postulaciones").select("oferta_id").eq("postulante_id", postulanteId);

  if (error) throw new Error("Could not load the applications.");
  return new Set(z.array(z.object({ oferta_id: z.string() })).parse(data).map((p) => p.oferta_id));
}

export type PostulacionPropia = {
  id: string;
  creadaEl: string;
  /** Null if the applicant can no longer see the offer. */
  oferta: { id: string; titulo: string; lugar: string } | null;
};

/** The applicant's applications, newest first, without their status (RF1.2.4). */
export async function listarPostulacionesPropias(postulanteId: string): Promise<PostulacionPropia[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("postulaciones")
    .select("id, creada_el, ofertas(id, titulo, lugar)")
    .eq("postulante_id", postulanteId)
    .order("creada_el", { ascending: false });

  if (error) throw new Error("Could not load the applications.");
  return z
    .array(
      z.object({
        id: z.string(),
        creada_el: fechaSchema,
        ofertas: z.object({ id: z.string(), titulo: z.string(), lugar: z.string() }).nullable(),
      }),
    )
    .parse(data)
    .map((fila) => ({ id: fila.id, creadaEl: fila.creada_el, oferta: fila.ofertas }));
}

/**
 * Saves an application. Applying twice is not an error for the person (D-024):
 * the unique constraint rejects the duplicate (23505) and it counts as done.
 */
export async function crearPostulacion(postulanteId: string, ofertaId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("postulaciones").insert({ postulante_id: postulanteId, oferta_id: ofertaId });

  if (error && error.code !== "23505") throw new Error(`Could not save the application. Supabase error: ${error.message} (Code: ${error.code})`);
}

/**
 * The Office links an applicant to a published offer, as if they had applied
 * (P16, RF1.5.8). RLS allows it only on a published offer. Returns false when
 * the applicant already applied to it (the unique constraint, 23505).
 */
export async function crearPostulacionDeOficina(postulanteId: string, ofertaId: string): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("postulaciones")
    .insert({ postulante_id: postulanteId, oferta_id: ofertaId, origen: "oficina" });

  if (error?.code === "23505") return false;
  if (error) throw new Error("Could not save the application.");
  return true;
}

/**
 * Changes an application's status (RF1.5.6). The caller already checked that it
 * exists and the move is allowed. Referring stamps derivada_el in the database
 * (trigger antes_de_actualizar_postulacion).
 */
export async function actualizarEstadoPostulacion(id: string, estado: EstadoPostulacion): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("postulaciones").update({ estado }).eq("id", id);

  if (error) throw new Error("Could not update the application.");
}

/** Saves (or replaces) the pre-interview of an application (RF1.6.1, D-045). */
export async function guardarPreentrevista(id: string, preentrevista: { fecha: string; notas: string | null }): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("postulaciones")
    .update({ preentrevista_el: preentrevista.fecha, preentrevista_notas: preentrevista.notas })
    .eq("id", id);

  if (error) throw new Error("Could not save the pre-interview.");
}

/** How many applications there are, all of them or in one status (P14). */
export async function contarPostulaciones(estado?: EstadoPostulacion): Promise<number> {
  const supabase = await createClient();
  let consulta = supabase.from("postulaciones").select("id", { count: "exact", head: true });
  if (estado) consulta = consulta.eq("estado", estado);

  const { count, error } = await consulta;
  if (error) throw new Error("Could not count the applications.");
  return count ?? 0;
}

/** How many applications the Office ever referred to a company (P14, D-051). */
export async function contarDerivaciones(): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("postulaciones")
    .select("id", { count: "exact", head: true })
    .not("derivada_el", "is", null);

  if (error) throw new Error("Could not count the referrals.");
  return count ?? 0;
}

/** How many applications got this decision from the company: hires or rejections (P14, D-046, D-051). */
export async function contarDecisiones(decision: DecisionEmpresa): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("postulaciones")
    .select("id", { count: "exact", head: true })
    .eq("decision_empresa", decision);

  if (error) throw new Error("Could not count the company decisions.");
  return count ?? 0;
}

/** How many referred applications are still waiting for the company's decision (P14, D-054). */
export async function contarDerivadasSinDecision(): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("postulaciones")
    .select("id", { count: "exact", head: true })
    .eq("estado", "derivado")
    .is("decision_empresa", null);

  if (error) throw new Error("Could not count the pending decisions.");
  return count ?? 0;
}

const COLUMNAS_POSTULACION_ADMIN = `
  id, estado, creada_el,
  preentrevista_el, preentrevista_notas, derivada_el, decision_empresa, motivo_no_contratacion,
  ofertas (
    id, titulo, lugar, jornada, descripcion, sueldo,
    oferta_rubros ( rubros ( slug ) ),
    empresas ( razon_social, cuit, contacto_nombre, contacto_telefono, contacto_email )
  ),
  postulantes (
    id, nombre, apellido, dni, telefono, cv_nombre,
    perfiles ( email ),
    postulante_rubros ( rubros ( slug ) )
  )
`;

const filaPostulacionAdminSchema = z.object({
  id: z.string(),
  estado: estadoPostulacionSchema,
  creada_el: fechaSchema,
  preentrevista_el: fechaSchema.nullable(),
  preentrevista_notas: z.string().nullable(),
  derivada_el: fechaSchema.nullable(),
  decision_empresa: decisionEmpresaSchema.nullable(),
  motivo_no_contratacion: z.string().nullable(),
  ofertas: z.object({
    id: z.string(),
    titulo: z.string(),
    lugar: z.string(),
    jornada: z.string(),
    descripcion: z.string(),
    sueldo: z.string().nullable(),
    oferta_rubros: z.array(z.object({ rubros: z.object({ slug: z.string() }).nullable() })),
    empresas: z
      .object({
        razon_social: z.string().nullable(),
        cuit: z.string().nullable(),
        contacto_nombre: z.string().nullable(),
        contacto_telefono: z.string().nullable(),
        contacto_email: z.string().nullable(),
      })
      .nullable(),
  }),
  postulantes: z.object({
    id: z.string(),
    nombre: z.string().nullable(),
    apellido: z.string().nullable(),
    dni: z.string().nullable(),
    telefono: z.string().nullable(),
    cv_nombre: z.string().nullable(),
    perfiles: z.object({ email: z.string().nullable() }).nullable(),
    postulante_rubros: z.array(z.object({ rubros: z.object({ slug: z.string() }).nullable() })),
  }),
});

function aPostulacionAdmin(fila: z.infer<typeof filaPostulacionAdminSchema>): PostulacionAdmin {
  const { ofertas: o, postulantes: p } = fila;
  return {
    id: fila.id,
    estado: fila.estado,
    postuladoEl: fila.creada_el,
    preentrevista: fila.preentrevista_el ? { fecha: fila.preentrevista_el, notas: fila.preentrevista_notas } : null,
    derivadaEl: fila.derivada_el,
    decisionEmpresa: fila.decision_empresa,
    motivoNoContratacion: fila.motivo_no_contratacion,
    oferta: {
      id: o.id,
      titulo: o.titulo,
      lugar: o.lugar,
      jornada: o.jornada,
      descripcion: o.descripcion,
      sueldo: o.sueldo,
      rubros: o.oferta_rubros.flatMap((r) => (r.rubros ? [r.rubros.slug] : [])),
      empresa: o.empresas && {
        razonSocial: o.empresas.razon_social,
        cuit: o.empresas.cuit,
        contactoNombre: o.empresas.contacto_nombre,
        contactoTelefono: o.empresas.contacto_telefono,
        contactoEmail: o.empresas.contacto_email,
      },
    },
    postulante: {
      id: p.id,
      nombre: p.nombre,
      apellido: p.apellido,
      dni: p.dni,
      telefono: p.telefono,
      email: p.perfiles?.email ?? null,
      cvNombre: p.cv_nombre,
      rubros: p.postulante_rubros.flatMap((r) => (r.rubros ? [r.rubros.slug] : [])),
    },
  };
}

/**
 * Every application with its offer, company contact and applicant, oldest
 * first (Office queues and registers, D-042), or only one applicant's (P18).
 */
export async function listarPostulacionesAdmin(postulanteId?: string): Promise<PostulacionAdmin[]> {
  const supabase = await createClient();
  let consulta = supabase.from("postulaciones").select(COLUMNAS_POSTULACION_ADMIN);
  if (postulanteId) consulta = consulta.eq("postulante_id", postulanteId);

  const { data, error } = await consulta.order("creada_el", { ascending: true });
  if (error) throw new Error("Could not load the applications.");
  return z.array(filaPostulacionAdminSchema).parse(data).map(aPostulacionAdmin);
}

/** Referred applications without the company's decision, the oldest referral first (P14 queue, D-054). */
export async function listarDerivadasSinDecision(): Promise<PostulacionAdmin[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("postulaciones")
    .select(COLUMNAS_POSTULACION_ADMIN)
    .eq("estado", "derivado")
    .is("decision_empresa", null)
    .order("derivada_el", { ascending: true });

  if (error) throw new Error("Could not load the pending decisions.");
  return z.array(filaPostulacionAdminSchema).parse(data).map(aPostulacionAdmin);
}

/** One application as the Office sees it, or null when it does not exist. */
export async function leerPostulacionAdmin(id: string): Promise<PostulacionAdmin | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("postulaciones").select(COLUMNAS_POSTULACION_ADMIN).eq("id", id).maybeSingle();

  if (error) {
    if (error.code === "22P02") return null;
    throw new Error("Could not load the application.");
  }
  return data ? aPostulacionAdmin(filaPostulacionAdminSchema.parse(data)) : null;
}
