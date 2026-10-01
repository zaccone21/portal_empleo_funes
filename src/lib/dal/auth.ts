import "server-only";

import { cache } from "react";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { roleSchema, type Role } from "@/lib/validation/role";
import type { DatosRegistro } from "@/lib/validation/auth";

export type CurrentUser = {
  id: string;
  rol: Role;
  email: string;
};

const perfilSchema = z.object({ rol: roleSchema, email: z.string() });

/**
 * The logged-in user, with the role and email read from `perfiles` (never from
 * user_metadata, which the user can edit; AGENTS §7). Null without a session.
 * Route Handlers call it to answer 401; the role check belongs to the use
 * cases (D-018).
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient();

  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims.sub;
  if (!userId) return null;

  const { data: perfil, error } = await supabase
    .from("perfiles")
    .select("rol, email")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw new Error("Could not load the user profile.");
  if (!perfil) return null;

  const { rol, email } = perfilSchema.parse(perfil);
  return { id: userId, rol, email };
});

/** Supabase Auth refuses to send the email: its rate limit, or an address its default sender does not serve. */
const ERRORES_DE_ENVIO = new Set(["over_email_send_rate_limit", "over_request_rate_limit", "email_address_not_authorized"]);

export type ResultadoIngreso =
  | { ok: true; rol: Role }
  | { ok: false; motivo: "credenciales" | "sin_confirmar" };

/**
 * Signs in with email and password. The session cookies go out with the
 * response. The role is read with the same client, which already holds the
 * new session, so RLS lets it read the user's own profile.
 */
export async function ingresarConContrasena(email: string, password: string): Promise<ResultadoIngreso> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.code === "email_not_confirmed") return { ok: false, motivo: "sin_confirmar" };
    if (error.code === "invalid_credentials") return { ok: false, motivo: "credenciales" };
    throw new Error("Sign-in failed unexpectedly.");
  }

  const { data: perfil, error: errorPerfil } = await supabase
    .from("perfiles")
    .select("rol")
    .eq("id", data.user.id)
    .single();
  if (errorPerfil) throw new Error("Could not load the user profile after sign-in.");

  return { ok: true, rol: roleSchema.parse(perfil.rol) };
}

export type ResultadoRegistro =
  | { ok: true; sesionIniciada: boolean }
  | { ok: false; motivo: "envio_fallido" | "contrasena_debil" | "dni_duplicado" | "cuit_duplicado" };

/**
 * Creates an account. The role travels in user_metadata ("rol") alongside DNI or CUIT,
 * and the database trigger inserts them.
 * `sesionIniciada` is true only when email confirmation is off in Supabase
 * (useful in development): the user is logged in right away.
 * An existing email counts as success, so nobody learns which accounts exist
 * (with confirmation on, Supabase already answers as if it were new).
 */
export async function registrar(
  datos: DatosRegistro,
  urlConfirmacion: string,
): Promise<ResultadoRegistro> {
  const supabase = await createClient();
  const metadata: Record<string, string> = { rol: datos.role };
  if (datos.role === "postulante") metadata.dni = datos.dni;
  if (datos.role === "empresa") metadata.cuit = datos.cuit;

  const { data, error } = await supabase.auth.signUp({
    email: datos.email,
    password: datos.password,
    options: { data: metadata, emailRedirectTo: urlConfirmacion },
  });

  if (error) {
    if (error.code === "user_already_exists" || error.code === "email_exists") return { ok: true, sesionIniciada: false };
    if (error.code === "weak_password") return { ok: false, motivo: "contrasena_debil" };
    // The trigger will fail if DNI/CUIT is not unique, throwing a Database error.
    // We map generic database errors to a failed sign-up for now.
    if (error.code && ERRORES_DE_ENVIO.has(error.code)) return { ok: false, motivo: "envio_fallido" };
    // Catch-all for trigger exceptions that surface through GoTrue
    if (error.message?.includes("Database error saving new user")) {
      return { ok: false, motivo: "envio_fallido" };
    }
    throw new Error(`Sign-up failed unexpectedly: ${error.message}`);
  }

  return { ok: true, sesionIniciada: data.session !== null };
}

/**
 * Asks Supabase Auth to send the recovery email. Unknown emails are not an
 * error (Supabase does not say either), so the answer never reveals accounts.
 */
export async function enviarRecuperacion(email: string, urlConfirmacion: string): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: urlConfirmacion });

  if (error) {
    if (error.code && ERRORES_DE_ENVIO.has(error.code)) return { ok: false };
    throw new Error("Password recovery failed unexpectedly.");
  }
  return { ok: true };
}

export type ResultadoCambioContrasena =
  | { ok: true; rol: Role }
  | { ok: false; motivo: "sin_sesion" | "misma_contrasena" | "contrasena_debil" };

/** Sets a new password for the session opened by the recovery link. */
export async function cambiarContrasena(password: string): Promise<ResultadoCambioContrasena> {
  const usuario = await getCurrentUser();
  if (!usuario) return { ok: false, motivo: "sin_sesion" };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    if (error.code === "same_password") return { ok: false, motivo: "misma_contrasena" };
    if (error.code === "weak_password") return { ok: false, motivo: "contrasena_debil" };
    if (error.code === "session_not_found" || error.code === "session_expired") return { ok: false, motivo: "sin_sesion" };
    throw new Error("Password update failed unexpectedly.");
  }
  return { ok: true, rol: usuario.rol };
}

/** Logs out in Supabase Auth and clears the session cookies. */
export async function salir(): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error("Sign-out failed unexpectedly.");
}

/** Link types Supabase puts in its emails (the route validates the value against this list). */
export const TIPOS_DE_ENLACE = ["signup", "email", "recovery", "invite", "magiclink", "email_change"] as const;

export type EnlaceDelEmail = { code: string } | { tokenHash: string; tipo: (typeof TIPOS_DE_ENLACE)[number] };

/**
 * Opens the session from the link in a Supabase email (confirmation or
 * recovery). Two link formats exist: `code` (the default one, which needs the
 * same browser that asked for the email) and `token_hash` (works on any
 * device, if the email templates are changed to use it). Returns the role of
 * the user now logged in, or null when the link is invalid or expired.
 */
export async function abrirSesionConEnlace(enlace: EnlaceDelEmail): Promise<Role | null> {
  const supabase = await createClient();
  const { data, error } =
    "code" in enlace
      ? await supabase.auth.exchangeCodeForSession(enlace.code)
      : await supabase.auth.verifyOtp({ token_hash: enlace.tokenHash, type: enlace.tipo });

  if (error || !data.user) return null;

  const { data: perfil, error: errorPerfil } = await supabase
    .from("perfiles")
    .select("rol")
    .eq("id", data.user.id)
    .single();
  if (errorPerfil) throw new Error("Could not load the user profile after opening the link.");

  return roleSchema.parse(perfil.rol);
}
