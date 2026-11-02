import "server-only";

import { randomInt } from "node:crypto";

import type { CurrentUser } from "@/lib/dal/auth";
import { crearCuentaOficina as guardarCuentaOficina, listarCuentasOficina } from "@/lib/dal/equipo";
import type { CuentaOficina, CuentaOficinaCreada, DatosNuevaCuentaOficina } from "@/lib/validation/equipo";

import { exito, falla, sinPermiso, type Resultado } from "./resultado";

/*
 * The Office team (P21, D-058). Every operator is a "pseudo superadmin": they
 * can create Office accounts, but no one can delete an account from the
 * portal. A mistaken account is disabled by hand in Supabase.
 */

/** Letters and digits that cannot be confused when read aloud or copied by hand (no 0/O, 1/l/I). */
const ALFABETO = "abcdefghjkmnpqrstuvwxyz23456789";

/**
 * A temporary password of 4 groups of 4 characters (about 79 bits), easy to
 * dictate in person: "k7mq-3xpr-…". Above the 8-character minimum (D-020).
 */
export function generarContrasenaTemporal(): string {
  const grupos = Array.from({ length: 4 }, () =>
    Array.from({ length: 4 }, () => ALFABETO[randomInt(ALFABETO.length)]).join(""),
  );
  return grupos.join("-");
}

/** The Office accounts, oldest first. Only the Office sees them. */
export async function verEquipoOficina(usuario: CurrentUser): Promise<Resultado<CuentaOficina[]>> {
  const negado = sinPermiso(usuario, "admin");
  if (negado) return negado;

  return exito(await listarCuentasOficina());
}

/**
 * Creates an Office account with a temporary password that the operator who
 * created it hands over in person (it is shown only once). The new operator
 * changes it after entering.
 */
export async function crearCuentaOficina(
  usuario: CurrentUser,
  datos: DatosNuevaCuentaOficina,
): Promise<Resultado<CuentaOficinaCreada>> {
  const negado = sinPermiso(usuario, "admin");
  if (negado) return negado;

  const email = datos.email.toLowerCase();
  const contrasenaTemporal = generarContrasenaTemporal();
  const resultado = await guardarCuentaOficina(email, contrasenaTemporal);
  if (!resultado.ok) {
    return falla("conflict", "Ya hay una cuenta con ese email. Si es de una operadora, ya puede ingresar.");
  }
  return exito({ email, contrasenaTemporal });
}
