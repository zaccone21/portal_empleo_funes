import { z } from "zod";

/**
 * Required free text: trims spaces, then asks for at least one character
 * (`mensaje` is what the person sees when it is empty) and at most `maximo`.
 * Trimming first means a field with only spaces counts as empty.
 */
export function textoObligatorio(mensaje: string, maximo: number) {
  return z
    .string({ error: mensaje })
    .trim()
    .min(1, mensaje)
    .max(maximo, `Puede tener hasta ${maximo} caracteres`);
}

/**
 * Sanitizes a free-text search term before interpolating it into a PostgREST
 * `.or()` filter expression (ASVS V1.2.4). Strips characters with syntactic
 * meaning in PostgREST filter grammar (`[,]`, `(,)`, `.`, `*`, `%`, `\`, `'`, `"`),
 * collapses whitespace, and caps length at 100 characters.
 */
export function limpiarFiltroPostgrest(q: string | undefined): string {
  if (!q) return "";
  return q
    .trim()
    .replace(/[,().*%\\'"]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);
}
