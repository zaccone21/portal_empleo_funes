import { PageHeader } from "@/components/admin/page-header";
import { Split } from "@/components/admin/split";
import { StatusStrip } from "@/components/admin/status-strip";
import { TablaEmpresas } from "@/components/admin/tabla-empresas";
import { Toolbar, type FiltroToolbar } from "@/components/admin/toolbar";
import {
  CLAVES_ORDEN_EMPRESAS,
  contarVistasEmpresas,
  filtrarEmpresas,
  ORDEN_POR_DEFECTO_EMPRESAS,
  type FilaEmpresa,
} from "@/lib/admin/empresas";
import { aplicarOrden, leerOrden } from "@/lib/admin/orden";
import { leerParam, paginar, type ParamsBusqueda } from "@/lib/admin/url";
import { NOMBRE_RUBRO, RUBROS, type Rubro } from "@/lib/validation/rubros";

type Props = {
  empresas: FilaEmpresa[];
  params: ParamsBusqueda;
};

/** Screen 10 (Empresas): toolbar, status strip and the table, whose rows open the company's page (D-062). */
export function VistaEmpresas({ empresas, params }: Props) {
  const filtradas = aplicarOrden(filtrarEmpresas(empresas, params), params, CLAVES_ORDEN_EMPRESAS);
  const pagina = paginar(filtradas, Number(leerParam(params, "pagina")));
  const conteo = contarVistasEmpresas(empresas);

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
          { valor: "nuevas", etiqueta: "Nuevas (7 días)", cantidad: conteo.nuevas },
          { valor: "activas", etiqueta: "Con ofertas activas", cantidad: conteo.activas },
          { valor: "sin-ofertas", etiqueta: "Sin ofertas", cantidad: conteo.sinOfertas },
        ]}
      />
      <Toolbar placeholder="Buscar razón social o CUIT" filtros={filtros} />
      <Split
        tabla={
          <TablaEmpresas
            empresas={pagina.filas}
            pager={pagina}
            hayFiltros={hayFiltros}
            orden={leerOrden(params, CLAVES_ORDEN_EMPRESAS) ?? ORDEN_POR_DEFECTO_EMPRESAS}
          />
        }
      />
    </>
  );
}
