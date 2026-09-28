import { z } from "zod";

/*
 * Shape of a published job offer as the public list and the applicant see it
 * (P05, P06; D-024).
 *
 * PROVISIONAL (DT-002): the database is not modeled yet, so these fields are a
 * generic proposal. Replace them when the job_offers table exists, and keep
 * this file as the only place that describes the DTO.
 *
 * Deliberately missing:
 * - the company's name and contact data: the Office is the mandatory
 *   intermediary, so the applicant does not deal with the company directly
 *   (open question in DT-002);
 * - the offer status: this list only ever contains "published" offers (RF1.4.1).
 */
export const ofertaPublicaSchema = z.object({
  id: z.string().min(1),
  /** Job title, for example "Ayudante de cocina". */
  titulo: z.string().min(1),
  /** What the job is about, in the company's words. */
  descripcion: z.string(),
  /** What the person needs (experience, license, schedule availability…). */
  requisitos: z.string(),
  /** Where the job is, as free text (neighborhood or area of Funes). */
  lugar: z.string(),
  /** Working hours as free text, for example "Lunes a viernes de 8 a 16". */
  jornada: z.string(),
  /** When the Office published it (ISO 8601 with offset). */
  publicadaEl: z.iso.datetime({ offset: true }),
});

export const listaOfertasSchema = z.array(ofertaPublicaSchema);

export type OfertaPublica = z.infer<typeof ofertaPublicaSchema>;
