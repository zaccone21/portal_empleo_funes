import "server-only";

import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import type { DerivacionCurso } from "@/lib/validation/oficina";

/*
 * Course referrals (`derivaciones_curso`; P19, RF1.6.6, D-047). RLS lets only
 * the Office read and create them; nobody edits or deletes them.
 */

const filaDerivacionSchema = z.object({
  id: z.string(),
  curso: z.string(),
  derivada_el: z.iso.date(),
  notas: z.string().nullable(),
});

function aDerivacionCurso(fila: z.infer<typeof filaDerivacionSchema>): DerivacionCurso {
  return { id: fila.id, curso: fila.curso, fecha: fila.derivada_el, notas: fila.notas };
}

/** One applicant's course referrals, the newest first. */
export async function listarDerivacionesCurso(postulanteId: string): Promise<DerivacionCurso[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("derivaciones_curso")
    .select("id, curso, derivada_el, notas")
    .eq("postulante_id", postulanteId)
    .order("derivada_el", { ascending: false });

  if (error) throw new Error("Could not load the course referrals.");
  return z.array(filaDerivacionSchema).parse(data).map(aDerivacionCurso);
}

/** Saves a course referral. Without a date, the database takes today's. */
export async function crearDerivacionCurso(
  postulanteId: string,
  datos: { curso: string; fecha?: string; notas: string | null },
): Promise<DerivacionCurso> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("derivaciones_curso")
    .insert({
      postulante_id: postulanteId,
      curso: datos.curso,
      notas: datos.notas,
      ...(datos.fecha ? { derivada_el: datos.fecha } : {}),
    })
    .select("id, curso, derivada_el, notas")
    .single();

  if (error) throw new Error("Could not save the course referral.");
  return aDerivacionCurso(filaDerivacionSchema.parse(data));
}

/** How many course referrals the Office registered (P14, D-051). */
export async function contarDerivacionesCurso(): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase.from("derivaciones_curso").select("id", { count: "exact", head: true });

  if (error) throw new Error("Could not count the course referrals.");
  return count ?? 0;
}
