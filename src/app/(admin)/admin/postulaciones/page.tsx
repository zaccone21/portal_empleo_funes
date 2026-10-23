import type { Metadata } from "next";

import { PageHeader } from "@/components/admin/page-header";
import { StatusStrip } from "@/components/admin/status-strip";
import { TablaPostulacionesRegistro } from "@/components/admin/tabla-postulaciones-registro";
import { Toolbar, type FiltroToolbar } from "@/components/admin/toolbar";
import { datosPostulaciones } from "@/lib/admin/datos";
import { aplicarOrden, leerOrden } from "@/lib/admin/orden";
import {
  CLAVES_ORDEN_POSTULACIONES,
  contarPorEstadoPostulaciones,
  empresasDePostulaciones,
  filtrarPostulaciones,
  ORDEN_POR_DEFECTO_POSTULACIONES,
  postulacionesDelModo,
} from "@/lib/admin/postulaciones";
import { leerParam, paginar, type ParamsBusqueda } from "@/lib/admin/url";
import { NOMBRE_RUBRO, RUBROS, type Rubro } from "@/lib/validation/rubros";

export const metadata: Metadata = { title: "Postulaciones · Oficina de Empleo" };

export default async function AdminPostulacionesPage(props: {
  searchParams: Promise<ParamsBusqueda>;
}) {
  const params = await props.searchParams;
  const { postulaciones } = await datosPostulaciones(params);

  const delModo = postulacionesDelModo(postulaciones, "registro");
  const filtradas = aplicarOrden(filtrarPostulaciones(delModo, params, "registro"), params, CLAVES_ORDEN_POSTULACIONES);
  const orden = leerOrden(params, CLAVES_ORDEN_POSTULACIONES) ?? ORDEN_POR_DEFECTO_POSTULACIONES["registro"];
  const pagina = paginar(filtradas, Number(leerParam(params, "pagina")));
  const conteo = contarPorEstadoPostulaciones(postulaciones);

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
  const hayFiltros = ["q", "empresa", "rubro", "estado"].some((c) => Boolean(leerParam(params, c)));

  return (
    <>
      <PageHeader migas={["Gestión", "Postulaciones"]} titulo="Postulaciones" />
      <StatusStrip
        valorTodos="todas"
        opciones={[
          { valor: "todas", etiqueta: "Todas", cantidad: conteo.todas },
          { valor: "postulado", etiqueta: "Nuevas", cantidad: conteo.postulado },
          { valor: "preseleccionado", etiqueta: "Preseleccionadas", cantidad: conteo.preseleccionado },
          { valor: "derivado", etiqueta: "Derivadas", cantidad: conteo.derivado },
          { valor: "no_apto", etiqueta: "No aptas", cantidad: conteo.no_apto },
        ]}
      />
      <Toolbar placeholder="Buscar puesto, postulante o empresa" filtros={filtros} />
      <TablaPostulacionesRegistro
        postulaciones={pagina.filas}
        pager={pagina}
        hayFiltros={hayFiltros}
        orden={orden}
      />
    </>
  );
}
