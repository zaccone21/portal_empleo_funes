import "server-only";

import { z } from "zod";

import { fechaSchema } from "@/lib/dal/fecha";
import { createAdminClient } from "@/lib/supabase/admin";
import { decisionEmpresaSchema, type DecisionEmpresa } from "@/lib/validation/candidatos";
import { estadoPostulacionSchema, type EstadoPostulacion } from "@/lib/validation/postulaciones";

/*
 * The applicants the Office referred to a company's offers (P17; D-044).
 * Companies have no RLS policy on postulaciones or postulantes (DT-019), so
 * this file uses the admin client, which bypasses RLS. Only the company use
 * cases call it, after checking the role and that the offer is the company's
 * own. It selects only what the company may see: never the DNI, the
 * pre-interview or other applications.
 */

export type Candidato = {
  postulacionId: string;
  postulanteId: string;
  /** The company that owns the offer: the use case compares it with the session. */
  empresaId: string;
  estado: EstadoPostulacion;
  oferta: { id: string; titulo: string };
  derivadoEl: string | null;
  nombre: string | null;
  apellido: string | null;
  telefono: string | null;
  email: string | null;
  rubros: string[];
  tieneCv: boolean;
  decision: DecisionEmpresa | null;
  motivoNoContratacion: string | null;
};

const COLUMNAS_CANDIDATO = `
  id, estado, derivada_el, decision_empresa, motivo_no_contratacion,
  ofertas!inner ( id, titulo, empresa_id ),
  postulantes ( id, nombre, apellido, telefono, cv_ruta, perfiles ( email ), postulante_rubros ( rubros ( slug ) ) )
`;

const filaCandidatoSchema = z.object({
  id: z.string(),
  estado: estadoPostulacionSchema,
  derivada_el: fechaSchema.nullable(),
  decision_empresa: decisionEmpresaSchema.nullable(),
  motivo_no_contratacion: z.string().nullable(),
  ofertas: z.object({ id: z.string(), titulo: z.string(), empresa_id: z.string() }),
  postulantes: z.object({
    id: z.string(),
    nombre: z.string().nullable(),
    apellido: z.string().nullable(),
    telefono: z.string().nullable(),
    cv_ruta: z.string().nullable(),
    perfiles: z.object({ email: z.string().nullable() }).nullable(),
    postulante_rubros: z.array(z.object({ rubros: z.object({ slug: z.string() }).nullable() })),
  }),
});

function aCandidato(fila: z.infer<typeof filaCandidatoSchema>): Candidato {
  const p = fila.postulantes;
  return {
    postulacionId: fila.id,
    postulanteId: p.id,
    empresaId: fila.ofertas.empresa_id,
    estado: fila.estado,
    oferta: { id: fila.ofertas.id, titulo: fila.ofertas.titulo },
    derivadoEl: fila.derivada_el,
    nombre: p.nombre,
    apellido: p.apellido,
    telefono: p.telefono,
    email: p.perfiles?.email ?? null,
    rubros: p.postulante_rubros.flatMap((r) => (r.rubros ? [r.rubros.slug] : [])),
    tieneCv: p.cv_ruta !== null,
    decision: fila.decision_empresa,
    motivoNoContratacion: fila.motivo_no_contratacion,
  };
}

/**
 * The applicants referred to one company's offers, or to one of them, the
 * oldest referral first. Filtered by company here too, so a use case mistake
 * cannot list another company's applicants.
 */
export async function listarCandidatosDerivados(empresaId: string, ofertaId?: string): Promise<Candidato[]> {
  const supabase = createAdminClient();
  let consulta = supabase
    .from("postulaciones")
    .select(COLUMNAS_CANDIDATO)
    .eq("estado", "derivado")
    .eq("ofertas.empresa_id", empresaId);
  if (ofertaId) consulta = consulta.eq("oferta_id", ofertaId);

  const { data, error } = await consulta.order("derivada_el", { ascending: true });
  if (error) throw new Error("Could not load the referred applicants.");
  return z.array(filaCandidatoSchema).parse(data).map(aCandidato);
}

/** One application with the data the company may see, or null when it does not exist. */
export async function leerCandidato(postulacionId: string): Promise<Candidato | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("postulaciones").select(COLUMNAS_CANDIDATO).eq("id", postulacionId).maybeSingle();

  if (error) {
    if (error.code === "22P02") return null;
    throw new Error("Could not load the referred applicant.");
  }
  return data ? aCandidato(filaCandidatoSchema.parse(data)) : null;
}

/**
 * Saves the company's decision (D-044). The update only touches an application
 * without a decision, so two answers sent at once cannot both win; returns
 * false when it was already decided.
 */
export async function guardarDecisionEmpresa(
  postulacionId: string,
  decision: DecisionEmpresa,
  motivo: string | null,
): Promise<boolean> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("postulaciones")
    .update({ decision_empresa: decision, motivo_no_contratacion: motivo })
    .eq("id", postulacionId)
    .is("decision_empresa", null)
    .select("id");

  if (error) throw new Error("Could not save the company's decision.");
  return z.array(z.object({ id: z.string() })).parse(data).length > 0;
}
