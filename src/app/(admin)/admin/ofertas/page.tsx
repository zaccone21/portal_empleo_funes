import type { Metadata } from "next";

import { Seccion } from "@/components/marca/Seccion";
import { GestionOfertas } from "@/components/oficina/GestionOfertas";
import { estadoOfertaSchema } from "@/lib/validation/ofertas";

export const metadata: Metadata = { title: "Gestión de ofertas" };

/**
 * P15: the Office's offer management (RF1.5.2–RF1.5.6). The URL carries the
 * status tab (?estado=, "pendiente" by default or when unknown) and the
 * selected offer (?oferta=<id>).
 */
export default async function AdminOfertasPage({ searchParams }: PageProps<"/admin/ofertas">) {
  const { estado, oferta } = await searchParams;
  const estadoValido = estadoOfertaSchema.safeParse(estado);

  return (
    <Seccion titulo="Gestión de ofertas" bajada="Revisá las ofertas nuevas, cerrá las que piden cierre y seguí a los postulantes.">
      <GestionOfertas
        estado={estadoValido.success ? estadoValido.data : "pendiente"}
        seleccionadaId={typeof oferta === "string" ? oferta : undefined}
      />
    </Seccion>
  );
}
