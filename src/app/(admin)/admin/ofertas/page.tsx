import type { Metadata } from "next";

import { VistaOfertas } from "@/components/admin/vista-ofertas";
import { datosOfertas } from "@/lib/admin/datos";
import type { ParamsBusqueda } from "@/lib/admin/url";

export const metadata: Metadata = { title: "Ofertas" };

/** Screen 03: register of every offer with status strip and detail panel (RF1.5.2-RF1.5.6, D-042). */
export default async function AdminOfertasPage(props: { searchParams: Promise<ParamsBusqueda> }) {
  const params = await props.searchParams;
  const { ofertas, postulacionesDeSel } = await datosOfertas(params);

  return <VistaOfertas modo="registro" ruta="/admin/ofertas" ofertas={ofertas} params={params} postulacionesDeSel={postulacionesDeSel} />;
}