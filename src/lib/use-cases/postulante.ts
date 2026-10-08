import "server-only";

import type { CurrentUser } from "@/lib/dal/auth";
import { crearUrlFirmadaCv, guardarCv, leerCv } from "@/lib/dal/cv";
import { leerOferta, listarOfertasPublicadas } from "@/lib/dal/ofertas";
import { crearPostulacion, idsDeOfertasPostuladas, listarPostulacionesPropias } from "@/lib/dal/postulaciones";
import { guardarPerfilPostulante, leerPerfilPostulante, perfilCompletoPostulante, type ResultadoLeerPerfilPostulante } from "@/lib/dal/postulantes";
import type { CvPropio } from "@/lib/validation/cv";
import type { OfertaPublica } from "@/lib/validation/ofertas";
import type { PerfilPostulante } from "@/lib/validation/postulante-perfil";
import type { PostulacionPropia } from "@/lib/validation/postulaciones";

import { aOfertaPublica } from "./dto-ofertas";
import { exito, falla, sinPermiso, type Resultado } from "./resultado";

/*
 * The public catalog and the applicant area (P01, P03, P04-P07; RF1.2.1, RF1.2.2,
 * RF1.2.3, RF1.2.4, RF1.4.1-RF1.4.4; D-024, D-026, D-028).
 */

export async function obtenerPerfilPostulante(
  usuario: CurrentUser,
): Promise<Resultado<ResultadoLeerPerfilPostulante & { email: string }>> {
  const negado = sinPermiso(usuario, "postulante");
  if (negado) return negado;

  const perfil = await leerPerfilPostulante(usuario.id);
  if (!perfil) return falla("not_found", "No se encontró tu perfil de postulante.");
  return exito({
    ...perfil,
    email: usuario.email,
  });
}

export async function actualizarPerfilPostulante(usuario: CurrentUser, perfil: PerfilPostulante): Promise<Resultado<undefined>> {
  const negado = sinPermiso(usuario, "postulante");
  if (negado) return negado;

  await guardarPerfilPostulante(usuario.id, perfil);
  return exito(undefined);
}

/**
 * Published offers, newest first. Public: works without a session.
 * `yaTePostulaste` is true only on the offers the logged-in applicant already
 * applied to (D-028); it is not an application status (RF1.2.4).
 */
export async function verOfertasPublicadas(usuario: CurrentUser | null): Promise<Resultado<OfertaPublica[]>> {
  const ofertas = await listarOfertasPublicadas();
  const postuladas = usuario?.rol === "postulante" ? await idsDeOfertasPostuladas(usuario.id) : new Set<string>();
  return exito(ofertas.map((oferta) => aOfertaPublica(oferta, postuladas.has(oferta.id))));
}

/** "Mis postulaciones" (P07): which offer and when, never the Office's status (RF1.2.4). */
export async function verMisPostulaciones(usuario: CurrentUser): Promise<Resultado<PostulacionPropia[]>> {
  const negado = sinPermiso(usuario, "postulante");
  if (negado) return negado;

  const postulaciones = await listarPostulacionesPropias(usuario.id);
  return exito(
    postulaciones.map(({ id, creadaEl, oferta }) => {
      // RLS shows applicants the offers they applied to (migration 20260929130000), so this means a missing migration.
      if (!oferta) throw new Error("An applied offer is not visible to its applicant.");
      return { id, postuladoEl: creadaEl, oferta };
    }),
  );
}

/**
 * "Postularme" (RF1.4.3, RF1.4.4):
 * 1. The offer must be published (404 otherwise: it may have closed meanwhile).
 * 2. The applicant must have a CV (409, and the screen asks to upload it).
 * 3. The applicant must have a complete profile (409).
 * 4. Applying twice is not an error (D-024).
 * The applicant always comes from the session, never from the request (AGENTS §7).
 */
export async function postularme(usuario: CurrentUser, ofertaId: string): Promise<Resultado<undefined>> {
  const negado = sinPermiso(usuario, "postulante");
  if (negado) return negado;

  const oferta = await leerOferta(ofertaId);
  if (!oferta || oferta.estado !== "publicada") {
    return falla("not_found", "Esta oferta ya no está publicada.");
  }
  
  if (!(await perfilCompletoPostulante(usuario.id))) {
    return falla("conflict", "Para postularte tenés que completar tus datos personales y elegir al menos un rubro en Mi perfil.");
  }
  
  if (!(await leerCv(usuario.id))) {
    return falla("conflict", "Para postularte tenés que subir tu CV en PDF. Lleva un minuto.");
  }

  await crearPostulacion(usuario.id, oferta.id);
  return exito(undefined);
}

/** The applicant's CV data (P04). There is no link to open it: only the Office views CVs (RNF1, D-026). */
export async function verMiCv(usuario: CurrentUser): Promise<Resultado<{ cv: CvPropio | null }>> {
  const negado = sinPermiso(usuario, "postulante");
  if (negado) return negado;

  return exito({ cv: await leerCv(usuario.id) });
}

/** Uploads the CV, replacing the previous one (RF1.2.3). The Route Handler already checked the file is a valid PDF. */
export async function subirMiCv(usuario: CurrentUser, archivo: File): Promise<Resultado<{ cv: CvPropio }>> {
  const negado = sinPermiso(usuario, "postulante");
  if (negado) return negado;

  return exito({ cv: await guardarCv(usuario.id, archivo) });
}

/** Short-lived signed URL for the applicant to view their own CV PDF (RF1.2.3, RNF1). */
export async function abrirMiCv(usuario: CurrentUser): Promise<Resultado<{ url: string }>> {
  const negado = sinPermiso(usuario, "postulante");
  if (negado) return negado;

  const cv = await leerCv(usuario.id);
  if (!cv) return falla("not_found", "Todavía no subiste tu CV.");

  const ruta = `${usuario.id}/cv.pdf`;
  const url = await crearUrlFirmadaCv(ruta);
  return exito({ url });
}

