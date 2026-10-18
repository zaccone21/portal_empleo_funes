import type { Metadata } from "next";

import { PageHeader } from "@/components/admin/page-header";
import { TablaPostulacionesNuevas } from "@/components/admin/tabla-postulaciones-nuevas";
import { Toolbar, type FiltroToolbar } from "@/components/admin/toolbar";
import { datosPostulaciones } from "@/lib/admin/datos";
import {
  empresasDePostulaciones,
  filtrarPostulaciones,
  postulacionesDelModo,
} from "@/lib/admin/postulaciones";
import { leerParam, paginar, type ParamsBusqueda } from "@/lib/admin/url";
import { NOMBRE_RUBRO, RUBROS, type Rubro } from "@/lib/validation/rubros";

export const metadata: Metadata = { title: "Postulaciones nuevas · Oficina de Empleo" };

export default async function AdminPostulacionesPorEvaluarPage(props: {
  searchParams: Promise<ParamsBusqueda>;
}) {
  const params = await props.searchParams;
  const { postulaciones } = await datosPostulaciones(params);

  const delModo = postulacionesDelModo(postulaciones, "por-evaluar");
  const filtradas = filtrarPostulaciones(delModo, params, "por-evaluar");
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
        migas={["Tareas pendientes", "Postulaciones nuevas"]}
        titulo="Postulaciones nuevas"
        aside="Orden: más antiguas primero"
      />
      <Toolbar placeholder="Buscar puesto, postulante o empresa" filtros={filtros} />
      <TablaPostulacionesNuevas
        postulaciones={pagina.filas}
        pager={pagina}
        hayFiltros={hayFiltros}
      />
    </>
  );
}
