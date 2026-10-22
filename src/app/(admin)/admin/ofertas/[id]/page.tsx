import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FichaOferta } from "@/components/admin/ficha-oferta";
import { operadorActual } from "@/lib/admin/datos";
import { destinoEnCola } from "@/lib/admin/ofertas";
import { leerDesde, urlCon, type ParamsBusqueda } from "@/lib/admin/url";
import { verOferta, verOfertas, verPostulacionesAdmin } from "@/lib/use-cases/oficina";

export const metadata: Metadata = { title: "Oferta · Oficina de Empleo" };

/** Full page of one offer (D-062), with its applications and, from a queue, the way to the next one. */
export default async function AdminOfertaPage(props: { params: Promise<{ id: string }>; searchParams: Promise<ParamsBusqueda> }) {
  const { id } = await props.params;
  const params = await props.searchParams;
  const usuario = await operadorActual();
  const desde = leerDesde(params);

  const [resultado, resPostulaciones, resOfertas] = await Promise.all([
    verOferta(usuario, id),
    verPostulacionesAdmin(usuario),
    verOfertas(usuario),
  ]);
  if (!resultado.ok) notFound();

  return (
    <FichaOferta
      oferta={resultado.datos}
      postulaciones={resPostulaciones.ok ? resPostulaciones.datos.filter((p) => p.oferta.id === id) : []}
      volver={desde ?? "/admin/ofertas"}
      aqui={urlCon(`/admin/ofertas/${id}`, params, {})}
      destinoTrasDecidir={resOfertas.ok ? destinoEnCola(resOfertas.datos, id, desde) : undefined}
    />
  );
}
