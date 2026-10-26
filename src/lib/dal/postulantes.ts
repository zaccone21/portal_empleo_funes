import "server-only";

import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import type { PerfilPostulante } from "@/lib/validation/postulante-perfil";
import { rubroSchema } from "@/lib/validation/rubros";

/** Columns of `postulantes` behind PerfilPostulante (P03). */
const COLUMNAS_POSTULANTE = "nombre, apellido, telefono, direccion, dni, experiencia, cv_ruta, cv_nombre, cv_tamano_bytes, cv_subido_el";

const filaPostulanteSchema = z.object({
  nombre: z.string().nullable(),
  apellido: z.string().nullable(),
  telefono: z.string().nullable(),
  direccion: z.string().nullable(),
  dni: z.string().nullable(),
  experiencia: z.string().nullable(),
  cv_ruta: z.string().nullable(),
  cv_nombre: z.string().nullable(),
  cv_tamano_bytes: z.number().nullable(),
  cv_subido_el: z.string().nullable(),
});

const filaRubroSchema = z.object({
  rubros: z.object({
    slug: z.string(),
    nombre: z.string(),
  }),
});

export type ResultadoLeerPerfilPostulante = {
  nombre: string | null;
  apellido: string | null;
  telefono: string | null;
  direccion: string | null;
  dni: string | null;
  experiencia: string | null;
  rubros: { slug: string; nombre: string }[];
  tieneCv: boolean;
};

export async function leerPerfilPostulante(postulanteId: string): Promise<ResultadoLeerPerfilPostulante | null> {
  const supabase = await createClient();
  
  const { data: datosPersonales, error: errDatos } = await supabase
    .from("postulantes")
    .select(COLUMNAS_POSTULANTE)
    .eq("id", postulanteId)
    .maybeSingle();

  if (errDatos) throw new Error("Could not load the applicant.");
  if (!datosPersonales) return null;

  const fila = filaPostulanteSchema.parse(datosPersonales);

  const { data: datosRubros, error: errRubros } = await supabase
    .from("postulante_rubros")
    .select("rubros (slug, nombre)")
    .eq("postulante_id", postulanteId);

  if (errRubros) throw new Error("Could not load the applicant's trades.");

  const rubros = (datosRubros || []).map((r) => {
    const valid = filaRubroSchema.parse(r);
    return {
      slug: rubroSchema.parse(valid.rubros.slug),
      nombre: valid.rubros.nombre,
    };
  });

  return {
    nombre: fila.nombre,
    apellido: fila.apellido,
    telefono: fila.telefono,
    direccion: fila.direccion,
    dni: fila.dni,
    experiencia: fila.experiencia,
    rubros,
    tieneCv: fila.cv_ruta !== null,
  };
}

export type ResultadoGuardarPostulante = { ok: true };

/** What P03 saves. `experiencia` undefined leaves it as it is; null erases it. */
export type DatosGuardarPerfilPostulante = Omit<PerfilPostulante, "experiencia"> & { experiencia?: string | null };

export async function guardarPerfilPostulante(
  postulanteId: string,
  perfil: DatosGuardarPerfilPostulante,
): Promise<ResultadoGuardarPostulante> {
  const supabase = await createClient();

  // 1. Update personal data
  const { error: errUpdate } = await supabase
    .from("postulantes")
    .update({
      nombre: perfil.nombre,
      apellido: perfil.apellido,
      telefono: perfil.telefono,
      direccion: perfil.direccion,
      ...(perfil.experiencia !== undefined ? { experiencia: perfil.experiencia } : {}),
    })
    .eq("id", postulanteId);

  if (errUpdate) throw new Error("Could not save the applicant's personal data.");

  // 2. Resolve trade IDs from slugs
  const { data: rubrosDb, error: errRubrosDb } = await supabase
    .from("rubros")
    .select("id, slug")
    .in("slug", perfil.rubros);

  if (errRubrosDb || !rubrosDb) throw new Error("Could not resolve trades.");
  
  // 3. Update trades (delete existing, insert new)
  // Deleting existing is safe because we only delete for this user and we are under their session (RLS)
  const { error: errDel } = await supabase
    .from("postulante_rubros")
    .delete()
    .eq("postulante_id", postulanteId);
    
  if (errDel) throw new Error("Could not clear old trades.");

  if (rubrosDb.length > 0) {
    const { error: errIns } = await supabase
      .from("postulante_rubros")
      .insert(
        rubrosDb.map((r) => ({
          postulante_id: postulanteId,
          rubro_id: r.id,
        }))
      );
    
    if (errIns) throw new Error("Could not save new trades.");
  }

  return { ok: true };
}

/**
 * Checks if the applicant has filled in all mandatory fields to apply to an offer.
 * The applicant must have nombre, apellido, telefono, direccion, dni, and at least one rubro (D-070).
 */
export async function perfilCompletoPostulante(postulanteId: string): Promise<boolean> {
  const perfil = await leerPerfilPostulante(postulanteId);
  if (!perfil) return false;
  
  return (
    perfil.nombre !== null &&
    perfil.apellido !== null &&
    perfil.telefono !== null &&
    perfil.direccion !== null &&
    perfil.dni !== null &&
    perfil.rubros.length > 0
  );
}

export type FiltrosBusquedaPostulantes = {
  q?: string;
  rubros?: string[];
};

export type ResultadoBusquedaPostulante = {
  id: string;
  nombre: string | null;
  apellido: string | null;
  telefono: string | null;
  /** Street and number or area of Funes (D-070); only the Office sees it. */
  direccion: string | null;
  dni: string | null;
  email: string | null;
  rubros: string[];
  cvSubidoEl: string | null;
  /** Work experience (RF1.6.7); only the Office sees it. */
  experiencia: string | null;
};

const filaBusquedaSchema = z.object({
  id: z.string(),
  nombre: z.string().nullable(),
  apellido: z.string().nullable(),
  telefono: z.string().nullable().optional(),
  direccion: z.string().nullable().optional(),
  dni: z.string().nullable().optional(),
  experiencia: z.string().nullable(),
  cv_subido_el: z.string().nullable(),
  perfiles: z.object({ email: z.string().nullable() }).nullable().optional(),
  postulante_rubros: z.array(
    z.object({
      rubros: z.object({
        slug: z.string(),
        nombre: z.string(),
      }).nullable().optional(),
    })
  ).nullable().optional(),
});

/**
 * Searches for applicants matching the given filters. Only accessible by admins.
 * Returns only partial public profile data needed for the Office's search list.
 */
export async function buscarPostulantes(
  filtros: FiltrosBusquedaPostulantes
): Promise<ResultadoBusquedaPostulante[]> {
  const supabase = await createClient();

  let query = supabase.from("postulantes").select(`
    id,
    nombre,
    apellido,
    telefono,
    direccion,
    dni,
    experiencia,
    cv_subido_el,
    perfiles ( email ),
    postulante_rubros (
      rubros (
        slug,
        nombre
      )
    )
  `);

  if (filtros.q && filtros.q.trim()) {
    const qLimpio = filtros.q.trim().replace(/[,()]/g, "");
    if (qLimpio) {
      query = query.or(`nombre.ilike.%${qLimpio}%,apellido.ilike.%${qLimpio}%,dni.ilike.%${qLimpio}%`);
    }
  }
  
  query = query.order("apellido", { ascending: true, nullsFirst: false });

  const { data, error } = await query;
  if (error) throw new Error("Error al buscar postulantes: " + error.message);

  let resultados: ResultadoBusquedaPostulante[] = (data ?? []).map((raw) => {
    const row = filaBusquedaSchema.parse(raw);
    const rubros = (row.postulante_rubros ?? [])
      .map((item) => item.rubros?.slug)
      .filter((slug): slug is string => Boolean(slug));

    return {
      id: row.id,
      nombre: row.nombre,
      apellido: row.apellido,
      telefono: row.telefono ?? null,
      direccion: row.direccion ?? null,
      dni: row.dni ?? null,
      email: row.perfiles?.email ?? null,
      cvSubidoEl: row.cv_subido_el,
      experiencia: row.experiencia,
      rubros,
    };
  });

  if (filtros.rubros && filtros.rubros.length > 0) {
    resultados = resultados.filter((p) => p.rubros.some((r) => filtros.rubros!.includes(r)));
  }

  return resultados;
}

export async function leerPerfilPostulanteAdmin(postulanteId: string): Promise<ResultadoBusquedaPostulante | null> {
  const supabase = await createClient();

  const { data, error } = await supabase.from("postulantes").select(`
    id,
    nombre,
    apellido,
    telefono,
    direccion,
    dni,
    experiencia,
    cv_subido_el,
    perfiles ( email ),
    postulante_rubros (
      rubros (
        slug,
        nombre
      )
    )
  `).eq("id", postulanteId).maybeSingle();

  if (error || !data) return null;

  const row = filaBusquedaSchema.parse(data);
  const rubros = (row.postulante_rubros ?? [])
    .map((item) => item.rubros?.slug)
    .filter((slug): slug is string => Boolean(slug));

  return {
    id: row.id,
    nombre: row.nombre,
    apellido: row.apellido,
    telefono: row.telefono ?? null,
    direccion: row.direccion ?? null,
    dni: row.dni ?? null,
    email: row.perfiles?.email ?? null,
    cvSubidoEl: row.cv_subido_el,
    experiencia: row.experiencia,
    rubros,
  };
}

/** How many applicants have an account (P14, D-051). Office accounts have no row here (docs/modelo_datos.md). */
export async function contarPostulantes(): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase.from("postulantes").select("id", { count: "exact", head: true });

  if (error) throw new Error("Could not count the applicants.");
  return count ?? 0;
}
