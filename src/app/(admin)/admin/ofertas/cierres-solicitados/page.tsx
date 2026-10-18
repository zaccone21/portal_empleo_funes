import type { Metadata } from "next";

import { VistaOfertas } from "@/components/admin/vista-ofertas";
import { datosOfertas } from "@/lib/admin/datos";
import type { ParamsBusqueda } from "@/lib/admin/url";

export const metadata: Metadata = { title: "Cierres solicitados" };

/** Screen 04: queue of published offers whose company asked to close them (RF1.5.4, D-037). */
export default async function CierresSolicitadosPage(props: { searchParams: Promise<ParamsBusqueda> }) {
  const params = await props.searchParams;
  const { ofertas, postulacionesDeSel } = await datosOfertas(params);

  return <VistaOfertas modo="cierres" ruta="/admin/ofertas/cierres-solicitados" ofertas={ofertas} params={params} postulacionesDeSel={postulacionesDeSel} />;
}