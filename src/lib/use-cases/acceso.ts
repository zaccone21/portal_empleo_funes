import "server-only";

import {
  abrirSesionConEnlace,
  cambiarContrasena,
  enviarRecuperacion,
  ingresarConContrasena,
  registrar,
  salir,
  type CurrentUser,
  type EnlaceDelEmail,
} from "@/lib/dal/auth";
import { INICIO_POR_ROL } from "@/lib/rutas";
import type { RolRegistrable, UsuarioSesion } from "@/lib/validation/auth";

import { exito, falla, type Resultado } from "./resultado";

/*
 * Access with Supabase Auth (P02, P08, P13; D-020, D-028). Where each role
 * goes after logging in is decided here, from the role in `perfiles`, never
 * from the portal the person used (D-020).
 */

const MENSAJE_EMAIL_NO_ENVIADO = "No pudimos enviarte el email. Probá de nuevo en unos minutos.";

/** Login (D-020). The same message for an unknown email and a wrong password, so nobody can check who has an account (AGENTS §7). */
export async function ingresar(datos: { email: string; password: string }): Promise<Resultado<{ destino: string }>> {
  const resultado = await ingresarConContrasena(datos.email, datos.password);

  if (!resultado.ok) {
    // Only someone who typed the right password gets here, so it reveals nothing to a stranger.
    if (resultado.motivo === "sin_confirmar") {
      return falla("unauthenticated", "Todavía no activaste tu cuenta. Abrí el enlace del email que te mandamos.");
    }
    return falla("unauthenticated", "Email o contraseña incorrectos");
  }
  return exito({ destino: INICIO_POR_ROL[resultado.rol] });
}

/**
 * Registration (D-020, D-034). `destino` is null when the account must be
 * activated from the email (the screen says "Revisá tu correo"), and the role's
 * home when Supabase logged the person in right away (email confirmation off).
 */
export async function registrarse(
  datos: { email: string; password: string; role: RolRegistrable },
  urlConfirmacion: string,
): Promise<Resultado<{ destino: string | null }>> {
  const resultado = await registrar(datos.email, datos.password, datos.role, urlConfirmacion);

  if (!resultado.ok) {
    if (resultado.motivo === "contrasena_debil") {
      return falla("invalid", "Elegí una contraseña más difícil de adivinar.");
    }
    return falla("unavailable", MENSAJE_EMAIL_NO_ENVIADO);
  }
  return exito({ destino: resultado.sesionIniciada ? INICIO_POR_ROL[datos.role] : null });
}

/** "Olvidé mi contraseña" (D-020): the same answer whether the email has an account or not. */
export async function pedirRecuperacion(datos: { email: string }, urlConfirmacion: string): Promise<Resultado<undefined>> {
  const resultado = await enviarRecuperacion(datos.email, urlConfirmacion);
  return resultado.ok ? exito(undefined) : falla("unavailable", MENSAJE_EMAIL_NO_ENVIADO);
}

/** New password, with the session opened by the recovery link (D-020). */
export async function elegirNuevaContrasena(datos: { password: string }): Promise<Resultado<{ destino: string }>> {
  const resultado = await cambiarContrasena(datos.password);

  if (!resultado.ok) {
    if (resultado.motivo === "sin_sesion") {
      return falla("unauthenticated", 'El enlace venció o ya se usó. Pedí uno nuevo desde "Olvidé mi contraseña".');
    }
    if (resultado.motivo === "misma_contrasena") {
      return falla("invalid", "Elegí una contraseña distinta de la anterior.");
    }
    return falla("invalid", "Elegí una contraseña más difícil de adivinar.");
  }
  return exito({ destino: INICIO_POR_ROL[resultado.rol] });
}

/** Who is logged in (D-028). Nobody is a normal answer, not an error. */
export function verSesion(usuario: CurrentUser | null): Resultado<{ usuario: UsuarioSesion | null }> {
  return exito({ usuario: usuario && { rol: usuario.rol, email: usuario.email } });
}

export async function cerrarSesion(): Promise<Resultado<undefined>> {
  await salir();
  return exito(undefined);
}

/**
 * The link in a Supabase email (/acceso/confirmar). After a recovery link the
 * person chooses a new password; after an activation link they land on their
 * role's home, already logged in.
 */
export async function abrirEnlace(enlace: EnlaceDelEmail, esRecuperacion: boolean): Promise<Resultado<{ destino: string }>> {
  const rol = await abrirSesionConEnlace(enlace);
  if (!rol) {
    return falla("unauthenticated", "El enlace venció o ya se usó.");
  }
  return exito({ destino: esRecuperacion ? "/nueva-contrasena" : INICIO_POR_ROL[rol] });
}
