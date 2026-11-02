import "server-only";

import { randomInt } from "node:crypto";

import type { CurrentUser } from "@/lib/dal/auth";
import {
  crearCuentaOficina as guardarCuentaOficina,
  eliminarCuentaOficina as borrarCuentaOficina,
  listarCuentasOficina,
} from "@/lib/dal/equipo";
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

/**
 * Deactivates/removes an Office account with 2 safety guards:
 * 1. An operator cannot delete their own account (prevents accidental lockout).
 * 2. Cannot delete the last remaining admin (ensures the system is never orphaned).
 */
export async function darDeBajaCuentaOficina(
  usuario: CurrentUser,
  idParaEliminar: string,
): Promise<Resultado<{ id: string }>> {
  const negado = sinPermiso(usuario, "admin");
  if (negado) return negado;

  // Guard 1: Cannot delete self
  if (usuario.id === idParaEliminar) {
    return falla("invalid", "No podés dar de baja tu propia cuenta de administrador.");
  }

  // Guard 2: Cannot delete last remaining admin
  const cuentas = await listarCuentasOficina();
  if (cuentas.length <= 1) {
    return falla("conflict", "Debe haber al menos un administrador activo en el sistema.");
  }

  const cuentaExiste = cuentas.some((c) => c.id === idParaEliminar);
  if (!cuentaExiste) {
    return falla("not_found", "No se encontró la cuenta que querés dar de baja.");
  }

  await borrarCuentaOficina(idParaEliminar);
  return exito({ id: idParaEliminar });
}
