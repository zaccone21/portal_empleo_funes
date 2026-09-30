import "server-only";

import { z } from "zod";

import { fechaSchema } from "@/lib/dal/fecha";
import { createClient } from "@/lib/supabase/server";
import type { CvPropio } from "@/lib/validation/cv";

/*
 * The applicant's CV (RF1.2.3, RNF1): the PDF lives in the private bucket
 * `cvs`, always at {applicant id}/cv.pdf, and its name, size and date in
 * `postulantes` (D-032).
 */

const BUCKET_CVS = "cvs";

/** Seconds a signed CV link lasts: enough to open it, too short to share it around (RNF1). */
const DURACION_URL_FIRMADA = 60;

const filaCvSchema = z.object({
  cv_nombre: z.string().nullable(),
  cv_tamano_bytes: z.number().nullable(),
  cv_subido_el: fechaSchema.nullable(),
});

/** The applicant's current CV data, or null while they have not uploaded one. */
export async function leerCv(postulanteId: string): Promise<CvPropio | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("postulantes")
    .select("cv_nombre, cv_tamano_bytes, cv_subido_el")
    .eq("id", postulanteId)
    .maybeSingle();

  if (error) throw new Error("Could not load the CV.");
  if (!data) return null;

  const { cv_nombre, cv_tamano_bytes, cv_subido_el } = filaCvSchema.parse(data);
  if (cv_nombre === null || cv_tamano_bytes === null || cv_subido_el === null) return null;
  return { nombre: cv_nombre, tamanoBytes: cv_tamano_bytes, subidoEl: cv_subido_el };
}

/**
 * Uploads the PDF (replacing the previous one) and saves its data. The file
 * must be validated before (lib/validation/cv.ts).
 */
export async function guardarCv(postulanteId: string, archivo: File): Promise<CvPropio> {
  const supabase = await createClient();
  const ruta = `${postulanteId}/cv.pdf`;

  const { error: errorSubida } = await supabase.storage
    .from(BUCKET_CVS)
    .upload(ruta, archivo, { contentType: "application/pdf", upsert: true });
  if (errorSubida) throw new Error("Could not upload the CV.");

  const cv: CvPropio = { nombre: archivo.name, tamanoBytes: archivo.size, subidoEl: new Date().toISOString() };
  const { error } = await supabase
    .from("postulantes")
    .update({ cv_ruta: ruta, cv_nombre: cv.nombre, cv_tamano_bytes: cv.tamanoBytes, cv_subido_el: cv.subidoEl })
    .eq("id", postulanteId);
  if (error) throw new Error("Could not save the CV data.");

  return cv;
}

/** A short-lived link to open a stored CV (only the Office's policy allows it, D-030). */
export async function crearUrlFirmadaCv(ruta: string): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage.from(BUCKET_CVS).createSignedUrl(ruta, DURACION_URL_FIRMADA);

  if (error) throw new Error("Could not create the CV link.");
  return data.signedUrl;
}
