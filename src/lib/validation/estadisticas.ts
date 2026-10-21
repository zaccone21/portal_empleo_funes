import { z } from "zod";

/**
 * The portal's public figures on the home page (P01, D-059): totals only,
 * never rows or personal data. Counted by the database function
 * `estadisticas_publicas` (migration 20261020220000).
 */
export const estadisticasPublicasSchema = z.object({
  ofertasPublicadas: z.number().int().nonnegative(),
  empresas: z.number().int().nonnegative(),
  postulantes: z.number().int().nonnegative(),
  derivaciones: z.number().int().nonnegative(),
  contrataciones: z.number().int().nonnegative(),
});

export type EstadisticasPublicas = z.infer<typeof estadisticasPublicasSchema>;
