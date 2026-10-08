import type { Metadata } from "next";

import { Seccion } from "@/components/marca/Seccion";
import { BusquedaPostulantes } from "@/components/oficina/BusquedaPostulantes";
import { leerFiltrosPostulantes } from "@/lib/busqueda-postulantes";

export const metadata: Metadata = { title: "Búsqueda de postulantes" };

/**
 * P16: the Office's applicant search (RF1.5.7). The URL carries the text
 * (?q=) and the chosen trades (?rubro=, once per trade), so a search can be
 * shared and the back button undoes it.
 */
export default async function AdminPostulantesPage({ searchParams }: PageProps<"/admin/postulantes">) {
  const filtros = leerFiltrosPostulantes(await searchParams);

  return (
    <Seccion
      titulo="Búsqueda de postulantes"
      bajada="Encontrá a las personas registradas por nombre, DNI o rubro, y escribiles o llamalas de un toque."
    >
      <BusquedaPostulantes filtros={filtros} />
    </Seccion>
  );
}
