import "server-only";

import { z } from "zod";

import { fechaSchema } from "@/lib/dal/fecha";
import { createClient } from "@/lib/supabase/server";
import type { CursoOficina, DatosCursoCatalogo } from "@/lib/validation/oficina";

/*
 * Catalog of training courses managed by the Employment Office (`public.cursos`).
 * Protected by RLS so only operators (`admin`) can read, create or toggle courses.
 */

const filaCursoSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  descripcion: z.string().nullable(),
  modalidad: z.string().nullable(),
  horario: z.string().nullable(),
  activo: z.boolean(),
  creado_el: fechaSchema,
});

function aCursoOficina(fila: z.infer<typeof filaCursoSchema>): CursoOficina {
  return {
    id: fila.id,
    nombre: fila.nombre,
    descripcion: fila.descripcion,
    modalidad: fila.modalidad,
    horario: fila.horario,
    activo: fila.activo,
    creadoEl: fila.creado_el,
  };
}

const COLUMNAS_CURSO = "id, nombre, descripcion, modalidad, horario, activo, creado_el";

/**
 * Lists all courses in the Office's catalog (or only active ones), newest first.
 * If the migration `20261028140000` has not been applied yet (42P01), returns `[]`
 * so the Office screens keep working.
 */
export async function listarCursos(soloActivos = false): Promise<CursoOficina[]> {
  const supabase = await createClient();
  let consulta = supabase.from("cursos").select(COLUMNAS_CURSO);
  if (soloActivos) {
    consulta = consulta.eq("activo", true);
  }

  const { data, error } = await consulta.order("creado_el", { ascending: false });
  if (error) {
    if (error.code === "42P01" || error.code === "PGRST205") return [];
    throw new Error("Could not load the courses catalog.");
  }

  return z.array(filaCursoSchema).parse(data).map(aCursoOficina);
}

/** Reads a single course from the catalog, or null if it does not exist. */
export async function leerCurso(id: string): Promise<CursoOficina | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("cursos").select(COLUMNAS_CURSO).eq("id", id).maybeSingle();

  if (error) {
    if (error.code === "22P02" || error.code === "42P01" || error.code === "PGRST205") return null;
    throw new Error("Could not load the course.");
  }

  return data ? aCursoOficina(filaCursoSchema.parse(data)) : null;
}

/** Creates a new training course in the Office catalog. */
export async function crearCurso(datos: DatosCursoCatalogo): Promise<CursoOficina> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cursos")
    .insert({
      nombre: datos.nombre.trim(),
      descripcion: datos.descripcion?.trim() || null,
      modalidad: datos.modalidad?.trim() || null,
      horario: datos.horario?.trim() || null,
    })
    .select(COLUMNAS_CURSO)
    .single();

  if (error) throw new Error("Could not create the course.");
  return aCursoOficina(filaCursoSchema.parse(data));
}

/** Activates or pauses a course in the catalog. */
export async function cambiarEstadoCurso(id: string, activo: boolean): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("cursos").update({ activo }).eq("id", id);

  if (error) throw new Error("Could not update the course status.");
}
