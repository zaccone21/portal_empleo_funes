import { z } from "zod";

/**
 * Vocabularios estandarizados para filtrado y categorización de ofertas y postulantes.
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

export const RANGOS_EXPERIENCIA = [
  "sin_experiencia",
  "menos_de_1",
  "1_a_3",
  "mas_de_3",
] as const;
export type RangoExperiencia = (typeof RANGOS_EXPERIENCIA)[number];

export const NOMBRE_RANGO_EXPERIENCIA: Record<RangoExperiencia, string> = {
  sin_experiencia: "Sin experiencia previa requerida",
  menos_de_1: "Menos de 1 año",
  "1_a_3": "De 1 a 3 años",
  mas_de_3: "Más de 3 años",
};

export const rangoExperienciaSchema = z.enum(RANGOS_EXPERIENCIA);

export const NIVELES_EDUCATIVOS = [
  "secundario_incompleto",
  "secundario_completo",
  "terciario",
  "universitario",
] as const;
export type NivelEducativo = (typeof NIVELES_EDUCATIVOS)[number];

export const NOMBRE_NIVEL_EDUCATIVO: Record<NivelEducativo, string> = {
  secundario_incompleto: "Secundario en curso o incompleto",
  secundario_completo: "Secundario completo",
  terciario: "Terciario / Técnico",
  universitario: "Universitario",
};

export const nivelEducativoSchema = z.enum(NIVELES_EDUCATIVOS);
