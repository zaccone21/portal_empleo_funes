"use client";

import { AdminTable, type ColumnaAdmin } from "@/components/admin/admin-table";
import { Ausente, CeldaDoble } from "@/components/admin/celdas";
import { EnlaceAccion } from "@/components/admin/enlace-accion";
import { BadgeEstadoEmpresa, StatusBadge } from "@/components/admin/status-badge";
import { useUrlAdmin } from "@/hooks/useUrlAdmin";
import type { OrdenTabla } from "@/lib/admin/orden";
import { perfilEmpresaIncompleto, type FilaEmpresa } from "@/lib/admin/empresas";
import { fechaCorta } from "@/lib/admin/fechas";
import { NOMBRE_RUBRO, type Rubro } from "@/lib/validation/rubros";

type Props = {
  empresas: FilaEmpresa[];
  pager: { desde: number; hasta: number; total: number; pagina: number; paginas: number };
  hayFiltros: boolean;
  /** The order the rows come in, to mark its column (D-063). */
  orden: OrdenTabla;
};

/** Companies table (screen 10): every row opens the company's page (D-062). */
export function TablaEmpresas({ empresas, pager, hayFiltros, orden }: Props) {
  const { detalle } = useUrlAdmin();

  const columnas: ColumnaAdmin<FilaEmpresa>[] = [
    {
      id: "empresa",
      cabecera: "Empresa",
      ordenable: true,
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
      ordenable: true,
      celda: (e) =>
        e.rubros.length > 0 ? e.rubros.map((r) => NOMBRE_RUBRO[r as Rubro] ?? r).join(", ") : <Ausente />,
    },
    {
      id: "estado",
      cabecera: "Estado",
      ordenable: true,
      celda: (e) => <BadgeEstadoEmpresa estado={e.estado} />,
    },
    {
      id: "registrada",
      cabecera: "Registrada",
      ordenable: true,
      celda: (e) => <span className="tabular-nums">{fechaCorta(e.creadaEl)}</span>,
    },
    {
      id: "activas",
      cabecera: "Activas",
      ordenable: true,
      alinear: "derecha",
      celda: (e) => e.ofertasActivas,
    },
    {
      id: "totales",
      cabecera: "Totales",
      ordenable: true,
      alinear: "derecha",
      celda: (e) => e.ofertasTotales,
    },
    {
      id: "ver",
      cabecera: "",
      alinear: "derecha",
      celda: (e) => <EnlaceAccion href={detalle(`/admin/empresas/${e.id}`)}>Ver</EnlaceAccion>,
    },
  ];

  return (
    <AdminTable
      columnas={columnas}
      filas={empresas}
      idDe={(e) => e.id}
      hrefFila={(e) => detalle(`/admin/empresas/${e.id}`)}
      orden={orden}
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
