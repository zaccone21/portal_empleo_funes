import { z } from "zod";

import {
  nivelEducativoSchema,
  rangoExperienciaSchema,
  type NivelEducativo,
  type RangoExperiencia,
} from "./estandarizacion";
import { rubroSchema } from "./rubros";

/** Schema del formulario y del body del PUT. */
export const perfilPostulanteSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, "Ingresá tu nombre")
    .max(80, "El nombre puede tener hasta 80 caracteres"),
  apellido: z
    .string()
    .trim()
    .min(1, "Ingresá tu apellido")
    .max(80, "El apellido puede tener hasta 80 caracteres"),
  telefono: z
    .string()
    .trim()
    .min(1, "Ingresá un teléfono")
    .regex(/^[\d\s()+-]+$/, "Solo números, espacios, guiones y paréntesis")
    .refine(
      (tel) => tel.replace(/\D/g, "").length >= 8,
      "El teléfono tiene que tener al menos 8 dígitos",
    ),
  direccion: z
    .string()
    .trim()
    .min(1, "Ingresá tu dirección")
    .max(100, "La dirección puede tener hasta 100 caracteres"),
  rubros: z.array(rubroSchema).min(1, "Elegí al menos un rubro"),
  experiencia: z.string().trim().max(2000, "Puede tener hasta 2000 caracteres").optional(),
  nivelEducativo: nivelEducativoSchema.optional().nullable(),
  rangoExperiencia: rangoExperienciaSchema.optional().nullable(),
  fotoUrl: z.string().optional(),
});

export type PerfilPostulante = z.infer<typeof perfilPostulanteSchema>;

/** Schema de respuesta del GET. */
export const perfilPostulanteRespuestaSchema = z.object({
  nombre: z.string().nullable(),
  apellido: z.string().nullable(),
  telefono: z.string().nullable(),
  direccion: z.string().nullable(),
  dni: z.string().nullable(),
  email: z.string().nullable().optional(),
  rubros: z.array(z.object({ slug: rubroSchema, nombre: z.string() })),
  tieneCv: z.boolean(),
  experiencia: z.string().nullable(),
  nivelEducativo: nivelEducativoSchema.nullable().optional(),
  rangoExperiencia: rangoExperienciaSchema.nullable().optional(),
  fotoUrl: z.string().optional(),
});

export type { NivelEducativo, RangoExperiencia };