import { z } from "zod";

/**
 * Parámetros y tipos compartidos para paginación proveniente del backend (Supabase + Next.js).
 */

export const DEFAULT_POR_PAGINA = 20;
export const MAX_POR_PAGINA = 100;

export const parametrosPaginacionSchema = z.object({
  pagina: z.coerce.number().int().min(1).default(1),
  porPagina: z.coerce.number().int().min(1).max(MAX_POR_PAGINA).default(DEFAULT_POR_PAGINA),
});

export type ParametrosPaginacion = z.infer<typeof parametrosPaginacionSchema>;

export type RespuestaPaginada<T> = {
  items: T[];
  total: number;
  pagina: number;
  porPagina: number;
  totalPaginas: number;
};

/**
 * Calcula los índices 'desde' y 'hasta' para usar en supabase.range(desde, hasta).
 */
export function calcularRango(pagina: number, porPagina: number): { desde: number; hasta: number } {
  const p = Math.max(1, pagina);
  const pp = Math.max(1, porPagina);
  const desde = (p - 1) * pp;
  const hasta = desde + pp - 1;
  return { desde, hasta };
}

/**
 * Envuelve un conjunto de items en la estructura de RespuestaPaginada.
 */
export function crearRespuestaPaginada<T>(
  items: T[],
  total: number,
  pagina: number,
  porPagina: number
): RespuestaPaginada<T> {
  const totalPaginas = Math.max(1, Math.ceil(total / porPagina));
  return {
    items,
    total,
    pagina,
    porPagina,
    totalPaginas,
  };
}
