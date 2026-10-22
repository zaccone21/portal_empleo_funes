import { PageHeader } from "@/components/admin/page-header";
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
import { leerParam, paginar, type ParamsBusqueda } from "@/lib/admin/url";
import type { OfertaOficina } from "@/lib/validation/oficina";
import { NOMBRE_RUBRO, RUBROS } from "@/lib/validation/rubros";

type Props = {
  modo: ModoOfertas;
  /** Every offer; the view filters it by mode and URL. */
  ofertas: OfertaOficina[];
  params: ParamsBusqueda;
};

const TITULOS: Record<ModoOfertas, { migas: string[]; titulo: string }> = {
  registro: { migas: ["Gestión", "Ofertas"], titulo: "Ofertas" },
  "por-revisar": { migas: ["Tareas pendientes", "Ofertas por revisar"], titulo: "Ofertas por revisar" },
  cierres: { migas: ["Tareas pendientes", "Cierres solicitados"], titulo: "Cierres solicitados" },
};

/**
 * One screen for the three offer views (02, 03, 04; D-042): header, status
 * strip (register only), toolbar and the table, whose rows open the offer's
 * page (D-062). Everything it shows comes from the URL, so each state can be shared.
 */
export function VistaOfertas({ modo, ofertas, params }: Props) {
  const delModo = ofertasDelModo(ofertas, modo);
  const filtradas = filtrarOfertas(delModo, params, modo);
  const pagina = paginar(filtradas, Number(leerParam(params, "pagina")));
  const conteo = contarPorEstado(ofertas);

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
      <Split tabla={<TablaOfertas modo={modo} ofertas={pagina.filas} pager={pagina} hayFiltros={hayFiltros} />} />
    </>
  );
}
