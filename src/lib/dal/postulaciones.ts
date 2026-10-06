import "server-only";

import { z } from "zod";

import { fechaSchema } from "@/lib/dal/fecha";
import { createClient } from "@/lib/supabase/server";
import { estadoPostulacionSchema, type EstadoPostulacion } from "@/lib/validation/postulaciones";

/*
 * Applications in the database (`postulaciones`). RLS lets an applicant see
 * only their own and the Office all of them; companies see none (D-023).
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

export type PostulacionDeOferta = {
  id: string;
  estado: EstadoPostulacion;
  creadaEl: string;
  email: string;
  cv: { nombre: string; tamanoBytes: number } | null;
};

const COLUMNAS_POSTULACION_OFICINA = "id, estado, creada_el, postulantes(cv_nombre, cv_tamano_bytes, perfiles(email))";

const filaPostulacionOficinaSchema = z.object({
  id: z.string(),
  estado: estadoPostulacionSchema,
  creada_el: fechaSchema,
  postulantes: z.object({
    cv_nombre: z.string().nullable(),
    cv_tamano_bytes: z.number().nullable(),
    perfiles: z.object({ email: z.string() }),
  }),
});

function aPostulacionDeOferta(fila: z.infer<typeof filaPostulacionOficinaSchema>): PostulacionDeOferta {
  const { cv_nombre, cv_tamano_bytes, perfiles } = fila.postulantes;
  return {
    id: fila.id,
    estado: fila.estado,
    creadaEl: fila.creada_el,
    email: perfiles.email,
    cv: cv_nombre !== null && cv_tamano_bytes !== null ? { nombre: cv_nombre, tamanoBytes: cv_tamano_bytes } : null,
  };
}

/** The applications to one offer, in arrival order (P15, RF1.5.5). Only the Office gets rows. */
export async function listarPostulacionesDeOferta(ofertaId: string): Promise<PostulacionDeOferta[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("postulaciones")
    .select(COLUMNAS_POSTULACION_OFICINA)
    .eq("oferta_id", ofertaId)
    .order("creada_el", { ascending: true });

  if (error) throw new Error("Could not load the applications.");
  return z.array(filaPostulacionOficinaSchema).parse(data).map(aPostulacionDeOferta);
}

/** Changes an application's status (RF1.5.6). Null when it does not exist. */
export async function actualizarEstadoPostulacion(id: string, estado: EstadoPostulacion): Promise<PostulacionDeOferta | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("postulaciones")
    .update({ estado })
    .eq("id", id)
    .select(COLUMNAS_POSTULACION_OFICINA)
    .maybeSingle();

  if (error) throw new Error("Could not update the application.");
  return data ? aPostulacionDeOferta(filaPostulacionOficinaSchema.parse(data)) : null;
}

/** Where the CV of an application's applicant is stored, or null (no such application, or no CV yet). */
export async function leerRutaCvDePostulacion(id: string): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("postulaciones").select("postulantes(cv_ruta)").eq("id", id).maybeSingle();

  if (error) throw new Error("Could not load the application.");
  if (!data) return null;
  return z.object({ postulantes: z.object({ cv_ruta: z.string().nullable() }) }).parse(data).postulantes.cv_ruta;
}

/** How many applications are in a status (P14). */
export async function contarPostulaciones(estado: EstadoPostulacion): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("postulaciones")
    .select("id", { count: "exact", head: true })
    .eq("estado", estado);

  if (error) throw new Error("Could not count the applications.");
  return count ?? 0;
}

export type PostulacionReciente = {
  id: string;
  ofertaId: string;
  ofertaTitulo: string;
  postulanteNombre: string | null;
  postulanteApellido: string | null;
  estado: EstadoPostulacion;
  creadaEl: string;
};

export async function listarUltimasPostulaciones(limite = 5): Promise<PostulacionReciente[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("postulaciones")
    .select(`
      id, estado, creada_el,
      ofertas ( id, titulo ),
      postulantes ( nombre, apellido )
    `)
    .order("creada_el", { ascending: false })
    .limit(limite);

  if (error) throw new Error("Could not load latest applications: " + error.message);

  return data.map((row) => {
    const oferta = row.ofertas as unknown as { id: string; titulo: string };
    const postulante = row.postulantes as unknown as { nombre: string | null; apellido: string | null };
    return {
      id: row.id,
      ofertaId: oferta.id,
      ofertaTitulo: oferta.titulo,
      postulanteNombre: postulante.nombre,
      postulanteApellido: postulante.apellido,
      estado: row.estado as EstadoPostulacion,
      creadaEl: row.creada_el,
    };
  });
}
