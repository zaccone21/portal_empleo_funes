import { z } from "zod";

import { textoObligatorio } from "./texto";

/*
 * The company's own data (P10, RF1.3.2): business name, CUIT, description and
 * the contact person. PROVISIONAL (DT-005): RF1.3.2 lists these fields but not
 * their exact shape; adjust when the companies table is modeled.
 */

/** Weights of the CUIT check digit (AFIP's modulo 11 algorithm). */
const PESOS_CUIT = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];

/**
 * True when `cuit` (11 digits, with or without dashes or spaces) has a valid
 * check digit. It catches typos, which are the common mistake; it does not
 * prove the CUIT belongs to the company (only AFIP could).
 * The check digit is 11 minus the weighted sum modulo 11; 11 becomes 0, and
 * 10 never appears in a valid CUIT.
 */
export function esCuitValido(cuit: string): boolean {
  const digitos = cuit.replace(/[\s-]/g, "");
  if (!/^\d{11}$/.test(digitos)) {
    return false;
  }
  const suma = PESOS_CUIT.reduce((total, peso, i) => total + peso * Number(digitos[i]), 0);
  const resto = 11 - (suma % 11);
  const verificador = resto === 11 ? 0 : resto;
  return verificador !== 10 && verificador === Number(digitos[10]);
}

/** "30712345671" or "30 71234567 1" → "30-71234567-1", the way AFIP writes it. */
export function formatearCuit(cuit: string): string {
  const d = cuit.replace(/[\s-]/g, "");
  return `${d.slice(0, 2)}-${d.slice(2, 10)}-${d.slice(10)}`;
}

/**
 * Company data. The CUIT is checked with esCuitValido and then saved in the
 * dashed format, so the Office always sees it the same way. The phone accepts
 * the usual ways of writing it (spaces, dashes, parentheses, +54) and asks
 * for at least 8 digits.
 */
export const perfilEmpresaSchema = z.object({
  razonSocial: textoObligatorio("Ingresá la razón social", 120),
  cuit: z
    .string({ error: "Ingresá el CUIT" })
    .trim()
    .min(1, "Ingresá el CUIT")
    .refine(esCuitValido, "Revisá el CUIT: tiene que tener 11 números y ser válido")
    .transform(formatearCuit),
  descripcion: z
    .string()
    .trim()
    .max(1000, "Puede tener hasta 1000 caracteres"),
  contactoNombre: textoObligatorio("Ingresá el nombre de la persona de contacto", 120),
  contactoTelefono: z
    .string({ error: "Ingresá un teléfono" })
    .trim()
    .min(1, "Ingresá un teléfono")
    .refine(
      (telefono) => /^[\d\s()+-]+$/.test(telefono) && telefono.replace(/\D/g, "").length >= 8,
      "Revisá el teléfono: por ejemplo 341 555-1234",
    ),
  contactoEmail: z
    .string({ error: "Ingresá un email" })
    .trim()
    .min(1, "Ingresá un email")
    .pipe(z.email("Revisá el email: tiene que ser como nombre@correo.com")),
});

export type PerfilEmpresa = z.infer<typeof perfilEmpresaSchema>;

/** Answer of GET and PUT /api/empresa/perfil: `perfil` is null until the company fills it in. */
export const respuestaPerfilEmpresaSchema = z.object({ perfil: perfilEmpresaSchema.nullable() });
