import "server-only";

import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import type { PerfilEmpresa } from "@/lib/validation/empresa";

/** Columns of `empresas` behind PerfilEmpresa (P10). */
export const COLUMNAS_EMPRESA = "razon_social, cuit, descripcion, contacto_nombre, contacto_telefono, contacto_email";

export const filaEmpresaSchema = z.object({
  razon_social: z.string().nullable(),
  cuit: z.string().nullable(),
  descripcion: z.string().nullable(),
  contacto_nombre: z.string().nullable(),
  contacto_telefono: z.string().nullable(),
  contacto_email: z.string().nullable(),
});

/**
 * The company data, or null while the company has not filled in P10: the row
 * exists from sign-up with empty columns (D-032), and P10 saves the required
 * ones all together.
 */
export function aPerfilEmpresa(fila: z.infer<typeof filaEmpresaSchema>): PerfilEmpresa | null {
  const { razon_social, cuit, contacto_nombre, contacto_telefono, contacto_email } = fila;
  if (!razon_social || !cuit || !contacto_nombre || !contacto_telefono || !contacto_email) return null;
  return {
    razonSocial: razon_social,
    cuit,
    descripcion: fila.descripcion ?? "",
    contactoNombre: contacto_nombre,
    contactoTelefono: contacto_telefono,
    contactoEmail: contacto_email,
  };
}

export async function leerPerfilEmpresa(empresaId: string): Promise<{ perfil: PerfilEmpresa | null; cuit: string | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("empresas").select(COLUMNAS_EMPRESA).eq("id", empresaId).maybeSingle();

  if (error) throw new Error("Could not load the company.");
  if (!data) return { perfil: null, cuit: null };
  
  const fila = filaEmpresaSchema.parse(data);
  return { perfil: aPerfilEmpresa(fila), cuit: fila.cuit };
}

export type ResultadoGuardarEmpresa = { ok: true; perfil: PerfilEmpresa } | { ok: false; motivo: "cuit_repetido" };

export async function guardarPerfilEmpresa(empresaId: string, perfil: PerfilEmpresa): Promise<ResultadoGuardarEmpresa> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("empresas")
    .update({
      razon_social: perfil.razonSocial,
      cuit: perfil.cuit,
      descripcion: perfil.descripcion,
      contacto_nombre: perfil.contactoNombre,
      contacto_telefono: perfil.contactoTelefono,
      contacto_email: perfil.contactoEmail,
    })
    .eq("id", empresaId)
    .select(COLUMNAS_EMPRESA)
    .single();

  // 23505: the CUIT is unique (D-032) and another account already has it.
  if (error?.code === "23505") return { ok: false, motivo: "cuit_repetido" };
  if (error) throw new Error("Could not save the company.");

  const guardado = aPerfilEmpresa(filaEmpresaSchema.parse(data));
  if (!guardado) throw new Error("The saved company is incomplete.");
  return { ok: true, perfil: guardado };
}
