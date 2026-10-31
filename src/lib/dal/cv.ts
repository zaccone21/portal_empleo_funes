import "server-only";

import { z } from "zod";

import { fechaSchema } from "@/lib/dal/fecha";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { esArchivoPng, type CvPropio } from "@/lib/validation/cv";

/*
 * The applicant's CV (RF1.2.3, RNF1): the PDF or PNG file lives in the private
 * bucket `cvs`, at `{applicant id}/cv.pdf` or `{applicant id}/cv.png`, and its
 * path, name, size and date in `postulantes` (D-032).
 */

const BUCKET_CVS = "cvs";

/** Seconds a signed CV link lasts: enough to open it, too short to share it around (RNF1). */
const DURACION_URL_FIRMADA = 60;

const filaCvSchema = z.object({
  cv_ruta: z.string().nullable().optional(),
  cv_nombre: z.string().nullable(),
  cv_tamano_bytes: z.number().nullable(),
  cv_subido_el: fechaSchema.nullable(),
});

/** The applicant's current CV data, or null while they have not uploaded one. */
export async function leerCv(postulanteId: string): Promise<CvPropio | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("postulantes")
    .select("cv_ruta, cv_nombre, cv_tamano_bytes, cv_subido_el")
    .eq("id", postulanteId)
    .maybeSingle();

  if (error) throw new Error("Could not load the CV.");
  if (!data) return null;

  const { cv_ruta, cv_nombre, cv_tamano_bytes, cv_subido_el } = filaCvSchema.parse(data);
  if (cv_nombre === null || cv_tamano_bytes === null || cv_subido_el === null) return null;
  return {
    nombre: cv_nombre,
    tamanoBytes: cv_tamano_bytes,
    subidoEl: cv_subido_el,
    ruta: cv_ruta ?? null,
  };
}

/**
 * Uploads the PDF or PNG file (replacing the previous one) and saves its data.
 * The file must be validated before (`lib/validation/cv.ts`).
 */
export async function guardarCv(postulanteId: string, archivo: File): Promise<CvPropio> {
  const supabase = await createClient();
  const esPng = esArchivoPng(archivo);
  const extension = esPng ? "png" : "pdf";
  const contentType = esPng ? "image/png" : "application/pdf";
  const ruta = `${postulanteId}/cv.${extension}`;

  const { error: errorSubida } = await supabase.storage
    .from(BUCKET_CVS)
    .upload(ruta, archivo, { contentType, upsert: true });
  if (errorSubida) throw new Error("Could not upload the CV.");

  const cv: CvPropio = {
    nombre: archivo.name,
    tamanoBytes: archivo.size,
    subidoEl: new Date().toISOString(),
    ruta,
  };
  const { error } = await supabase
    .from("postulantes")
    .update({ cv_ruta: ruta, cv_nombre: cv.nombre, cv_tamano_bytes: cv.tamanoBytes, cv_subido_el: cv.subidoEl })
    .eq("id", postulanteId);
  if (error) throw new Error("Could not save the CV data.");

  return cv;
}

/** A short-lived link to open a stored CV (only the Office's policy allows it, D-030). */
export async function crearUrlFirmadaCv(ruta: string, descargar = false): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage.from(BUCKET_CVS).createSignedUrl(ruta, DURACION_URL_FIRMADA, {
    download: descargar,
  });

  if (error) throw new Error("Could not create the CV link.");
  return data.signedUrl;
}

/**
 * The same short-lived link for a company and an applicant referred to its
 * offer (D-044). The bucket has no policy for companies, so it uses the admin
 * client (DT-019); the company use case already checked the referral.
 */
export async function crearUrlFirmadaCvParaEmpresa(postulanteId: string): Promise<string> {
  const supabase = createAdminClient();
  const { data: postulante } = await supabase
    .from("postulantes")
    .select("cv_ruta, cv_nombre")
    .eq("id", postulanteId)
    .maybeSingle();

  const nombre = typeof postulante?.cv_nombre === "string" ? postulante.cv_nombre.toLowerCase() : "";
  const rutaPorDefecto = nombre.endsWith(".png") ? `${postulanteId}/cv.png` : `${postulanteId}/cv.pdf`;
  const ruta = typeof postulante?.cv_ruta === "string" && postulante.cv_ruta ? postulante.cv_ruta : rutaPorDefecto;

  const { data, error } = await supabase.storage.from(BUCKET_CVS).createSignedUrl(ruta, DURACION_URL_FIRMADA);

  if (error) throw new Error("Could not create the CV link.");
  return data.signedUrl;
}
