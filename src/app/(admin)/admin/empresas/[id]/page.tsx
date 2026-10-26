import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FichaEmpresa } from "@/components/admin/ficha-empresa";
import { datosEmpresas } from "@/lib/admin/datos";
import { leerDesde, urlCon, type ParamsBusqueda } from "@/lib/admin/url";

export const metadata: Metadata = { title: "Empresa · Oficina de Empleo" };

/** Full page of one company (D-062): its contact, data and every offer. */
export default async function AdminEmpresaDetallePage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<ParamsBusqueda>;
}) {
  const { id } = await props.params;
  const params = await props.searchParams;
  const { empresas, ofertas } = await datosEmpresas();

  const empresa = empresas.find((e) => e.id === id);
  if (!empresa) notFound();

  return (
    <FichaEmpresa
      empresa={empresa}
      ofertas={ofertas.filter((o) => o.empresaId === id).sort((a, b) => b.creadaEl.localeCompare(a.creadaEl))}
      volver={leerDesde(params) ?? "/admin/empresas"}
      aqui={urlCon(`/admin/empresas/${id}`, params, {})}
    />
  );
}
