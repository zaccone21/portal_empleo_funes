import { PageHeader } from "@/components/admin/page-header";
import { PanelLateral } from "@/components/admin/panel-lateral";
import { PanelPostulante } from "@/components/admin/panel-postulante";
import { Split } from "@/components/admin/split";
import { StatusStrip } from "@/components/admin/status-strip";
import { TablaPostulantes } from "@/components/admin/tabla-postulantes";
import { Toolbar, type FiltroToolbar } from "@/components/admin/toolbar";
import {
  contarVistasPostulantes,
  filtrarPostulantes,
  type FilaPostulante,
} from "@/lib/admin/postulantes";
import { leerParam, paginar, urlCon, type ParamsBusqueda } from "@/lib/admin/url";
import type { PostulacionAdmin } from "@/lib/validation/oficina";
import { NOMBRE_RUBRO, RUBROS, type Rubro } from "@/lib/validation/rubros";

type Props = {
  ruta: string;
  postulantes: FilaPostulante[];
  params: ParamsBusqueda;
  postulacionesDeSel: PostulacionAdmin[];
};

/**
 * Screen 09 (Postulantes): status strip, search by name/DNI/email,
 * filters by trade and CV status, split table + detail panel with tabs.
 */
export function VistaPostulantes({ ruta, postulantes, params, postulacionesDeSel }: Props) {
  const filtrados = filtrarPostulantes(postulantes, params);
  const pagina = paginar(filtrados, Number(leerParam(params, "pagina")));
  const conteo = contarVistasPostulantes(postulantes);

  const selId = leerParam(params, "sel");
  const seleccionado = selId ? postulantes.find((p) => p.id === selId) : undefined;
  const tab = leerParam(params, "tab") === "postulaciones" ? "postulaciones" : "resumen";

  const filtros: FiltroToolbar[] = [
    {
      tipo: "select",
      param: "rubro",
      etiqueta: "Rubro",
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
            conPanel={Boolean(seleccionado)}
            pager={pagina}
            hayFiltros={hayFiltros}
          />
        }
        panel={
          seleccionado && (
            <PanelLateral>
              <PanelPostulante
                postulante={seleccionado}
                postulaciones={postulacionesDeSel}
                tab={tab}
                hrefTab={(t) => urlCon(ruta, params, { tab: t === "resumen" ? undefined : t })}
              />
            </PanelLateral>
          )
        }
      />
    </>
  );
}
