import type { Metadata } from "next";

import { Seccion } from "@/components/marca/Seccion";
import { OfertasPublicadas } from "@/components/ofertas/OfertasPublicadas";

export const metadata: Metadata = { title: "Ofertas de trabajo" };

/**
 * P05 (list) and P06 (detail on the same page, D-025): published offers,
 * public (RF1.4.1). The selected offer comes in ?oferta=<id>; only a single
 * string is accepted (a repeated parameter is ignored).
 */
export default async function OfertasPage({ searchParams }: PageProps<"/ofertas">) {
  const { oferta } = await searchParams;

  return (
    <Seccion
      titulo="Ofertas de trabajo en Funes"
      bajada="Elegí una oferta para ver qué piden y postularte."
    >
      <OfertasPublicadas seleccionadaId={typeof oferta === "string" ? oferta : undefined} />
    </Seccion>
  );
}
