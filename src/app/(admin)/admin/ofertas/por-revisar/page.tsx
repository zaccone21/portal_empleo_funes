import type { Metadata } from "next";

import { VistaOfertas } from "@/components/admin/vista-ofertas";
import { datosOfertas } from "@/lib/admin/datos";
import type { ParamsBusqueda } from "@/lib/admin/url";

export const metadata: Metadata = { title: "Ofertas por revisar" };

/** Screen 02: queue of pending offers, oldest first, with bulk approval (RF1.5.3, D-042). */
export default async function OfertasPorRevisarPage(props: { searchParams: Promise<ParamsBusqueda> }) {
  const params = await props.searchParams;
  const { ofertas, postulacionesDeSel } = await datosOfertas(params);

  return <VistaOfertas modo="por-revisar" ruta="/admin/ofertas/por-revisar" ofertas={ofertas} params={params} postulacionesDeSel={postulacionesDeSel} />;
}