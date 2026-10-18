import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/admin/page-header";
import { PanelOferta } from "@/components/admin/panel-oferta";
import { operadorActual } from "@/lib/admin/datos";
import { leerParam, urlCon, type ParamsBusqueda } from "@/lib/admin/url";
import { verOferta, verPostulacionesAdmin } from "@/lib/use-cases/oficina";

export const metadata: Metadata = { title: "Oferta" };

/** Full page of one offer: the same detail as the side panel (D-042). */
export default async function AdminOfertaPage(props: { params: Promise<{ id: string }>; searchParams: Promise<ParamsBusqueda> }) {
  const { id } = await props.params;
  const params = await props.searchParams;
  const usuario = await operadorActual();

  const resultado = await verOferta(usuario, id);
  if (!resultado.ok) notFound();

  const tab = leerParam(params, "tab") === "postulaciones" ? "postulaciones" : "resumen";
  const todas = tab === "postulaciones" ? await verPostulacionesAdmin(usuario) : null;
  const postulaciones = todas?.ok ? todas.datos.filter((p) => p.oferta.id === id) : undefined;
  const ruta = `/admin/ofertas/${id}`;

  return (
    <>
      <PageHeader migas={["Gestión", "Ofertas"]} titulo="Oferta" />
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[10px] border border-border md:max-w-3xl">
        <PanelOferta
          oferta={resultado.datos}
          tab={tab}
          postulaciones={postulaciones}
          hrefTab={(t) => urlCon(ruta, params, { tab: t === "resumen" ? undefined : t })}
          paginaCompleta
        />
      </section>
    </>
  );
}
