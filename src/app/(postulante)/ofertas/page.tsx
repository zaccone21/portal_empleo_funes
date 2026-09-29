import type { Metadata } from "next";

import { Seccion } from "@/components/marca/Seccion";
import { OfertasPublicadas } from "@/components/ofertas/OfertasPublicadas";
import { leerFiltros } from "@/lib/catalogo";

export const metadata: Metadata = { title: "Ofertas de trabajo" };

/**
 * P05 (catalog) and P06 (detail on the same page, D-025): published offers,
 * public (RF1.4.1). The URL carries the search, trade and order (?q=,
 * ?rubro=, ?orden=; D-029) and the selected offer (?oferta=<id>). Unknown or
 * repeated values are ignored.
 */
export default async function OfertasPage({ searchParams }: PageProps<"/ofertas">) {
  const parametros = await searchParams;
  const { oferta } = parametros;

  return (
    <Seccion
      titulo="Ofertas de trabajo en Funes"
      bajada="Buscá por rubro o por palabra y elegí una oferta para postularte."
    >
      <OfertasPublicadas
        filtros={leerFiltros(parametros)}
        seleccionadaId={typeof oferta === "string" ? oferta : undefined}
      />
    </Seccion>
  );
}
