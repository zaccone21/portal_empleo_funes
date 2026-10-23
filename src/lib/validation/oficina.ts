import { z } from "zod";

import type { DecisionEmpresa } from "./candidatos";
import { ofertaEmpresaSchema } from "./ofertas";
import { estadoPostulacionSchema } from "./postulaciones";
import { textoObligatorio } from "./texto";

/*
 * What the Employment Office sees and sends (P14, P15; D-030, D-042). The
 * Office is the intermediary, so it is the only role that sees both sides:
 * the company's contact data and the applicants of each offer.
 */

/** The company's contact data, as the Office needs it to talk to them. Null if the company never filled it in. */
const empresaDeOfertaSchema = z
  .object({
    razonSocial: z.string(),
    cuit: z.string(),
    contactoNombre: z.string(),
    contactoTelefono: z.string(),
    contactoEmail: z.string(),
  })
  .nullable();

/**
 * An offer as the Office sees it: everything the company sees, plus the
 * account email of the company, its contact data, when it was published and
 * how many applications it has.
 */
export const ofertaOficinaSchema = ofertaEmpresaSchema.extend({
  publicadaEl: z.iso.datetime({ offset: true }).nullable(),
  empresaId: z.string(),
  emailEmpresa: z.string(),
  empresa: empresaDeOfertaSchema,
  cantidadPostulaciones: z.number().int().nonnegative(),
});

export type OfertaOficina = z.infer<typeof ofertaOficinaSchema>;

/** The pre-interview (RF1.6.1, D-045): the date is required, the notes are optional. Only the Office sees it. */
export const preentrevistaSchema = z.object({
  fecha: z.iso.datetime({ offset: true, error: "Elegí la fecha de la preentrevista" }),
  notas: z.string().trim().max(2000, "Puede tener hasta 2000 caracteres").optional(),
});

export type DatosPreentrevista = z.infer<typeof preentrevistaSchema>;

/** A course referral (RF1.6.6, D-047). Without a date, the database takes today's. */
export const derivacionCursoSchema = z.object({
  curso: textoObligatorio("Escribí el nombre del curso", 120),
  fecha: z.iso.date({ error: "Elegí una fecha válida" }).optional(),
  notas: z.string().trim().max(1000, "Puede tener hasta 1000 caracteres").optional(),
});

export type DatosDerivacionCurso = z.infer<typeof derivacionCursoSchema>;

/** One course referral of an applicant (P19). `fecha` is a day, YYYY-MM-DD. */
export type DerivacionCurso = {
  id: string;
  curso: string;
  fecha: string;
  notas: string | null;
};

/**
 * Counts of one applicant's follow-up (P18, D-046, D-054). Computed from their
 * applications, never stored. A rejection is the company's "No contrata"; the
 * Office's "No apto" is counted apart.
 */
export type ResumenSeguimiento = {
  postulaciones: number;
  /** Pre-selected or referred: the Office found the profile fit. */
  preseleccionadas: number;
  derivadas: number;
  contrataciones: number;
  rechazos: number;
  noApto: number;
  derivacionesCurso: number;
};

/** The Office panel's indicators (P14, D-051), counted on the real data. */
export type IndicadoresOficina = {
  postulantes: number;
  ofertasActivas: number;
  postulaciones: number;
  derivaciones: number;
  contrataciones: number;
  rechazos: number;
  derivacionesCurso: number;
  /** Referred applications still waiting for the company's decision (D-054). */
  sinRespuesta: number;
};

/**
 * An application seen across all offers (queues and registers of the Office, D-042):
 * who applied, to what offer, the offer's company contact, the applicant's data,
 * and the follow-up: pre-interview, referral and the company's decision (D-044,
 * D-045, D-054). Only the Office gets this.
 */
export type PostulacionAdmin = {
  id: string;
  estado: z.infer<typeof estadoPostulacionSchema>;
  postuladoEl: string;
  /** Null when there was no pre-interview (it is optional, D-045). */
  preentrevista: { fecha: string; notas: string | null } | null;
  /** When the Office referred it to the company; the database stamps it. */
  derivadaEl: string | null;
  /** Null while the company has not answered. */
  decisionEmpresa: DecisionEmpresa | null;
  motivoNoContratacion: string | null;
  oferta: {
    id: string;
    titulo: string;
    lugar: string;
    jornada: string;
    descripcion: string;
    requisitos: string;
    sueldo: string | null;
    rubros: string[];
    /** The company's account id, to open its file from the evaluation. */
    empresaId: string;
    empresa: {
      razonSocial: string | null;
      cuit: string | null;
      descripcion: string | null;
      contactoNombre: string | null;
      contactoTelefono: string | null;
      contactoEmail: string | null;
    } | null;
  };
  postulante: {
    id: string;
    nombre: string | null;
    apellido: string | null;
    dni: string | null;
    telefono: string | null;
    email: string | null;
    cvNombre: string | null;
    rubros: string[];
  };
};
