import { PageHeader } from "@/components/admin/page-header";
import { PanelEmpresa } from "@/components/admin/panel-empresa";
import { PanelLateral } from "@/components/admin/panel-lateral";
import { Split } from "@/components/admin/split";
import { StatusStrip } from "@/components/admin/status-strip";
import { TablaEmpresas } from "@/components/admin/tabla-empresas";
import { Toolbar, type FiltroToolbar } from "@/components/admin/toolbar";
import {
  contarVistasEmpresas,
  filtrarEmpresas,
  type FilaEmpresa,
} from "@/lib/admin/empresas";
import { leerParam, paginar, urlCon, type ParamsBusqueda } from "@/lib/admin/url";
import type { OfertaOficina } from "@/lib/validation/oficina";
import { NOMBRE_RUBRO, RUBROS, type Rubro } from "@/lib/validation/rubros";

type Props = {
  ruta: string;
  empresas: FilaEmpresa[];
  params: ParamsBusqueda;
  ofertasDeSel: OfertaOficina[];
};

/** Screen 10 (Empresas): toolbar, status strip, split table + detail panel. */
export function VistaEmpresas({ ruta, empresas, params, ofertasDeSel }: Props) {
  const filtradas = filtrarEmpresas(empresas, params);
  const pagina = paginar(filtradas, Number(leerParam(params, "pagina")));
  const conteo = contarVistasEmpresas(empresas);

  const selId = leerParam(params, "sel");
  const seleccionada = selId ? empresas.find((e) => e.id === selId) : undefined;
  const tab = leerParam(params, "tab") === "ofertas" ? "ofertas" : "resumen";

  const filtros: FiltroToolbar[] = [
    {
      tipo: "select",
      param: "rubro",
      etiqueta: "Rubro",
      opciones: RUBROS.map((r) => ({ valor: r, etiqueta: NOMBRE_RUBRO[r as Rubro] })),
    },
  ];
  const hayFiltros = ["q", "rubro", "vista", "estado"].some((c) => Boolean(leerParam(params, c)));

  return (
    <>
      <PageHeader migas={["Gestión", "Empresas"]} titulo="Empresas" />
      <StatusStrip
        valorTodos="todas"
        param="vista"
        opciones={[
          { valor: "todas", etiqueta: "Todas", cantidad: conteo.todas },
          { valor: "activas", etiqueta: "Con ofertas activas", cantidad: conteo.activas },
          { valor: "sin-ofertas", etiqueta: "Sin ofertas", cantidad: conteo.sinOfertas },
        ]}
      />
      <Toolbar placeholder="Buscar razón social o CUIT" filtros={filtros} />
      <Split
        tabla={
          <TablaEmpresas
            empresas={pagina.filas}
            conPanel={Boolean(seleccionada)}
            pager={pagina}
            hayFiltros={hayFiltros}
          />
        }
        panel={
          seleccionada && (
            <PanelLateral>
              <PanelEmpresa
                empresa={seleccionada}
                ofertas={ofertasDeSel}
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
