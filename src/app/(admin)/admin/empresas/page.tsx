import type { Metadata } from "next";

import { VistaEmpresas } from "@/components/admin/vista-empresas";
import { datosEmpresas } from "@/lib/admin/datos";
import type { ParamsBusqueda } from "@/lib/admin/url";

export const metadata: Metadata = { title: "Empresas · Oficina de Empleo" };

export default async function AdminEmpresasPage(props: { searchParams: Promise<ParamsBusqueda> }) {
  const params = await props.searchParams;
  const { empresas } = await datosEmpresas();

  return <VistaEmpresas empresas={empresas} params={params} />;
}
