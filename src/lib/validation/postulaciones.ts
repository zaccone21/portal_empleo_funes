import { z } from "zod";

/*
 * Applications from the applicant's side (P06, P07; D-024).
 * PROVISIONAL (DT-002): fields to be replaced when the database is modeled.
 */

/** Body of POST /api/postulaciones. The applicant comes from the session, never from the body (AGENTS §7). */
export const postularseSchema = z.object({
  ofertaId: z.string().min(1, "Falta la oferta"),
});

export type DatosPostularse = z.infer<typeof postularseSchema>;

/**
 * One row of "Mis postulaciones" (P07): which offer and when. There is no
 * status field on purpose: the applicant never sees the Office's internal
 * evaluation (RF1.2.4). Zod drops unknown keys when parsing, so even if the
 * server sent a status by mistake, it would not reach the screen.
 */
export const postulacionPropiaSchema = z.object({
  id: z.string().min(1),
  /** When the applicant applied (ISO 8601 with offset). */
  postuladoEl: z.iso.datetime({ offset: true }),
  oferta: z.object({
    id: z.string().min(1),
    titulo: z.string().min(1),
    lugar: z.string(),
  }),
});

export const listaPostulacionesSchema = z.array(postulacionPropiaSchema);

export type PostulacionPropia = z.infer<typeof postulacionPropiaSchema>;
