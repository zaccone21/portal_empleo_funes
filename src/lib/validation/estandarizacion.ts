import { z } from "zod";

/**
 * Vocabularios estandarizados para filtrado y categorización de ofertas.
 * Reemplazan strings libres para permitir indexación en base de datos y búsqueda estructurada.
 */

export const MODALIDADES_LABORALES = ["presencial", "hibrido", "remoto"] as const;
export type ModalidadLaboral = (typeof MODALIDADES_LABORALES)[number];

export const NOMBRE_MODALIDAD: Record<ModalidadLaboral, string> = {
  presencial: "Presencial",
  hibrido: "Híbrido",
  remoto: "Remoto",
};

export const modalidadLaboralSchema = z.enum(MODALIDADES_LABORALES);

export const TIPOS_JORNADA = [
  "completa",
  "media_jornada",
  "flexible",
] as const;
export type TipoJornada = (typeof TIPOS_JORNADA)[number];

export const NOMBRE_TIPO_JORNADA: Record<TipoJornada, string> = {
  completa: "Jornada Completa",
  media_jornada: "Media Jornada",
  flexible: "Flexible",
};

export const tipoJornadaSchema = z.enum(TIPOS_JORNADA);
