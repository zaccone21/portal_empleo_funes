import "server-only";

import { z } from "zod";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { CuentaOficina } from "@/lib/validation/equipo";

const filaCuentaSchema = z.object({ id: z.string(), email: z.string(), creado_el: z.string() });

/** The Office accounts, oldest first (P21). RLS lets only the Office read every profile. */
export async function listarCuentasOficina(): Promise<CuentaOficina[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("perfiles")
    .select("id, email, creado_el")
    .eq("rol", "admin")
    .order("creado_el", { ascending: true });

  if (error) throw new Error("Could not load the Office accounts.");
  return z
    .array(filaCuentaSchema)
    .parse(data)
    .map((fila) => ({ id: fila.id, email: fila.email, creadaEl: fila.creado_el }));
}

export type ResultadoCrearCuenta = { ok: true } | { ok: false; motivo: "email_existente" };

/**
 * Creates an Office account (D-058), already confirmed, with the temporary
 * password the use case made. Uses the admin client: only the use case that
 * already checked the caller is from the Office calls it (AGENTS §7, DT-020).
 *
 * The sign-up trigger (`crear_perfil`) creates every new account as an
 * applicant, so the role is then changed to admin and the applicant row is
 * removed, the same steps as creating an operator by hand (como_probar.md
 * §1.3). If one of them fails, the new auth user is deleted, so a half-made
 * account never stays behind.
 */
export async function crearCuentaOficina(email: string, contrasena: string): Promise<ResultadoCrearCuenta> {
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({ email, password: contrasena, email_confirm: true });

  if (error) {
    if (error.code === "email_exists" || error.code === "user_already_exists") {
      return { ok: false, motivo: "email_existente" };
    }
    throw new Error("Could not create the Office account.");
  }

  const id = data.user.id;
  const { error: errorRol } = await admin.from("perfiles").update({ rol: "admin" }).eq("id", id);
  const { error: errorPostulante } = errorRol
    ? { error: errorRol }
    : await admin.from("postulantes").delete().eq("id", id);

  if (errorRol || errorPostulante) {
    await admin.auth.admin.deleteUser(id);
    throw new Error("Could not set the Office role; the new account was removed.");
  }
  return { ok: true };
}
