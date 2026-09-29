import type { Metadata } from "next";

import { OfertasEmpresa } from "@/components/empresa/OfertasEmpresa";
import { Seccion } from "@/components/marca/Seccion";

export const metadata: Metadata = { title: "Mis ofertas" };

/**
 * P12: the company's offers with their status (RF1.3.4–RF1.3.6), in a list
 * with the detail on the same page (D-025). The selected offer comes in
 * ?oferta=<id>; only a single string is accepted.
 */
export default async function EmpresaOfertasPage({ searchParams }: PageProps<"/empresa/ofertas">) {
  const { oferta } = await searchParams;

  return (
    <Seccion titulo="Mis ofertas" bajada="El estado de cada oferta que enviaste a la Oficina de Empleo.">
      <OfertasEmpresa seleccionadaId={typeof oferta === "string" ? oferta : undefined} />
    </Seccion>
  );
}
