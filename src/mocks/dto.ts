import type { CvPropio } from "@/lib/validation/cv";
import type { OfertaEmpresa, OfertaPublica } from "@/lib/validation/ofertas";
import type { OfertaOficina, PostulacionOficina } from "@/lib/validation/oficina";
import type { PostulacionPropia } from "@/lib/validation/postulaciones";

import { almacen } from "./almacen";
import type { CvGuardado, OfertaGuardada, PostulacionGuardada } from "./datos-ejemplo";

/*
 * TEMPORARY (DT-003): what the real use cases will do when they build the
 * DTOs (AGENTS §6): each role gets only the fields it may see.
 */

/** Public offer: no company, no status, no applications (RF1.4.1). */
export function aOfertaPublica(oferta: OfertaGuardada, yaTePostulaste: boolean): OfertaPublica {
  return {
    id: oferta.id,
    titulo: oferta.titulo,
    descripcion: oferta.descripcion,
    requisitos: oferta.requisitos,
    lugar: oferta.lugar,
    jornada: oferta.jornada,
    rubro: oferta.rubro,
    publicadaEl: oferta.publicadaEl ?? oferta.creadaEl,
    yaTePostulaste,
  };
}

/** The owning company's view: status, rejection reason and close request, never applicants. */
export function aOfertaEmpresa(oferta: OfertaGuardada): OfertaEmpresa {
  return {
    id: oferta.id,
    titulo: oferta.titulo,
    descripcion: oferta.descripcion,
    requisitos: oferta.requisitos,
    lugar: oferta.lugar,
    jornada: oferta.jornada,
    rubro: oferta.rubro,
    estado: oferta.estado,
    motivoRechazo: oferta.estado === "rejected" ? oferta.motivoRechazo : null,
    cierreSolicitado: oferta.cierreSolicitado,
    creadaEl: oferta.creadaEl,
  };
}

/** The Office's view: everything, plus the company's contact data and how many applied. */
export function aOfertaOficina(oferta: OfertaGuardada): OfertaOficina {
  const perfil = almacen.empresas[oferta.emailEmpresa] ?? null;
  return {
    ...aOfertaEmpresa(oferta),
    motivoRechazo: oferta.motivoRechazo,
    publicadaEl: oferta.publicadaEl,
    emailEmpresa: oferta.emailEmpresa,
    empresa: perfil && {
      razonSocial: perfil.razonSocial,
      cuit: perfil.cuit,
      contactoNombre: perfil.contactoNombre,
      contactoTelefono: perfil.contactoTelefono,
      contactoEmail: perfil.contactoEmail,
    },
    cantidadPostulaciones: almacen.postulaciones.filter((p) => p.ofertaId === oferta.id).length,
  };
}

/** The applicant's own application: which offer and when, never the status (RF1.2.4). */
export function aPostulacionPropia(postulacion: PostulacionGuardada): PostulacionPropia {
  const oferta = almacen.ofertas.find((o) => o.id === postulacion.ofertaId);
  return {
    id: postulacion.id,
    postuladoEl: postulacion.postuladoEl,
    oferta: {
      id: postulacion.ofertaId,
      titulo: oferta?.titulo ?? "Oferta sin datos",
      lugar: oferta?.lugar ?? "",
    },
  };
}

/** An application as the Office sees it: who, when, their CV and the status. */
export function aPostulacionOficina(postulacion: PostulacionGuardada): PostulacionOficina {
  const cv = almacen.cvs[postulacion.emailPostulante];
  return {
    id: postulacion.id,
    estado: postulacion.estado,
    postuladoEl: postulacion.postuladoEl,
    postulante: {
      email: postulacion.emailPostulante,
      cv: cv ? { nombre: cv.nombre, tamanoBytes: cv.tamanoBytes } : null,
    },
  };
}

/** The applicant's own CV data, without the file. */
export function aCvPropio(cv: CvGuardado | undefined): CvPropio | null {
  return cv ? { nombre: cv.nombre, tamanoBytes: cv.tamanoBytes, subidoEl: cv.subidoEl } : null;
}
