import { z } from "zod";

/*
 * The applicant's CV (P04, RF1.2.3, RNF1): a single PDF per applicant.
 * validarArchivoCv runs in the browser (to answer at once) and again on the
 * server (the only check that counts, AGENTS §7).
 */

/**
 * Maximum size. PROVISIONAL (DT-004): 5 MB is the proposal in Q-005, still
 * open. Change it here and in the storage bucket's limit.
 */
export const CV_TAMANO_MAXIMO_BYTES = 5 * 1024 * 1024;

/** Every PDF file starts with these five bytes. */
const FIRMA_PDF = [0x25, 0x50, 0x44, 0x46, 0x2d]; // "%PDF-"

/**
 * Checks that `archivo` is an acceptable CV and returns the message to show,
 * or null when it is fine. In order:
 * 1. Not empty.
 * 2. Not larger than CV_TAMANO_MAXIMO_BYTES.
 * 3. Declared as a PDF: MIME type application/pdf. Some phone file pickers
 *    send no type at all; in that case a ".pdf" name is accepted, because
 *    step 4 is what really decides.
 * 4. Its content starts with "%PDF-". The type and the name can be faked (a
 *    photo renamed to .pdf); the first bytes of the file cannot.
 */
export async function validarArchivoCv(archivo: File): Promise<string | null> {
  if (archivo.size === 0) {
    return "El archivo está vacío. Elegí otro.";
  }
  if (archivo.size > CV_TAMANO_MAXIMO_BYTES) {
    return `El archivo pesa más de ${formatearTamano(CV_TAMANO_MAXIMO_BYTES)}. Probá con uno más liviano.`;
  }

  const pareceUnPdf =
    archivo.type === "application/pdf" ||
    (archivo.type === "" && archivo.name.toLowerCase().endsWith(".pdf"));
  if (!pareceUnPdf) {
    return "Tiene que ser un archivo PDF.";
  }

  const inicio = new Uint8Array(await archivo.slice(0, FIRMA_PDF.length).arrayBuffer());
  const esPdf = FIRMA_PDF.every((byte, i) => inicio[i] === byte);
  return esPdf ? null : "El archivo no es un PDF válido. Probá exportarlo de nuevo como PDF.";
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
 * There is no link to open it: only the Office views CVs, through short-lived
 * signed URLs (RNF1).
 */
export const cvPropioSchema = z.object({
  nombre: z.string().min(1),
  tamanoBytes: z.number().int().nonnegative(),
  /** ISO 8601 with offset. */
  subidoEl: z.iso.datetime({ offset: true }),
});

/** Answer of GET and PUT /api/cv: `cv` is null while the applicant has not uploaded one. */
export const respuestaCvSchema = z.object({ cv: cvPropioSchema.nullable() });

export type CvPropio = z.infer<typeof cvPropioSchema>;
