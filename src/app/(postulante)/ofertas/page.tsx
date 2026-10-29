import type { Metadata } from "next";

import { OfertasPublicadas } from "@/components/ofertas/OfertasPublicadas";
import { leerFiltros } from "@/lib/catalogo";

export const metadata: Metadata = { title: "Ofertas de trabajo" };

/**
 * P05 (catalog) and P06 (detail on the same page, D-025): published offers,
 * public (RF1.4.1). Computrabajo-style viewport lock layout on desktop (no window scroll,
 * independent scroll on cards list, immobile detail panel).
 * The URL carries the search, trade and order (?q=, ?rubro=, ?orden=; D-029)
 * and the selected offer (?oferta=<id>). Unknown or repeated values are ignored.
 */
export default async function OfertasPage({ searchParams }: PageProps<"/ofertas">) {
  const parametros = await searchParams;
  const { oferta } = parametros;

  return (
    <main
      id="contenido"
      className="flex flex-1 flex-col bg-muted min-h-0 lg:h-[calc(100dvh-4.5rem)] lg:max-h-[calc(100dvh-4.5rem)] lg:overflow-hidden pb-[calc(var(--alto-barra-inferior,0px))] lg:pb-0"
    >
      <h1 className="sr-only">Ofertas de trabajo en Funes</h1>
      <OfertasPublicadas
        filtros={leerFiltros(parametros)}
        seleccionadaId={typeof oferta === "string" ? oferta : undefined}
      />
    </main>
  );
}
