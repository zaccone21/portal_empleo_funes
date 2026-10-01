import type { Metadata } from "next";

import { Seccion } from "@/components/marca/Seccion";
import { MisPostulaciones } from "@/components/postulaciones/MisPostulaciones";

export const metadata: Metadata = { title: "Mis postulaciones" };

/** P07: the applicant's applications, without status (RF1.2.4). */
export default function PostulacionesPage() {
  return (
    <Seccion titulo="Mis postulaciones" bajada="Las ofertas a las que te postulaste.">
      <MisPostulaciones />
    </Seccion>
  );
}
