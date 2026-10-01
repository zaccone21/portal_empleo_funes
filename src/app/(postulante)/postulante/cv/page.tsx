import type { Metadata } from "next";

import { MiCv } from "@/components/cv/MiCv";
import { Seccion } from "@/components/marca/Seccion";

export const metadata: Metadata = { title: "Mi CV" };

/**
 * P04: upload or replace the CV (RF1.2.3). ?oferta=<id> arrives from
 * "Postularme" when the CV was missing (RF1.4.4), to offer the way back.
 */
export default async function CvPage({ searchParams }: PageProps<"/postulante/cv">) {
  const { oferta } = await searchParams;

  return (
    <Seccion titulo="Mi CV" bajada="Subí tu currículum en PDF para postularte a las ofertas.">
      <MiCv ofertaId={typeof oferta === "string" ? oferta : undefined} />
    </Seccion>
  );
}
