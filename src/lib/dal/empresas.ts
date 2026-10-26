import "server-only";

import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { estadoEmpresaSchema, type EstadoEmpresa, type PerfilEmpresa } from "@/lib/validation/empresa";

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

/** The columns of the company's review by the Office (D-068), apart from the data behind PerfilEmpresa. */
const COLUMNAS_EMPRESA_CON_ESTADO = `${COLUMNAS_EMPRESA}, estado, motivo_rechazo`;

const filaEmpresaConEstadoSchema = filaEmpresaSchema.extend({
  estado: estadoEmpresaSchema,
  motivo_rechazo: z.string().nullable(),
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

/** What P08 and P10 need about the company: its data and where it stands with the Office (D-068). */
export type DatosEmpresa = {
  perfil: PerfilEmpresa | null;
  cuit: string | null;
  estado: EstadoEmpresa;
  /** Only while the status is "rechazada". */
  motivoRechazo: string | null;
};

export async function leerPerfilEmpresa(empresaId: string): Promise<DatosEmpresa> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("empresas")
    .select(COLUMNAS_EMPRESA_CON_ESTADO)
    .eq("id", empresaId)
    .maybeSingle();

  // No row (or a malformed id): treated as not approved, which is the safe side for publishing.
  if (error?.code === "22P02" || (!error && !data)) {
    return { perfil: null, cuit: null, estado: "pendiente", motivoRechazo: null };
  }
  if (error) throw new Error("Could not load the company.");

  const fila = filaEmpresaConEstadoSchema.parse(data);
  return { perfil: aPerfilEmpresa(fila), cuit: fila.cuit, estado: fila.estado, motivoRechazo: fila.motivo_rechazo };
}

export type ResultadoGuardarEmpresa =
  | { ok: true; perfil: PerfilEmpresa; estado: EstadoEmpresa; motivoRechazo: string | null }
  | { ok: false; motivo: "cuit_repetido" };

/**
 * Saves the company data. The database can change the status on its own
 * (an approved company that changes its CUIT goes back to "pendiente", D-068),
 * so the new status comes back with the data.
 */
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
    .select(COLUMNAS_EMPRESA_CON_ESTADO)
    .single();

  // 23505: the CUIT is unique (D-032) and another account already has it.
  if (error?.code === "23505") return { ok: false, motivo: "cuit_repetido" };
  if (error) throw new Error("Could not save the company.");

  const fila = filaEmpresaConEstadoSchema.parse(data);
  const guardado = aPerfilEmpresa(fila);
  if (!guardado) throw new Error("The saved company is incomplete.");
  return { ok: true, perfil: guardado, estado: fila.estado, motivoRechazo: fila.motivo_rechazo };
}

/**
 * The Office's decision on a company (D-068). It only changes the row while it
 * is still in `desde`, so two operators cannot decide the same company: false
 * means someone got there first. The database checks the same rules again
 * (trigger `antes_de_actualizar_empresa`).
 */
export async function actualizarEstadoEmpresa(
  id: string,
  desde: EstadoEmpresa,
  cambios: { estado: EstadoEmpresa; motivoRechazo?: string },
): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("empresas")
    .update({ estado: cambios.estado, ...(cambios.motivoRechazo ? { motivo_rechazo: cambios.motivoRechazo } : {}) })
    .eq("id", id)
    .eq("estado", desde)
    .select("id");

  if (error) throw new Error("Could not update the company.");
  return data.length > 0;
}

/** How many companies wait for the Office's decision (D-068), for the side menu and the panel. */
export async function contarEmpresasPendientes(): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("empresas")
    .select("id", { count: "exact", head: true })
    .eq("estado", "pendiente");

  if (error) throw new Error("Could not count the pending companies.");
  return count ?? 0;
}

export type EmpresaLista = {
  id: string;
  razonSocial: string | null;
  cuit: string | null;
  contactoNombre: string | null;
  contactoEmail: string | null;
  contactoTelefono: string | null;
  creadaEl: string;
  estado: EstadoEmpresa;
  motivoRechazo: string | null;
};

const COLUMNAS_LISTA =
  "id, razon_social, cuit, contacto_nombre, contacto_email, contacto_telefono, estado, motivo_rechazo, perfiles!inner(creado_el)";

const filaListaSchema = z.object({
  id: z.string(),
  razon_social: z.string().nullable(),
  cuit: z.string().nullable(),
  contacto_nombre: z.string().nullable(),
  contacto_email: z.string().nullable(),
  contacto_telefono: z.string().nullable(),
  estado: estadoEmpresaSchema,
  motivo_rechazo: z.string().nullable(),
  // `perfiles` is a single row (one-to-one), but PostgREST may type it as a list.
  perfiles: z.union([z.object({ creado_el: z.string() }), z.array(z.object({ creado_el: z.string() }))]),
});

function aEmpresaLista(dato: unknown): EmpresaLista {
  const d = filaListaSchema.parse(dato);
  const perfil = Array.isArray(d.perfiles) ? d.perfiles[0] : d.perfiles;
  return {
    id: d.id,
    razonSocial: d.razon_social,
    cuit: d.cuit,
    contactoNombre: d.contacto_nombre,
    contactoEmail: d.contacto_email,
    contactoTelefono: d.contacto_telefono,
    creadaEl: perfil?.creado_el ?? new Date().toISOString(),
    estado: d.estado,
    motivoRechazo: d.motivo_rechazo,
  };
}

/** Every company, newest first, for the Office (the session must be an admin: RLS decides). */
export async function listarEmpresas(filtros: { q?: string } = {}): Promise<EmpresaLista[]> {
  const supabase = await createClient();

  let query = supabase.from("empresas").select(COLUMNAS_LISTA);

  if (filtros.q) {
    query = query.or(`razon_social.ilike.%${filtros.q}%,cuit.ilike.%${filtros.q}%,contacto_email.ilike.%${filtros.q}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error("Could not load the companies.");

  return data.map(aEmpresaLista).sort((a, b) => b.creadaEl.localeCompare(a.creadaEl));
}

/** One company for the Office, or null when it does not exist. */
export async function leerEmpresaParaOficina(id: string): Promise<EmpresaLista | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("empresas").select(COLUMNAS_LISTA).eq("id", id).maybeSingle();

  // 22P02: the id in the URL is not a UUID, so there is no such company.
  if (error?.code === "22P02") return null;
  if (error) throw new Error("Could not load the company.");
  return data ? aEmpresaLista(data) : null;
}
