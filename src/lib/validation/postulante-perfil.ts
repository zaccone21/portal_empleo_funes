import { z } from "zod";

import { rubroSchema } from "./rubros";

/** Schema del formulario y del body del PUT. */
export const perfilPostulanteSchema = z.object({
  telefono: z
    .string()
    .trim()
    .min(1, "Ingresá un teléfono")
    .regex(/^[\d\s()+-]+$/, "Solo números, espacios, guiones y paréntesis")
    .refine(
      (tel) => tel.replace(/\D/g, "").length >= 8,
      "El teléfono tiene que tener al menos 8 dígitos",
    ),
  rubros: z.array(rubroSchema).min(1, "Elegí al menos un rubro"),
});

export type PerfilPostulante = z.infer<typeof perfilPostulanteSchema>;

/** Schema de respuesta del GET. */
export const perfilPostulanteRespuestaSchema = z.object({
  nombre: z.string().nullable(),
  apellido: z.string().nullable(),
  telefono: z.string().nullable(),
  dni: z.string().nullable(),
  email: z.string().nullable().optional(),
  rubros: z.array(z.object({ slug: rubroSchema, nombre: z.string() })),
  tieneCv: z.boolean(),
});
