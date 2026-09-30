import { z } from "zod";

import { rubroSchema } from "./rubros";
import { textoObligatorio } from "./texto";

/** Most trades an offer can have (D-032). */
export const MAXIMO_RUBROS_OFERTA = 3;

/**
 * The offer's trades, 1 to 3 (D-032): a job that spans two trades (a delivery
 * driver for a restaurant) shows up under both filters, and the cap keeps an
 * offer from ticking every trade to appear everywhere.
 */
const rubrosOfertaSchema = z
  .array(rubroSchema, { error: "Elegí al menos un rubro" })
  .min(1, "Elegí al menos un rubro")
  .max(MAXIMO_RUBROS_OFERTA, `Podés elegir hasta ${MAXIMO_RUBROS_OFERTA} rubros`);

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
 * - the offer status: this list only ever contains "publicada" offers (RF1.4.1).
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
  /** Pay as free text ("A convenir" or an amount), or null when the company left it out (D-032). */
  sueldo: z.string().nullable(),
  /** Trades or sectors, 1 to 3, for the catalog filter (D-029, D-032). */
  rubros: rubrosOfertaSchema,
  /** When the Office published it (ISO 8601 with offset). */
  publicadaEl: z.iso.datetime({ offset: true }),
  /**
   * The logged-in applicant already applied to it (D-028). False for anyone
   * else. It is not an application status: it only says "you applied", which
   * the applicant already knows (RF1.2.4).
   */
  yaTePostulaste: z.boolean(),
});

export const listaOfertasSchema = z.array(ofertaPublicaSchema);

export type OfertaPublica = z.infer<typeof ofertaPublicaSchema>;

/** Offer status (D-008). The UI shows it in Spanish; see EstadoOferta. */
export const estadoOfertaSchema = z.enum(["pendiente", "publicada", "rechazada", "cerrada"]);

export type EstadoOferta = z.infer<typeof estadoOfertaSchema>;

/**
 * Form of a new offer (P11, RF1.3.3): every field is required. There is no
 * draft (D-007): once sent, the offer is "pendiente" until the Office reviews it.
 * Body of POST /api/empresa/ofertas. PROVISIONAL fields (DT-002).
 */
export const nuevaOfertaSchema = z.object({
  titulo: textoObligatorio("Ingresá el puesto que buscás", 120),
  descripcion: textoObligatorio("Contá qué tareas incluye el puesto", 3000),
  requisitos: textoObligatorio("Contá qué necesita tener la persona", 2000),
  lugar: textoObligatorio("Indicá dónde es el trabajo", 120),
  jornada: textoObligatorio("Indicá los días y el horario", 120),
  /** Optional (D-032): an empty field means the offer shows no pay. */
  sueldo: z.string().trim().max(120, "Puede tener hasta 120 caracteres").optional(),
  rubros: rubrosOfertaSchema,
});

export type DatosNuevaOferta = z.infer<typeof nuevaOfertaSchema>;

/**
 * An offer as its own company sees it (P12, RF1.3.4–RF1.3.6): the offer data
 * plus its status, the rejection reason (only on rejected offers, and only for
 * the owning company, RF1.3.5) and whether the company asked to close it
 * (RF1.3.6: a flag, not a status; the offer stays published, D-008).
 * Never includes anything about applicants: companies do not see them.
 */
export const ofertaEmpresaSchema = nuevaOfertaSchema.extend({
  id: z.string().min(1),
  sueldo: z.string().nullable(),
  estado: estadoOfertaSchema,
  motivoRechazo: z.string().nullable(),
  cierreSolicitado: z.boolean(),
  /** When the company sent it (ISO 8601 with offset). */
  creadaEl: z.iso.datetime({ offset: true }),
});

export const listaOfertasEmpresaSchema = z.array(ofertaEmpresaSchema);

/** Answer of the endpoints that create or change one offer. */
export const respuestaOfertaEmpresaSchema = z.object({ oferta: ofertaEmpresaSchema });

export type OfertaEmpresa = z.infer<typeof ofertaEmpresaSchema>;
