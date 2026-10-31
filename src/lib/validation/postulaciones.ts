import { z } from "zod";

import { rubroSchema } from "./rubros";

/*
 * Applications from the applicant's side (P06, P07; D-024).
 */

/** Body of POST /api/postulaciones. The applicant comes from the session, never from the body (AGENTS §7). */
export const postularseSchema = z.object({
  ofertaId: z.uuid("Falta la oferta"),
});

export type DatosPostularse = z.infer<typeof postularseSchema>;

/**
 * Application status (D-008), set by the Office (RF1.5.6). Only the Office
 * sees it; the applicant never does (RF1.2.4).
 */
export const estadoPostulacionSchema = z.enum(["postulado", "preseleccionado", "derivado", "no_apto"], {
  error: "Elegí un estado",
});

export type EstadoPostulacion = z.infer<typeof estadoPostulacionSchema>;

/**
 * One row of "Mis postulaciones" (P07): which offer, its details (workplace,
 * schedule, pay, trades, whether the offer is still active) and when the
 * applicant applied. Never includes the Office's internal evaluation status (RF1.2.4).
 */
export const postulacionPropiaSchema = z.object({
  id: z.string().min(1),
  /** When the applicant applied (ISO 8601). */
  postuladoEl: z.string().min(1),
  oferta: z.object({
    id: z.string().min(1),
    titulo: z.string().min(1),
    lugar: z.string(),
    jornada: z.string().nullable().optional(),
    sueldo: z.string().nullable().optional(),
    estadoOferta: z.enum(["pendiente", "publicada", "rechazada", "cerrada"]).nullable().optional(),
    rubros: z.array(rubroSchema).optional(),
  }),
});

export const listaPostulacionesSchema = z.array(postulacionPropiaSchema);

export type PostulacionPropia = z.infer<typeof postulacionPropiaSchema>;
