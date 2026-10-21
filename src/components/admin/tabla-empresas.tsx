"use client";

import { AdminTable, type ColumnaAdmin } from "@/components/admin/admin-table";
import { Ausente, CeldaDoble } from "@/components/admin/celdas";
import { EnlaceAccion } from "@/components/admin/enlace-accion";
import { StatusBadge } from "@/components/admin/status-badge";
import { useUrlAdmin } from "@/hooks/useUrlAdmin";
import { perfilEmpresaIncompleto, type FilaEmpresa } from "@/lib/admin/empresas";
import { NOMBRE_RUBRO, type Rubro } from "@/lib/validation/rubros";

type Props = {
  empresas: FilaEmpresa[];
  conPanel: boolean;
  pager: { desde: number; hasta: number; total: number; pagina: number; paginas: number };
  hayFiltros: boolean;
};

/** Companies table (screen 10): compact with panel, wide without it. */
export function TablaEmpresas({ empresas, conPanel, pager, hayFiltros }: Props) {
  const { construir } = useUrlAdmin();

  const columnas: ColumnaAdmin<FilaEmpresa>[] = [
    {
      id: "empresa",
      cabecera: "Empresa",
      celda: (e) => {
        const razonSocial = e.razonSocial?.trim();
        return razonSocial ? (
          <CeldaDoble titulo={razonSocial} detalle={e.cuit ? `CUIT ${e.cuit}` : <Ausente />} />
        ) : (
          <div className="flex items-center gap-2">
            <CeldaDoble titulo="Sin razón social" detalle={e.contactoEmail ?? undefined} />
            {perfilEmpresaIncompleto(e) && <StatusBadge etiqueta="Perfil incompleto" tono="attention" />}
          </div>
        );
      },
    },
    {
      id: "rubros",
      cabecera: "Rubros",
      soloAncha: true,
      celda: (e) =>
        e.rubros.length > 0 ? e.rubros.map((r) => NOMBRE_RUBRO[r as Rubro] ?? r).join(", ") : <Ausente />,
    },
    {
      id: "activas",
      cabecera: "Activas",
      alinear: "derecha",
      celda: (e) => e.ofertasActivas,
    },
    {
      id: "totales",
      cabecera: "Totales",
      alinear: "derecha",
      celda: (e) => e.ofertasTotales,
    },
    {
      id: "ver",
      cabecera: "",
      soloAncha: true,
      celda: (e) => (
        <EnlaceAccion href={construir({ sel: e.id })} scroll={false}>
          Ver
        </EnlaceAccion>
      ),
    },
  ];

  return (
    <AdminTable
      columnas={columnas}
      filas={empresas}
      idDe={(e) => e.id}
      conPanel={conPanel}
      pager={pager}
      etiquetaFila={(e) => e.razonSocial ?? "Empresa sin razón social"}
      vacio={
        hayFiltros
          ? { titulo: "No hay empresas con esos filtros", descripcion: "Probá con otra búsqueda o usá “Limpiar”." }
          : { titulo: "Todavía no hay empresas", descripcion: "Las empresas que se registren van a aparecer acá." }
      }
    />
  );
}
