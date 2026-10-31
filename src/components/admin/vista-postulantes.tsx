import { PageHeader } from "@/components/admin/page-header";
import { Split } from "@/components/admin/split";
import { StatusStrip } from "@/components/admin/status-strip";
import { TablaPostulantes } from "@/components/admin/tabla-postulantes";
import { Toolbar, type FiltroToolbar } from "@/components/admin/toolbar";
import { aplicarOrden, leerOrden } from "@/lib/admin/orden";
import {
  CLAVES_ORDEN_POSTULANTES,
  contarVistasPostulantes,
  filtrarPostulantes,
  type FilaPostulante,
} from "@/lib/admin/postulantes";
import { leerParam, paginar, type ParamsBusqueda } from "@/lib/admin/url";
import { NOMBRE_RUBRO, RUBROS, type Rubro } from "@/lib/validation/rubros";

type Props = {
  postulantes: FilaPostulante[];
  params: ParamsBusqueda;
};

/**
 * Screen 09 (Postulantes): status strip, search by name/DNI/email, filters by
 * several trades (RF1.5.7) and CV status, and the table, whose rows open the
 * person's page (D-062), where they can be linked to an offer (RF1.5.8).
 */
export function VistaPostulantes({ postulantes, params }: Props) {
  const filtrados = aplicarOrden(filtrarPostulantes(postulantes, params), params, CLAVES_ORDEN_POSTULANTES);
  const pagina = paginar(filtrados, Number(leerParam(params, "pagina")));
  const conteo = contarVistasPostulantes(postulantes);

  const filtros: FiltroToolbar[] = [
    {
      tipo: "multi",
      param: "rubro",
      etiqueta: "Rubros",
      opciones: RUBROS.map((r) => ({ valor: r, etiqueta: NOMBRE_RUBRO[r as Rubro] })),
    },
    {
      tipo: "select",
      param: "cv",
      etiqueta: "CV",
      opciones: [
        { valor: "con", etiqueta: "Con CV" },
        { valor: "sin", etiqueta: "Sin CV" },
      ],
    },
  ];
  const hayFiltros = ["q", "rubro", "cv", "vista", "estado"].some((c) => Boolean(leerParam(params, c)));

  return (
    <>
      <PageHeader migas={["Gestión", "Postulantes"]} titulo="Postulantes" />
      <StatusStrip
        valorTodos="todos"
        param="vista"
        opciones={[
          { valor: "todos", etiqueta: "Todos", cantidad: conteo.todos },
          { valor: "con-cv", etiqueta: "Con CV", cantidad: conteo.conCv },
          { valor: "sin-cv", etiqueta: "Sin CV", cantidad: conteo.sinCv },
          { valor: "incompleto", etiqueta: "Perfil incompleto", cantidad: conteo.incompleto },
        ]}
      />
      <Toolbar placeholder="Buscar nombre, apellido o DNI" filtros={filtros} />
      <Split
        tabla={
          <TablaPostulantes
            postulantes={pagina.filas}
            pager={pagina}
            hayFiltros={hayFiltros}
            orden={leerOrden(params, CLAVES_ORDEN_POSTULANTES)}
          />
        }
      />
    </>
  );
}
