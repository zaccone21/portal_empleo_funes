import type { CurrentUser } from "@/lib/dal/auth";
import type { Role } from "@/lib/validation/role";

/*
 * What every use case returns (D-018): the data, or an expected failure with a
 * short Spanish message the screen shows as it comes (D-013). Unexpected
 * failures are thrown, and the Route Handler answers 500.
 */

/** Expected failures. The Route Handler turns each one into its HTTP status (lib/respuestas-api.ts). */
export type TipoDeFalla = "unauthenticated" | "forbidden" | "not_found" | "conflict" | "invalid" | "unavailable";

export type Falla = { ok: false; falla: TipoDeFalla; mensaje: string };

export type Resultado<T> = { ok: true; datos: T } | Falla;

export function exito<T>(datos: T): Resultado<T> {
  return { ok: true, datos };
}

export function falla(tipo: TipoDeFalla, mensaje: string): Falla {
  return { ok: false, falla: tipo, mensaje };
}

const MENSAJE_OTRO_ROL: Record<Role, string> = {
  postulante: "Esta sección es para quienes buscan trabajo. Ingresá con tu cuenta de postulante.",
  empresa: "Esta sección es para empresas. Ingresá con la cuenta de tu empresa.",
  admin: "Esta sección es para la Oficina de Empleo.",
};

/**
 * The role check every use case does first (AGENTS §7): null when the user has
 * the role the action is for, or the "forbidden" failure to return.
 */
export function sinPermiso(usuario: CurrentUser, rol: Role): Falla | null {
  return usuario.rol === rol ? null : falla("forbidden", MENSAJE_OTRO_ROL[rol]);
}
