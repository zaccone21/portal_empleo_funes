import type { Oferta, OfertaConEmpresa } from "@/lib/dal/ofertas";
import type { OfertaEmpresa, OfertaPublica } from "@/lib/validation/ofertas";
import type { OfertaOficina } from "@/lib/validation/oficina";

/*
 * What each role may see of an offer (AGENTS §6, §7). Used by the catalog,
 * company and Office use cases.
 */

/** Public offer: no company, no status, no applications (RF1.4.1). */
export function aOfertaPublica(oferta: Oferta, yaTePostulaste: boolean): OfertaPublica {
  return {
    id: oferta.id,
    titulo: oferta.titulo,
    descripcion: oferta.descripcion,
    requisitos: oferta.requisitos,
    lugar: oferta.lugar,
    jornada: oferta.jornada,
    sueldo: oferta.sueldo,
    rubros: oferta.rubros,
    publicadaEl: oferta.publicadaEl ?? oferta.creadaEl,
    yaTePostulaste,
  };
}

/** The owning company's view: status, rejection reason (only if rejected, RF1.3.5) and close request; never applicants. */
export function aOfertaEmpresa(oferta: Oferta): OfertaEmpresa {
  return {
    id: oferta.id,
    titulo: oferta.titulo,
    descripcion: oferta.descripcion,
    requisitos: oferta.requisitos,
    lugar: oferta.lugar,
    jornada: oferta.jornada,
    sueldo: oferta.sueldo,
    rubros: oferta.rubros,
    estado: oferta.estado,
    motivoRechazo: oferta.estado === "rechazada" ? oferta.motivoRechazo : null,
    cierreSolicitado: oferta.cierreSolicitado,
    creadaEl: oferta.creadaEl,
  };
}

/** The Office's view: everything, plus the company's contact data and how many applied (D-030). */
export function aOfertaOficina(oferta: OfertaConEmpresa): OfertaOficina {
  return {
    ...aOfertaEmpresa(oferta),
    motivoRechazo: oferta.motivoRechazo,
    publicadaEl: oferta.publicadaEl,
    emailEmpresa: oferta.emailEmpresa,
    empresa: oferta.empresa && {
      razonSocial: oferta.empresa.razonSocial,
      cuit: oferta.empresa.cuit,
      contactoNombre: oferta.empresa.contactoNombre,
      contactoTelefono: oferta.empresa.contactoTelefono,
      contactoEmail: oferta.empresa.contactoEmail,
    },
    cantidadPostulaciones: oferta.cantidadPostulaciones,
  };
}
