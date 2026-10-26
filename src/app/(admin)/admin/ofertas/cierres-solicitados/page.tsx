import type { Metadata } from "next";

import { VistaOfertas } from "@/components/admin/vista-ofertas";
import { datosOfertas } from "@/lib/admin/datos";
import type { ParamsBusqueda } from "@/lib/admin/url";

export const metadata: Metadata = { title: "Cierres solicitados" };

/** Screen 04: queue of published offers whose company asked to close them (RF1.5.4, D-042). */
export default async function CierresSolicitadosPage(props: { searchParams: Promise<ParamsBusqueda> }) {
  const params = await props.searchParams;
  const { ofertas } = await datosOfertas();

  return <VistaOfertas modo="cierres" ofertas={ofertas} params={params} />;
}