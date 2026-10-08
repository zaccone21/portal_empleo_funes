import { z } from "zod";

import { ofertaEmpresaSchema } from "./ofertas";
import { estadoPostulacionSchema } from "./postulaciones";
import { textoObligatorio } from "./texto";

/*
 * What the Employment Office sees and sends (P14, P15; D-030). The Office is
 * the intermediary, so it is the only role that sees both sides: the
 * company's contact data and the applicants of each offer.
 * PROVISIONAL (DT-006): the applicant is shown by email until the profile
 * fields are decided (Q-009).
 */

/** Indicators of the Office panel (P14). PROVISIONAL (DT-006): the final ones are open (Q-012). */
export const resumenOficinaSchema = z.object({
  ofertasPendientes: z.array(z.object({
    id: z.string(),
    titulo: z.string(),
    empresa: z.string(),
    creadaEl: z.string(),
  })),
  pedidosDeCierre: z.array(z.object({
    id: z.string(),
    titulo: z.string(),
    empresa: z.string(),
    creadaEl: z.string(),
  })),
  ultimasPostulaciones: z.array(z.object({
    id: z.string(),
    ofertaId: z.string(),
    ofertaTitulo: z.string(),
    postulanteNombre: z.string(),
    creadaEl: z.string(),
  })),
});

export type ResumenOficina = z.infer<typeof resumenOficinaSchema>;

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
  emailEmpresa: z.string(),
  empresa: empresaDeOfertaSchema,
  cantidadPostulaciones: z.number().int().nonnegative(),
});

export const listaOfertasOficinaSchema = z.array(ofertaOficinaSchema);

export const respuestaOfertaOficinaSchema = z.object({ oferta: ofertaOficinaSchema });

export type OfertaOficina = z.infer<typeof ofertaOficinaSchema>;

/** Body of the rejection (RF1.5.3): the reason is required and the company will read it (RF1.3.5). */
export const rechazoSchema = z.object({
  motivo: textoObligatorio("Escribí el motivo: la empresa lo va a leer", 500),
});

/**
 * One application inside an offer (RF1.5.5, RF1.5.6): who, when, their CV (if
 * any) and the status the Office gave it.
 */
export const postulacionOficinaSchema = z.object({
  id: z.string().min(1),
  estado: estadoPostulacionSchema,
  postuladoEl: z.iso.datetime({ offset: true }),
  postulante: z.object({
    email: z.string(),
    cv: z.object({ nombre: z.string(), tamanoBytes: z.number() }).nullable(),
  }),
});

export const listaPostulacionesOficinaSchema = z.array(postulacionOficinaSchema);

export const respuestaPostulacionOficinaSchema = z.object({ postulacion: postulacionOficinaSchema });

export type PostulacionOficina = z.infer<typeof postulacionOficinaSchema>;

/** Body of PATCH /api/admin/postulaciones/<id>. */
export const cambioEstadoPostulacionSchema = z.object({ estado: estadoPostulacionSchema });
