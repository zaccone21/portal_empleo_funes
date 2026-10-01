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
