import "server-only";

import { contarEstadisticasPublicas } from "@/lib/dal/estadisticas";
import type { EstadisticasPublicas } from "@/lib/validation/estadisticas";

import { exito, type Resultado } from "./resultado";

/**
 * The figures of the home page (P01, D-059). Public on purpose: anyone can
 * see them, with or without an account, because they are totals and carry no
 * personal data.
 */
export async function verEstadisticasPublicas(): Promise<Resultado<EstadisticasPublicas>> {
  return exito(await contarEstadisticasPublicas());
}
