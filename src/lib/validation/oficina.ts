import { z } from "zod";

import { ofertaEmpresaSchema } from "./ofertas";
import { estadoPostulacionSchema } from "./postulaciones";
import { textoObligatorio } from "./texto";

/*
 * What the Employment Office sees and sends (P14, P15; D-030, D-037). The
 * Office is the intermediary, so it is the only role that sees both sides:
 * the company's contact data and the applicants of each offer.
 */

/** The company's contact data, as the Office needs it to talk to them. Null if the company never filled it in. */
const empresaDeOfertaSchema = z
  .object({
    razonSocial: z.string(),
    cuit: z.string(),
    contactoNombre: z.string(),
    contactoTelefono: z.string(),
    contactoEmail: z.string(),
  })
  .nullable();

/**
 * An offer as the Office sees it: everything the company sees, plus the
 * account email of the company, its contact data, when it was published and
 * how many applications it has.
 */
export const ofertaOficinaSchema = ofertaEmpresaSchema.extend({
  publicadaEl: z.iso.datetime({ offset: true }).nullable(),
  empresaId: z.string(),
  emailEmpresa: z.string(),
  empresa: empresaDeOfertaSchema,
  cantidadPostulaciones: z.number().int().nonnegative(),
});

export type OfertaOficina = z.infer<typeof ofertaOficinaSchema>;

/** Body of the rejection (RF1.5.3): the reason is required and the company will read it (RF1.3.5). */
export const rechazoSchema = z.object({
  motivo: textoObligatorio("Escribí el motivo: la empresa lo va a leer", 500),
});

/**
 * An application seen across all offers (queues and registers of the Office, D-037):
 * who applied, to what offer, the offer's company contact and the applicant's data.
 * Only the Office gets this; companies never see applicants (RF1.5.5).
 */
export type PostulacionAdmin = {
  id: string;
  estado: z.infer<typeof estadoPostulacionSchema>;
  postuladoEl: string;
  oferta: {
    id: string;
    titulo: string;
    lugar: string;
    jornada: string;
    descripcion: string;
    sueldo: string | null;
    rubros: string[];
    empresa: {
      razonSocial: string | null;
      cuit: string | null;
      contactoNombre: string | null;
      contactoTelefono: string | null;
      contactoEmail: string | null;
    } | null;
  };
  postulante: {
    id: string;
    nombre: string | null;
    apellido: string | null;
    dni: string | null;
    telefono: string | null;
    email: string | null;
    cvNombre: string | null;
    rubros: string[];
  };
};
