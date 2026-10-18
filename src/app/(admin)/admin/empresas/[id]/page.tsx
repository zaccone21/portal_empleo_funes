import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/admin/page-header";
import { PanelEmpresa } from "@/components/admin/panel-empresa";
import { datosEmpresas } from "@/lib/admin/datos";
import { leerParam, urlCon, type ParamsBusqueda } from "@/lib/admin/url";

export const metadata: Metadata = { title: "Empresa · Oficina de Empleo" };

/** Full page of one company: the same detail as the side panel. */
export default async function AdminEmpresaDetallePage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<ParamsBusqueda>;
}) {
  const { id } = await props.params;
  const params = await props.searchParams;
  const { empresas, ofertasDeSel } = await datosEmpresas({ ...params, sel: id });

  const empresa = empresas.find((e) => e.id === id);
  if (!empresa) notFound();

  const tab = leerParam(params, "tab") === "ofertas" ? "ofertas" : "resumen";
  const ruta = `/admin/empresas/${id}`;

  return (
    <>
      <PageHeader migas={["Gestión", "Empresas"]} titulo="Empresa" />
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[10px] border border-border md:max-w-3xl">
        <PanelEmpresa
          empresa={empresa}
          ofertas={ofertasDeSel}
          tab={tab}
          hrefTab={(t) => urlCon(ruta, params, { tab: t === "resumen" ? undefined : t })}
          paginaCompleta
        />
      </section>
    </>
  );
}
