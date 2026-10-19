import { z } from "zod";

/*
 * What a company sees of the applicants the Office referred to its offers, and
 * what it answers (P17; RF1.6.3, RF1.6.4; D-044). Never the DNI, the
 * pre-interview or the Office's status.
 */

/** The company's decision on a referred applicant (D-044). Null while it has not answered. */
export const decisionEmpresaSchema = z.enum(["contratado", "no_contratado"], {
  error: "Elegí si contratás o no a esta persona",
});

export type DecisionEmpresa = z.infer<typeof decisionEmpresaSchema>;

/**
 * Body of the decision. Not hiring needs the reason (RF1.6.4); when hiring, any
 * reason sent is ignored by the use case. It is answered once (D-044).
 */
export const decisionCandidatoSchema = z
  .object({
    decision: decisionEmpresaSchema,
    motivo: z.string().trim().max(500, "Puede tener hasta 500 caracteres").optional(),
  })
  .refine((datos) => datos.decision === "contratado" || Boolean(datos.motivo), {
    error: "Contanos por qué no contratás a esta persona",
    path: ["motivo"],
  });

export type DatosDecisionCandidato = z.infer<typeof decisionCandidatoSchema>;

/** One referred applicant as the company sees them (D-044). */
export const candidatoDerivadoSchema = z.object({
  postulacionId: z.string().min(1),
  oferta: z.object({ id: z.string().min(1), titulo: z.string() }),
  /** When the Office referred them (ISO 8601 with offset). */
  derivadoEl: z.iso.datetime({ offset: true }).nullable(),
  nombre: z.string().nullable(),
  apellido: z.string().nullable(),
  telefono: z.string().nullable(),
  email: z.string().nullable(),
  rubros: z.array(z.string()),
  /** The CV opens through /api/empresa/candidatos/[id]/cv, with a short-lived signed link (RNF1). */
  tieneCv: z.boolean(),
  decision: decisionEmpresaSchema.nullable(),
  motivoNoContratacion: z.string().nullable(),
});

export const listaCandidatosSchema = z.array(candidatoDerivadoSchema);

/** Answer of POST /api/empresa/candidatos/[id]/decision. */
export const respuestaCandidatoSchema = z.object({ candidato: candidatoDerivadoSchema });

export type CandidatoDerivado = z.infer<typeof candidatoDerivadoSchema>;
