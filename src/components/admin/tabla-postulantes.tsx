"use client";

import { AdminTable, type ColumnaAdmin } from "@/components/admin/admin-table";
import { Ausente, CeldaDoble, nombreCompleto } from "@/components/admin/celdas";
import { EnlaceAccion } from "@/components/admin/enlace-accion";
import { StatusBadge } from "@/components/admin/status-badge";
import { useUrlAdmin } from "@/hooks/useUrlAdmin";
import { perfilIncompleto, tieneCv, type FilaPostulante } from "@/lib/admin/postulantes";
import { NOMBRE_RUBRO, type Rubro } from "@/lib/validation/rubros";

type Props = {
  postulantes: FilaPostulante[];
  conPanel: boolean;
  pager: { desde: number; hasta: number; total: number; pagina: number; paginas: number };
  hayFiltros: boolean;
};

/** Badge of the CV state: "CV cargado" or "Sin CV". */
export function BadgeCv({ cargado }: { cargado: boolean }) {
  return cargado ? <StatusBadge etiqueta="CV cargado" tono="success" /> : <StatusBadge etiqueta="Sin CV" tono="neutral" />;
}

/** Applicants table (screen 09): compact with the panel open, wider without it. */
export function TablaPostulantes({ postulantes, conPanel, pager, hayFiltros }: Props) {
  const { construir } = useUrlAdmin();

  const columnas: ColumnaAdmin<FilaPostulante>[] = [
    {
      id: "postulante",
      cabecera: "Postulante",
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
      soloAncha: true,
      celda: (p) => (p.rubros.length > 0 ? p.rubros.map((r) => NOMBRE_RUBRO[r as Rubro] ?? r).join(", ") : <Ausente />),
    },
    { id: "cv", cabecera: "CV", celda: (p) => <BadgeCv cargado={tieneCv(p)} /> },
    { id: "postulaciones", cabecera: "Postul.", alinear: "derecha", celda: (p) => p.cantidadPostulaciones },
    {
      id: "ver",
      cabecera: "",
      soloAncha: true,
      celda: (p) => (
        <EnlaceAccion href={construir({ sel: p.id })} scroll={false}>
          Ver
        </EnlaceAccion>
      ),
    },
  ];

  return (
    <AdminTable
      columnas={columnas}
      filas={postulantes}
      idDe={(p) => p.id}
      conPanel={conPanel}
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
