import type { OfertaPublica } from "@/lib/validation/ofertas";

/*
 * TEMPORARY (DT-003): fake published offers for the simulated API. Obviously
 * fake on purpose: every title ends in "(ejemplo)" and places are
 * "de ejemplo" (D-009).
 */
export const OFERTAS_DE_EJEMPLO: OfertaPublica[] = [
  {
    id: "ejemplo-1",
    titulo: "Ayudante de cocina (ejemplo)",
    descripcion:
      "Preparación de ingredientes, limpieza de la cocina y apoyo al cocinero en el servicio del mediodía.\nEs una oferta de ejemplo.",
    requisitos: "Ganas de aprender. Libreta sanitaria o disposición para tramitarla.",
    lugar: "Barrio de ejemplo 1",
    jornada: "Lunes a sábado de 10 a 16",
    publicadaEl: "2026-09-25T10:00:00-03:00",
  },
  {
    id: "ejemplo-2",
    titulo: "Jardinero o jardinera (ejemplo)",
    descripcion: "Mantenimiento de parques y jardines de casas particulares: corte de pasto, poda y riego.",
    requisitos: "Experiencia en jardinería. Se valora tener herramientas propias.",
    lugar: "Barrio de ejemplo 2",
    jornada: "Martes y jueves de 8 a 13",
    publicadaEl: "2026-09-24T09:00:00-03:00",
  },
  {
    id: "ejemplo-3",
    titulo: "Electricista matriculado (ejemplo)",
    descripcion: "Instalaciones eléctricas en obras nuevas y reparaciones en viviendas.",
    requisitos: "Matrícula vigente. Registro de conducir.",
    lugar: "Zona de ejemplo",
    jornada: "Lunes a viernes de 7 a 15",
    publicadaEl: "2026-09-22T12:00:00-03:00",
  },
  {
    id: "ejemplo-4",
    titulo: "Atención al público en comercio (ejemplo)",
    descripcion: "Atención en mostrador, cobro con posnet y reposición de mercadería en un comercio de barrio.",
    requisitos: "Secundario completo. Buen trato con la gente.",
    lugar: "Centro de ejemplo",
    jornada: "Turno tarde, de 15 a 21",
    publicadaEl: "2026-09-20T08:30:00-03:00",
  },
  {
    id: "ejemplo-5",
    titulo: "Chofer de reparto (ejemplo)",
    descripcion: "Reparto de mercadería a comercios de la ciudad con camioneta de la empresa.",
    requisitos: "Registro profesional. Conocer la zona.",
    lugar: "Parque industrial de ejemplo",
    jornada: "Lunes a viernes de 6 a 14",
    publicadaEl: "2026-09-18T11:00:00-03:00",
  },
];
