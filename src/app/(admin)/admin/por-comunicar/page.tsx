import type { Metadata } from "next";

import { PageHeader } from "@/components/admin/page-header";
import { TablaPorComunicar } from "@/components/admin/tabla-por-comunicar";
import { Toolbar, type FiltroToolbar } from "@/components/admin/toolbar";
import { datosPostulaciones } from "@/lib/admin/datos";
import { aplicarOrden, leerOrden } from "@/lib/admin/orden";
import {
  CLAVES_ORDEN_POSTULACIONES,
  empresasDePostulaciones,
  filtrarPostulaciones,
  ORDEN_POR_DEFECTO_POSTULACIONES,
  postulacionesDelModo,
} from "@/lib/admin/postulaciones";
import { leerParam, paginar, type ParamsBusqueda } from "@/lib/admin/url";
import { NOMBRE_RUBRO, RUBROS, type Rubro } from "@/lib/validation/rubros";

export const metadata: Metadata = { title: "Por comunicar / derivar · Oficina de Empleo" };

export default async function AdminPorComunicarPage(props: {
  searchParams: Promise<ParamsBusqueda>;
}) {
  const params = await props.searchParams;
  const { postulaciones } = await datosPostulaciones(params);

  const delModo = postulacionesDelModo(postulaciones, "por-comunicar");
  const filtradas = aplicarOrden(filtrarPostulaciones(delModo, params, "por-comunicar"), params, CLAVES_ORDEN_POSTULACIONES);
  const orden = leerOrden(params, CLAVES_ORDEN_POSTULACIONES) ?? ORDEN_POR_DEFECTO_POSTULACIONES["por-comunicar"];
  const pagina = paginar(filtradas, Number(leerParam(params, "pagina")));

  const filtros: FiltroToolbar[] = [
    {
      tipo: "select",
      param: "empresa",
      etiqueta: "Empresa",
      opciones: empresasDePostulaciones(delModo),
    },
    {
      tipo: "select",
      param: "rubro",
      etiqueta: "Rubro",
      opciones: RUBROS.map((r) => ({ valor: r, etiqueta: NOMBRE_RUBRO[r as Rubro] })),
    },
  ];
  const hayFiltros = ["q", "empresa", "rubro"].some((c) => Boolean(leerParam(params, c)));

  return (
    <>
      <PageHeader
        migas={["Tareas pendientes", "Por comunicar / derivar"]}
        titulo="Por comunicar / derivar"
      />
      <Toolbar placeholder="Buscar puesto, postulante o empresa" filtros={filtros} />
      <TablaPorComunicar
        postulaciones={pagina.filas}
        pager={pagina}
        hayFiltros={hayFiltros}
        orden={orden}
      />
    </>
  );
}
