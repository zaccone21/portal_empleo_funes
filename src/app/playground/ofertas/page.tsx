import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Seccion } from "@/components/marca/Seccion";
import { AvisoPostulacion } from "@/components/ofertas/AvisoPostulacion";
import { ListaOfertas } from "@/components/ofertas/ListaOfertas";
import { ListaPostulaciones } from "@/components/postulaciones/ListaPostulaciones";
import type { OfertaPublica } from "@/lib/validation/ofertas";
import type { PostulacionPropia } from "@/lib/validation/postulaciones";

export const metadata: Metadata = { title: "Vista previa de ofertas" };

/*
 * TEMPORARY (DT-003): preview of the offer screens with fake data, because
 * the offers API does not exist yet (the database is not modeled). Fake data
 * lives only here and in tests (D-009); it is obviously fake ("(ejemplo)").
 * The real screens are /ofertas and /postulante/postulaciones.
 * In production this page answers 404. Delete it when the API exists.
 */

const OFERTAS_DE_EJEMPLO: OfertaPublica[] = [
  {
    id: "ejemplo-1",
    titulo: "Ayudante de cocina (ejemplo)",
    descripcion:
      "Preparación de ingredientes, limpieza de la cocina y apoyo al cocinero en el servicio del mediodía.\nOferta de ejemplo para la vista previa.",
    requisitos: "Ganas de aprender. Libreta sanitaria o disposición para tramitarla.",
    lugar: "Barrio de ejemplo 1",
    jornada: "Lunes a sábado de 10 a 16",
    rubro: "otros",
    publicadaEl: "2026-09-25T10:00:00-03:00",
    yaTePostulaste: false,
  },
  {
    id: "ejemplo-2",
    titulo: "Jardinero o jardinera (ejemplo)",
    descripcion: "Mantenimiento de parques y jardines de casas particulares: corte de pasto, poda y riego.",
    requisitos: "Experiencia en jardinería. Se valora tener herramientas propias.",
    lugar: "Barrio de ejemplo 2",
    jornada: "Martes y jueves de 8 a 13",
    rubro: "otros",
    publicadaEl: "2026-09-24T09:00:00-03:00",
    yaTePostulaste: false,
  },
  {
    id: "ejemplo-3",
    titulo: "Electricista matriculado (ejemplo)",
    descripcion: "Instalaciones eléctricas en obras nuevas y reparaciones en viviendas.",
    requisitos: "Matrícula vigente. Registro de conducir.",
    lugar: "Zona de ejemplo",
    jornada: "Lunes a viernes de 7 a 15",
    rubro: "otros",
    publicadaEl: "2026-09-22T12:00:00-03:00",
    yaTePostulaste: false,
  },
  {
    id: "ejemplo-4",
    titulo: "Atención al público en comercio (ejemplo)",
    descripcion: "Atención en mostrador, cobro con posnet y reposición de mercadería en un comercio de barrio.",
    requisitos: "Secundario completo. Buen trato con la gente.",
    lugar: "Centro de ejemplo",
    jornada: "Turno tarde, de 15 a 21",
    rubro: "otros",
    publicadaEl: "2026-09-20T08:30:00-03:00",
    yaTePostulaste: false,
  },
  {
    id: "ejemplo-5",
    titulo: "Chofer de reparto (ejemplo)",
    descripcion: "Reparto de mercadería a comercios de la ciudad con camioneta de la empresa.",
    requisitos: "Registro profesional. Conocer la zona.",
    lugar: "Parque industrial de ejemplo",
    jornada: "Lunes a viernes de 6 a 14",
    rubro: "otros",
    publicadaEl: "2026-09-18T11:00:00-03:00",
    yaTePostulaste: false,
  },
];

const POSTULACIONES_DE_EJEMPLO: PostulacionPropia[] = [
  {
    id: "postulacion-ejemplo-1",
    postuladoEl: "2026-09-26T18:20:00-03:00",
    oferta: { id: "ejemplo-1", titulo: "Ayudante de cocina (ejemplo)", lugar: "Barrio de ejemplo 1" },
  },
  {
    id: "postulacion-ejemplo-2",
    postuladoEl: "2026-09-23T09:05:00-03:00",
    oferta: { id: "ejemplo-4", titulo: "Atención al público en comercio (ejemplo)", lugar: "Centro de ejemplo" },
  },
];

export default function PlaygroundOfertasPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <div className="flex min-h-dvh flex-1 flex-col bg-brand-deep">
      <Seccion
        titulo="Vista previa: ofertas de trabajo"
        bajada="Datos de ejemplo. El botón Postularme llama a la API real, que todavía no existe."
      >
        <div className="flex flex-col gap-14">
          <section className="flex flex-col gap-4">
            <h2 className="text-2xl font-semibold">P05 y P06: listado y detalle</h2>
            <ListaOfertas ofertas={OFERTAS_DE_EJEMPLO} />
          </section>
          <section className="flex flex-col gap-4">
            <h2 className="text-2xl font-semibold">Resultados de Postularme</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <AvisoPostulacion resultado={{ tipo: "postulado" }} ofertaId="ejemplo-1" />
              <AvisoPostulacion resultado={{ tipo: "sin_sesion" }} ofertaId="ejemplo-1" />
              <AvisoPostulacion
                resultado={{ tipo: "falta_cv", mensaje: "Para postularte tenés que subir tu CV." }}
                ofertaId="ejemplo-1"
              />
              <AvisoPostulacion
                resultado={{ tipo: "error", mensaje: "No pudimos completar la operación. Probá de nuevo en unos minutos." }}
                ofertaId="ejemplo-1"
              />
            </div>
          </section>
          <section className="flex flex-col gap-4">
            <h2 className="text-2xl font-semibold">P07: mis postulaciones</h2>
            <ListaPostulaciones postulaciones={POSTULACIONES_DE_EJEMPLO} />
          </section>
        </div>
      </Seccion>
    </div>
  );
}
