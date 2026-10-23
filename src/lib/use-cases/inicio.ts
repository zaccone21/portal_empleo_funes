import "server-only";

import { contarEstadisticasPublicas } from "@/lib/dal/estadisticas";
import type { EstadisticasPublicas } from "@/lib/validation/estadisticas";

import { exito, type Resultado } from "./resultado";

/**
 * People the Employment Office had already placed in jobs before the portal
 * existed (D-067). A real figure of the Office, given by the user on
 * 2026-10-22; the year it is counted from is still to be confirmed. The home
 * page adds it to the hires counted in the portal, and says so.
 */
export const CONTRATACIONES_ANTES_DEL_PORTAL = 850;

/**
 * The figures of the home page (P01, D-059). Public on purpose: anyone can
 * see them, with or without an account, because they are totals and carry no
 * personal data. The hires include the Office's placements before the portal
 * (D-067).
 */
export async function verEstadisticasPublicas(): Promise<Resultado<EstadisticasPublicas>> {
  const contadas = await contarEstadisticasPublicas();
  return exito({ ...contadas, contrataciones: CONTRATACIONES_ANTES_DEL_PORTAL + contadas.contrataciones });
}
