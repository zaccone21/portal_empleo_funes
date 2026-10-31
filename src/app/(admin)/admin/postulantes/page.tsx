import type { Metadata } from "next";

import { VistaPostulantes } from "@/components/admin/vista-postulantes";
import { datosPostulantes } from "@/lib/admin/datos";
import type { ParamsBusqueda } from "@/lib/admin/url";

export const metadata: Metadata = { title: "Postulantes · Oficina de Empleo" };

export default async function AdminPostulantesPage(props: { searchParams: Promise<ParamsBusqueda> }) {
  const params = await props.searchParams;
  const { postulantes } = await datosPostulantes();

  return <VistaPostulantes postulantes={postulantes} params={params} />;
}
