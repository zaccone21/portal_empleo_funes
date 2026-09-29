import type { PerfilEmpresa } from "@/lib/validation/empresa";
import type { EstadoOferta } from "@/lib/validation/ofertas";
import type { EstadoPostulacion } from "@/lib/validation/postulaciones";
import type { Rubro } from "@/lib/validation/rubros";

/*
 * TEMPORARY (DT-003): the fake data of the simulated backend, in one place,
 * shaped like the future tables so every role sees the same world: the
 * company publishes, the Office approves, the offer shows in the catalog, the
 * applicant applies and the Office sees them. Everything is obviously fake
 * ("(ejemplo)", "@ejemplo.com") (D-009).
 */

/** An offer as the future job_offers table would keep it. */
export type OfertaGuardada = {
  id: string;
  titulo: string;
  descripcion: string;
  requisitos: string;
  lugar: string;
  jornada: string;
  rubro: Rubro;
  estado: EstadoOferta;
  motivoRechazo: string | null;
  cierreSolicitado: boolean;
  creadaEl: string;
  publicadaEl: string | null;
  /** Account of the company that owns it. */
  emailEmpresa: string;
};

/** An application as the future applications table would keep it. */
export type PostulacionGuardada = {
  id: string;
  ofertaId: string;
  emailPostulante: string;
  estado: EstadoPostulacion;
  postuladoEl: string;
};

/** A stored CV: its data and the PDF itself (the real version keeps the file in the private bucket). */
export type CvGuardado = {
  nombre: string;
  tamanoBytes: number;
  subidoEl: string;
  contenido: Uint8Array;
};

/** The test company (empresa@ejemplo.com) starts without data, so its home shows the reminder. */
export const EMPRESAS_DE_EJEMPLO: Record<string, PerfilEmpresa | null> = {
  "empresa@ejemplo.com": null,
  "restaurante@ejemplo.com": {
    razonSocial: "Restaurante de ejemplo S.R.L.",
    cuit: "30-71234567-1",
    descripcion: "Restaurante familiar.",
    contactoNombre: "Persona de ejemplo 1",
    contactoTelefono: "341 555-0101",
    contactoEmail: "contacto@restaurante.ejemplo.com",
  },
  "vivero@ejemplo.com": {
    razonSocial: "Vivero de ejemplo",
    cuit: "20-12345678-6",
    descripcion: "",
    contactoNombre: "Persona de ejemplo 2",
    contactoTelefono: "341 555-0102",
    contactoEmail: "contacto@vivero.ejemplo.com",
  },
  "electricidad@ejemplo.com": {
    razonSocial: "Electricidad de ejemplo S.A.",
    cuit: "30-70000000-8",
    descripcion: "Instalaciones eléctricas.",
    contactoNombre: "Persona de ejemplo 3",
    contactoTelefono: "341 555-0103",
    contactoEmail: "contacto@electricidad.ejemplo.com",
  },
  "almacen@ejemplo.com": {
    razonSocial: "Almacén de ejemplo",
    cuit: "30-71111111-1",
    descripcion: "",
    contactoNombre: "Persona de ejemplo 4",
    contactoTelefono: "341 555-0104",
    contactoEmail: "contacto@almacen.ejemplo.com",
  },
  "distribuidora@ejemplo.com": {
    razonSocial: "Distribuidora de ejemplo S.A.",
    cuit: "33-80000000-4",
    descripcion: "Distribución de alimentos.",
    contactoNombre: "Persona de ejemplo 5",
    contactoTelefono: "341 555-0105",
    contactoEmail: "contacto@distribuidora.ejemplo.com",
  },
};

function oferta(
  datos: Omit<OfertaGuardada, "motivoRechazo" | "cierreSolicitado" | "publicadaEl"> &
    Partial<Pick<OfertaGuardada, "motivoRechazo" | "cierreSolicitado" | "publicadaEl">>,
): OfertaGuardada {
  return { motivoRechazo: null, cierreSolicitado: false, publicadaEl: null, ...datos };
}

export const OFERTAS_DE_EJEMPLO: OfertaGuardada[] = [
  // Published offers of other companies.
  oferta({
    id: "ejemplo-1",
    titulo: "Ayudante de cocina (ejemplo)",
    descripcion:
      "Preparación de ingredientes, limpieza de la cocina y apoyo al cocinero en el servicio del mediodía.\nEs una oferta de ejemplo.",
    requisitos: "Ganas de aprender. Libreta sanitaria o disposición para tramitarla.",
    lugar: "Barrio de ejemplo 1",
    jornada: "Lunes a sábado de 10 a 16",
    rubro: "gastronomia",
    estado: "published",
    creadaEl: "2026-09-24T09:00:00-03:00",
    publicadaEl: "2026-09-25T10:00:00-03:00",
    emailEmpresa: "restaurante@ejemplo.com",
  }),
  oferta({
    id: "ejemplo-2",
    titulo: "Jardinero o jardinera (ejemplo)",
    descripcion: "Mantenimiento de parques y jardines de casas particulares: corte de pasto, poda y riego.",
    requisitos: "Experiencia en jardinería. Se valora tener herramientas propias.",
    lugar: "Barrio de ejemplo 2",
    jornada: "Martes y jueves de 8 a 13",
    rubro: "jardineria",
    estado: "published",
    creadaEl: "2026-09-23T09:00:00-03:00",
    publicadaEl: "2026-09-24T09:00:00-03:00",
    emailEmpresa: "vivero@ejemplo.com",
  }),
  oferta({
    id: "ejemplo-3",
    titulo: "Electricista matriculado (ejemplo)",
    descripcion: "Instalaciones eléctricas en obras nuevas y reparaciones en viviendas.",
    requisitos: "Matrícula vigente. Registro de conducir.",
    lugar: "Zona de ejemplo",
    jornada: "Lunes a viernes de 7 a 15",
    rubro: "construccion",
    estado: "published",
    creadaEl: "2026-09-21T09:00:00-03:00",
    publicadaEl: "2026-09-22T12:00:00-03:00",
    emailEmpresa: "electricidad@ejemplo.com",
  }),
  oferta({
    id: "ejemplo-4",
    titulo: "Atención al público en comercio (ejemplo)",
    descripcion: "Atención en mostrador, cobro con posnet y reposición de mercadería en un comercio de barrio.",
    requisitos: "Secundario completo. Buen trato con la gente.",
    lugar: "Centro de ejemplo",
    jornada: "Turno tarde, de 15 a 21",
    rubro: "comercio",
    estado: "published",
    creadaEl: "2026-09-19T09:00:00-03:00",
    publicadaEl: "2026-09-20T08:30:00-03:00",
    emailEmpresa: "almacen@ejemplo.com",
  }),
  oferta({
    id: "ejemplo-5",
    titulo: "Chofer de reparto (ejemplo)",
    descripcion: "Reparto de mercadería a comercios de la ciudad con camioneta de la empresa.",
    requisitos: "Registro profesional. Conocer la zona.",
    lugar: "Parque industrial de ejemplo",
    jornada: "Lunes a viernes de 6 a 14",
    rubro: "transporte",
    estado: "published",
    creadaEl: "2026-09-17T09:00:00-03:00",
    publicadaEl: "2026-09-18T11:00:00-03:00",
    emailEmpresa: "distribuidora@ejemplo.com",
  }),
  // Waiting for the Office, so P15 has something to review.
  oferta({
    id: "ejemplo-6",
    titulo: "Bachero o bachera (ejemplo)",
    descripcion: "Lavado de vajilla y orden de la cocina en el turno noche.",
    requisitos: "Disponibilidad los fines de semana.",
    lugar: "Barrio de ejemplo 1",
    jornada: "Viernes a domingo de 20 a 2",
    rubro: "gastronomia",
    estado: "pending",
    creadaEl: "2026-09-27T11:00:00-03:00",
    emailEmpresa: "restaurante@ejemplo.com",
  }),
  // The test company's offers, one in each situation its screens have to show.
  oferta({
    id: "empresa-ejemplo-1",
    titulo: "Cadete en moto (ejemplo)",
    descripcion: "Entregas de pedidos a clientes de la ciudad.",
    requisitos: "Moto propia y registro vigente.",
    lugar: "Centro de ejemplo",
    jornada: "Lunes a viernes de 9 a 13",
    rubro: "transporte",
    estado: "pending",
    creadaEl: "2026-09-27T16:00:00-03:00",
    emailEmpresa: "empresa@ejemplo.com",
  }),
  oferta({
    id: "empresa-ejemplo-2",
    titulo: "Mozo o moza para salón (ejemplo)",
    descripcion: "Atención de mesas en el turno noche de un restaurante.",
    requisitos: "Experiencia de al menos 6 meses.",
    lugar: "Barrio de ejemplo 3",
    jornada: "Jueves a domingo de 19 a 1",
    rubro: "gastronomia",
    estado: "published",
    creadaEl: "2026-09-21T10:30:00-03:00",
    publicadaEl: "2026-09-22T09:00:00-03:00",
    emailEmpresa: "empresa@ejemplo.com",
  }),
  oferta({
    id: "empresa-ejemplo-3",
    titulo: "Repositor de supermercado (ejemplo)",
    descripcion: "Reposición de góndolas y control de vencimientos.",
    requisitos: "Secundario completo.",
    lugar: "Barrio de ejemplo 4",
    jornada: "Lunes a sábado de 7 a 13",
    rubro: "comercio",
    estado: "published",
    cierreSolicitado: true,
    creadaEl: "2026-09-15T09:00:00-03:00",
    publicadaEl: "2026-09-16T09:00:00-03:00",
    emailEmpresa: "empresa@ejemplo.com",
  }),
  oferta({
    id: "empresa-ejemplo-4",
    titulo: "Vendedor de mostrador (ejemplo)",
    descripcion: "Ventas.",
    requisitos: "Ninguno.",
    lugar: "Centro de ejemplo",
    jornada: "A convenir",
    rubro: "comercio",
    estado: "rejected",
    motivoRechazo: "La descripción no alcanza para entender el puesto. Contá qué tareas incluye y en qué horario.",
    creadaEl: "2026-09-12T14:00:00-03:00",
    emailEmpresa: "empresa@ejemplo.com",
  }),
  oferta({
    id: "empresa-ejemplo-5",
    titulo: "Ayudante de panadería (ejemplo)",
    descripcion: "Preparación de masas y atención del horno.",
    requisitos: "Disponibilidad para madrugar.",
    lugar: "Barrio de ejemplo 1",
    jornada: "Martes a sábado de 4 a 10",
    rubro: "gastronomia",
    estado: "closed",
    cierreSolicitado: true,
    creadaEl: "2026-08-30T08:00:00-03:00",
    publicadaEl: "2026-08-31T08:00:00-03:00",
    emailEmpresa: "empresa@ejemplo.com",
  }),
];

/** Fake applicants with a CV, so the Office sees applications (they cannot log in). */
export const POSTULANTES_DE_EJEMPLO = [
  "ana.ejemplo@ejemplo.com",
  "bruno.ejemplo@ejemplo.com",
  "carla.ejemplo@ejemplo.com",
];

export const POSTULACIONES_DE_EJEMPLO: PostulacionGuardada[] = [
  { id: "postulacion-1", ofertaId: "ejemplo-1", emailPostulante: "ana.ejemplo@ejemplo.com", estado: "applied", postuladoEl: "2026-09-26T09:15:00-03:00" },
  { id: "postulacion-2", ofertaId: "ejemplo-1", emailPostulante: "bruno.ejemplo@ejemplo.com", estado: "preselected", postuladoEl: "2026-09-25T18:40:00-03:00" },
  { id: "postulacion-3", ofertaId: "ejemplo-2", emailPostulante: "carla.ejemplo@ejemplo.com", estado: "applied", postuladoEl: "2026-09-25T11:05:00-03:00" },
  { id: "postulacion-4", ofertaId: "empresa-ejemplo-2", emailPostulante: "ana.ejemplo@ejemplo.com", estado: "referred", postuladoEl: "2026-09-23T10:00:00-03:00" },
  { id: "postulacion-5", ofertaId: "ejemplo-4", emailPostulante: "bruno.ejemplo@ejemplo.com", estado: "not_suitable", postuladoEl: "2026-09-21T16:20:00-03:00" },
];

/**
 * A tiny valid PDF with one line of text, used as the fake applicants' CV so
 * "Ver CV" opens something real. Browsers' PDF viewers accept it without the
 * cross-reference table.
 */
export function pdfDeEjemplo(texto: string): Uint8Array {
  const linea = `BT /F1 14 Tf 24 70 Td (${texto}) Tj ET`;
  const pdf = [
    "%PDF-1.4",
    "1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj",
    "2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj",
    "3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 420 144]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj",
    `4 0 obj<</Length ${linea.length}>>stream`,
    linea,
    "endstream endobj",
    "5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj",
    "trailer<</Root 1 0 R>>",
    "%%EOF",
  ].join("\n");
  return new TextEncoder().encode(pdf);
}
