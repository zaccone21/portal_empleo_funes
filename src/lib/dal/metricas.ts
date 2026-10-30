import "server-only";

import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const filaVisitaDiariaSchema = z.object({
  fecha: z.iso.date(),
  cantidad: z.number().int().nonnegative(),
});

export type VisitaDiaria = z.infer<typeof filaVisitaDiariaSchema>;

/**
 * Reads the daily visit counts from `visitas_diarias`.
 * Returns an empty array if the table does not exist yet in the database
 * (before migration 20261028180000 is applied).
 */
export async function listarVisitasDiarias(): Promise<VisitaDiaria[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("visitas_diarias")
      .select("fecha, cantidad")
      .order("fecha", { ascending: true });

    if (error || !data) return [];
    const parsed = z.array(filaVisitaDiariaSchema).safeParse(data);
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}
