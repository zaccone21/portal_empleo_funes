import { z } from "zod";

/*
 * Fixed reasons for the Office to reject a company or an offer (D-069). The
 * operator picks one and may add an optional note. The database keeps the
 * final sentence in `motivo_rechazo` (see `armarMotivoRechazo`), so there is no
 * extra column, and the company reads plain Spanish (RF1.3.5).
 */

/** Longest optional note. Together with the longest label it stays under the 500 characters of `motivo_rechazo`. */
export const MAXIMO_OBSERVACION = 400;

const observacionSchema = z.string().trim().max(MAXIMO_OBSERVACION, `Puede tener hasta ${MAXIMO_OBSERVACION} caracteres`).optional();

export const motivoRechazoEmpresaSchema = z.enum([
  "datos_incompletos",
  "cuit_no_verificable",
  "contacto_incorrecto",
  "perfil_inapropiado",
  "otro",
]);

export type MotivoRechazoEmpresa = z.infer<typeof motivoRechazoEmpresaSchema>;

export const ETIQUETA_MOTIVO_EMPRESA: Record<MotivoRechazoEmpresa, string> = {
  datos_incompletos: "Faltan datos de la empresa",
  cuit_no_verificable: "No pudimos verificar el CUIT",
  contacto_incorrecto: "Los datos de contacto no son correctos",
  perfil_inapropiado: "El perfil no es adecuado para el portal",
  otro: "Otro motivo",
};

export const motivoRechazoOfertaSchema = z.enum([
  "informacion_insuficiente",
  "condiciones_poco_claras",
  "oferta_repetida",
  "contenido_inapropiado",
  "otro",
]);

export type MotivoRechazoOferta = z.infer<typeof motivoRechazoOfertaSchema>;

export const ETIQUETA_MOTIVO_OFERTA: Record<MotivoRechazoOferta, string> = {
  informacion_insuficiente: "Falta información en la oferta",
  condiciones_poco_claras: "Las condiciones del puesto no son claras",
  oferta_repetida: "La oferta está repetida",
  contenido_inapropiado: "El contenido no es adecuado para el portal",
  otro: "Otro motivo",
};

/** A reason as the rejection dialog lists it. */
export type OpcionMotivo = { codigo: string; etiqueta: string };

export const OPCIONES_MOTIVO_EMPRESA: OpcionMotivo[] = motivoRechazoEmpresaSchema.options.map((codigo) => ({
  codigo,
  etiqueta: ETIQUETA_MOTIVO_EMPRESA[codigo],
}));

export const OPCIONES_MOTIVO_OFERTA: OpcionMotivo[] = motivoRechazoOfertaSchema.options.map((codigo) => ({
  codigo,
  etiqueta: ETIQUETA_MOTIVO_OFERTA[codigo],
}));

/** Body of the rejection of a company (D-069). */
export const rechazoEmpresaSchema = z.object({
  motivo: motivoRechazoEmpresaSchema,
  observacion: observacionSchema,
});

/** Body of the rejection of an offer (RF1.5.3, D-069): the company will read the reason (RF1.3.5). */
export const rechazoOfertaSchema = z.object({
  motivo: motivoRechazoOfertaSchema,
  observacion: observacionSchema,
});

/** The text saved in `motivo_rechazo`: the reason, then the note after a colon when there is one. */
export function armarMotivoRechazo(etiqueta: string, observacion?: string): string {
  const nota = observacion?.trim();
  return nota ? `${etiqueta}: ${nota}` : etiqueta;
}
