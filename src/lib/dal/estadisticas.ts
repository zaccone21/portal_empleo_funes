import "server-only";

import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import type { EstadisticasPublicas } from "@/lib/validation/estadisticas";

const filaSchema = z.object({
  ofertas_publicadas: z.number(),
  empresas: z.number(),
  postulantes: z.number(),
  derivaciones: z.number(),
  contrataciones: z.number(),
});

/**
 * The public totals of the home page (D-059), from the database function
 * `estadisticas_publicas`. It works without a session: the function returns
 * only counts, so RLS stays closed on the tables themselves.
 */
export async function contarEstadisticasPublicas(): Promise<EstadisticasPublicas> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("estadisticas_publicas");

  if (error) throw new Error("Could not count the public figures.");
  const fila = filaSchema.parse(data);
  return {
    ofertasPublicadas: fila.ofertas_publicadas,
    empresas: fila.empresas,
    postulantes: fila.postulantes,
    derivaciones: fila.derivaciones,
    contrataciones: fila.contrataciones,
  };
}
