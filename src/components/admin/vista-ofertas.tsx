import { PageHeader } from "@/components/admin/page-header";
import { PanelLateral } from "@/components/admin/panel-lateral";
import { PanelOferta } from "@/components/admin/panel-oferta";
import { Split } from "@/components/admin/split";
import { StatusStrip } from "@/components/admin/status-strip";
import { TablaOfertas } from "@/components/admin/tabla-ofertas";
import { Toolbar, type FiltroToolbar } from "@/components/admin/toolbar";
import {
  contarPorEstado,
  empresasDeOfertas,
  filtrarOfertas,
  OPCIONES_FECHA,
  ofertasDelModo,
  type ModoOfertas,
} from "@/lib/admin/ofertas";
import { leerParam, paginar, siguienteId, urlCon, type ParamsBusqueda } from "@/lib/admin/url";
import type { OfertaOficina, PostulacionAdmin } from "@/lib/validation/oficina";
import { NOMBRE_RUBRO, RUBROS } from "@/lib/validation/rubros";

type Props = {
  modo: ModoOfertas;
  ruta: string;
  /** Every offer; the view filters it by mode and URL. */
  ofertas: OfertaOficina[];
  params: ParamsBusqueda;
  /** Applications of the selected offer, loaded only for the "Postulaciones" tab. */
  postulacionesDeSel?: PostulacionAdmin[];
};

const TITULOS: Record<ModoOfertas, { migas: string[]; titulo: string }> = {
  registro: { migas: ["Gestión", "Ofertas"], titulo: "Ofertas" },
  "por-revisar": { migas: ["Tareas pendientes", "Ofertas por revisar"], titulo: "Ofertas por revisar" },
  cierres: { migas: ["Tareas pendientes", "Cierres solicitados"], titulo: "Cierres solicitados" },
};

/**
 * One screen for the three offer views (02, 03, 04; D-042): header, status
 * strip (register only), toolbar and the split with table and detail panel.
 * Everything it shows comes from the URL, so each state can be shared.
 */
export function VistaOfertas({ modo, ruta, ofertas, params, postulacionesDeSel }: Props) {
  const delModo = ofertasDelModo(ofertas, modo);
  const filtradas = filtrarOfertas(delModo, params, modo);
  const pagina = paginar(filtradas, Number(leerParam(params, "pagina")));
  const conteo = contarPorEstado(ofertas);

  const selId = leerParam(params, "sel");
  const seleccionada = selId ? delModo.find((o) => o.id === selId) : undefined;
  const tab = leerParam(params, "tab") === "postulaciones" ? "postulaciones" : "resumen";

  const filtros: FiltroToolbar[] = [
    { tipo: "select", param: "empresa", etiqueta: "Empresa", opciones: empresasDeOfertas(delModo) },
    { tipo: "select", param: "rubro", etiqueta: "Rubro", opciones: RUBROS.map((r) => ({ valor: r, etiqueta: NOMBRE_RUBRO[r] })) },
    ...(modo === "registro" ? [{ tipo: "select" as const, param: "fecha", etiqueta: "Fecha", opciones: OPCIONES_FECHA }] : []),
  ];
  const hayFiltros = ["q", "empresa", "rubro", "fecha", ...(modo === "registro" ? ["estado"] : [])].some((c) => leerParam(params, c));

  const { migas, titulo } = TITULOS[modo];

  return (
    <>
      <PageHeader migas={migas} titulo={titulo} aside={modo === "registro" ? undefined : "Orden: más antiguas primero"} />
      {modo === "registro" && (
        <StatusStrip
          valorTodos="todas"
          opciones={[
            { valor: "todas", etiqueta: "Todas", cantidad: conteo.todas },
            { valor: "pendiente", etiqueta: "Pendientes", cantidad: conteo.pendiente },
            { valor: "publicada", etiqueta: "Publicadas", cantidad: conteo.publicada },
            { valor: "rechazada", etiqueta: "Rechazadas", cantidad: conteo.rechazada },
            { valor: "cerrada", etiqueta: "Cerradas", cantidad: conteo.cerrada },
          ]}
        />
      )}
      <Toolbar placeholder="Buscar puesto o empresa" filtros={filtros} />
      <Split
        tabla={<TablaOfertas modo={modo} ofertas={pagina.filas} conPanel={Boolean(seleccionada)} pager={pagina} hayFiltros={hayFiltros} />}
        panel={
          seleccionada && (
            <PanelLateral>
              <PanelOferta
                oferta={seleccionada}
                tab={tab}
                postulaciones={postulacionesDeSel}
                hrefTab={(t) => urlCon(ruta, params, { tab: t === "resumen" ? undefined : t })}
                avanzar={modo !== "registro"}
                siguienteId={siguienteId(filtradas.map((o) => o.id), seleccionada.id)}
                conAvisoCierre={modo === "cierres"}
              />
            </PanelLateral>
          )
        }
      />
    </>
  );
}
