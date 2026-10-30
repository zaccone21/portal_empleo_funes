import type { Metadata } from "next";

import { OfertasEmpresa } from "@/components/empresa/OfertasEmpresa";

export const metadata: Metadata = { title: "Mis ofertas" };

/**
 * P12: the company's offers with their status (RF1.3.4–RF1.3.6), in a list
 * with the detail on the same page (D-025), styled Computrabajo-like with viewport lock.
 * The selected offer comes in ?oferta=<id>; only a single string is accepted.
 */
export default async function EmpresaOfertasPage({ searchParams }: PageProps<"/empresa/ofertas">) {
  const { oferta } = await searchParams;

  return (
    <main
      id="contenido"
      className="flex flex-1 flex-col bg-muted min-h-0 lg:h-[calc(100dvh-4.5rem)] lg:max-h-[calc(100dvh-4.5rem)] lg:overflow-hidden pb-[calc(var(--alto-barra-inferior,0px))] lg:pb-0"
    >
      <h1 className="sr-only">Mis ofertas</h1>
      <div className="flex-1 min-h-0 mx-auto w-full max-w-[1680px] px-4 py-4 sm:px-6 lg:px-8 flex flex-col">
        <OfertasEmpresa seleccionadaId={typeof oferta === "string" ? oferta : undefined} />
      </div>
    </main>
  );
}
