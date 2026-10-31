"use client";

import { AdminTable, type ColumnaAdmin } from "@/components/admin/admin-table";
import { Ausente, CeldaDoble, nombreCompleto } from "@/components/admin/celdas";
import { EnlaceAccion } from "@/components/admin/enlace-accion";
import { StatusBadge } from "@/components/admin/status-badge";
import { useUrlAdmin } from "@/hooks/useUrlAdmin";
import type { OrdenTabla } from "@/lib/admin/orden";
import { perfilIncompleto, tieneCv, type FilaPostulante } from "@/lib/admin/postulantes";
import { NOMBRE_RUBRO, type Rubro } from "@/lib/validation/rubros";

type Props = {
  postulantes: FilaPostulante[];
  pager: { desde: number; hasta: number; total: number; pagina: number; paginas: number };
  hayFiltros: boolean;
  /** The order asked in the URL, to mark its column (D-063); without one, no column is marked. */
  orden?: OrdenTabla;
};

/** Badge of the CV state: "CV cargado" or "Sin CV". */
export function BadgeCv({ cargado }: { cargado: boolean }) {
  return cargado ? <StatusBadge etiqueta="CV cargado" tono="success" /> : <StatusBadge etiqueta="Sin CV" tono="neutral" />;
}

/** Applicants table (screen 09): every row opens the person's page (D-062). */
export function TablaPostulantes({ postulantes, pager, hayFiltros, orden }: Props) {
  const { detalle } = useUrlAdmin();

  const columnas: ColumnaAdmin<FilaPostulante>[] = [
    {
      id: "postulante",
      cabecera: "Postulante",
      ordenable: true,
      celda: (p) => {
        const nombre = nombreCompleto(p);
        return nombre ? (
          <CeldaDoble titulo={nombre} detalle={p.dni ? `DNI ${p.dni}` : <Ausente />} />
        ) : (
          <div className="flex items-center gap-2">
            <CeldaDoble titulo="Sin nombre cargado" detalle={p.email ?? undefined} />
            {perfilIncompleto(p) && <StatusBadge etiqueta="Perfil incompleto" tono="attention" />}
          </div>
        );
      },
    },
    {
      id: "rubros",
      cabecera: "Rubros",
      ordenable: true,
      celda: (p) => (p.rubros.length > 0 ? p.rubros.map((r) => NOMBRE_RUBRO[r as Rubro] ?? r).join(", ") : <Ausente />),
    },
    { id: "cv", cabecera: "CV", ordenable: true, celda: (p) => <BadgeCv cargado={tieneCv(p)} /> },
    { id: "postulaciones", cabecera: "Postul.", alinear: "derecha", ordenable: true, celda: (p) => p.cantidadPostulaciones },
    {
      id: "ver",
      cabecera: "",
      alinear: "derecha",
      celda: (p) => <EnlaceAccion href={detalle(`/admin/postulantes/${p.id}`)}>Ver</EnlaceAccion>,
    },
  ];

  return (
    <AdminTable
      columnas={columnas}
      filas={postulantes}
      idDe={(p) => p.id}
      hrefFila={(p) => detalle(`/admin/postulantes/${p.id}`)}
      orden={orden}
      pager={pager}
      etiquetaFila={(p) => nombreCompleto(p) ?? "Postulante sin nombre cargado"}
      vacio={
        hayFiltros
          ? { titulo: "No hay postulantes con esos filtros", descripcion: "Probá con otra búsqueda o usá “Limpiar”." }
          : { titulo: "Todavía no hay postulantes", descripcion: "Las personas que se registren van a aparecer acá." }
      }
    />
  );
}
