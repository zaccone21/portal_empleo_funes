import { z } from "zod";

/*
 * The applicant's CV (P04, RF1.2.3, RNF1): a single PDF or PNG file per applicant.
 * validarArchivoCv runs in the browser (to answer at once) and again on the
 * server (the only check that counts, AGENTS §7).
 */

/**
 * Maximum size (5 MB, Q-005). Change it here and in the storage bucket's limit.
 */
export const CV_TAMANO_MAXIMO_BYTES = 5 * 1024 * 1024;

/** Every PDF file starts with these five bytes ("%PDF-"). */
const FIRMA_PDF = [0x25, 0x50, 0x44, 0x46, 0x2d];

/** Every PNG image starts with these eight bytes (89 50 4E 47 0D 0A 1A 0A). */
const FIRMA_PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

/** True when the file's MIME type or name indicates a PNG image. */
export function esArchivoPng(archivo: { name?: string; type?: string }): boolean {
  if (archivo.type === "image/png") return true;
  return Boolean(archivo.name && archivo.name.toLowerCase().endsWith(".png"));
}

/**
 * Checks that `archivo` is an acceptable CV (PDF or PNG) and returns the
 * message to show, or null when it is fine. In order:
 * 1. Not empty.
 * 2. Not larger than CV_TAMANO_MAXIMO_BYTES.
 * 3. Declared as PDF (`application/pdf` or `.pdf`) or PNG (`image/png` or `.png`).
 * 4. Its content starts with `%PDF-` (for PDF) or the 8-byte PNG signature.
 */
export async function validarArchivoCv(archivo: File): Promise<string | null> {
  if (archivo.size === 0) {
    return "El archivo está vacío. Elegí otro.";
  }
  if (archivo.size > CV_TAMANO_MAXIMO_BYTES) {
    return `El archivo pesa más de ${formatearTamano(CV_TAMANO_MAXIMO_BYTES)}. Probá con uno más liviano.`;
  }

  const nombreBajo = archivo.name.toLowerCase();
  const pareceUnPdf =
    archivo.type === "application/pdf" || (archivo.type === "" && nombreBajo.endsWith(".pdf"));
  const pareceUnPng =
    archivo.type === "image/png" || (archivo.type === "" && nombreBajo.endsWith(".png"));

  if (!pareceUnPdf && !pareceUnPng) {
    return "Tiene que ser un archivo PDF o una imagen PNG.";
  }

  if (pareceUnPng) {
    const inicioPng = new Uint8Array(await archivo.slice(0, FIRMA_PNG.length).arrayBuffer());
    const esPng = FIRMA_PNG.every((byte, i) => inicioPng[i] === byte);
    return esPng ? null : "La imagen no es un archivo PNG válido. Probá con otro PNG o un PDF.";
  }

  const inicioPdf = new Uint8Array(await archivo.slice(0, FIRMA_PDF.length).arrayBuffer());
  const esPdf = FIRMA_PDF.every((byte, i) => inicioPdf[i] === byte);
  return esPdf ? null : "El archivo no es un PDF válido. Probá exportarlo de nuevo como PDF o subirlo en PNG.";
}

/** 245760 → "240 KB"; 5242880 → "5 MB". */
export function formatearTamano(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  const megas = bytes / (1024 * 1024);
  return `${Number.isInteger(megas) ? megas : megas.toFixed(1).replace(".", ",")} MB`;
}

/**
 * The applicant's current CV as the applicant sees it: name, size and date.
 */
export const cvPropioSchema = z.object({
  nombre: z.string().min(1),
  tamanoBytes: z.number().int().nonnegative(),
  /** ISO 8601 with offset. */
  subidoEl: z.iso.datetime({ offset: true }),
  ruta: z.string().nullable().optional(),
});

/** Answer of GET and PUT /api/cv: `cv` is null while the applicant has not uploaded one. */
export const respuestaCvSchema = z.object({ cv: cvPropioSchema.nullable() });

export type CvPropio = z.infer<typeof cvPropioSchema>;
