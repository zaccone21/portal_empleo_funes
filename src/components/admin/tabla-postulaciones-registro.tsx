"use client";

import { AdminTable, type ColumnaAdmin } from "@/components/admin/admin-table";
import { Ausente, CeldaDoble, nombreCompleto } from "@/components/admin/celdas";
import { EnlaceAccion } from "@/components/admin/enlace-accion";
import { BadgeDecisionEmpresa, BadgePostulacion } from "@/components/admin/status-badge";
import { useUrlAdmin } from "@/hooks/useUrlAdmin";
import { fechaCorta } from "@/lib/admin/fechas";
import type { PostulacionAdmin } from "@/lib/validation/oficina";

type Props = {
  postulaciones: PostulacionAdmin[];
  pager: { desde: number; hasta: number; total: number; pagina: number; paginas: number };
  hayFiltros: boolean;
};

/** Screen 08 table: historical register of all applications. */
export function TablaPostulacionesRegistro({ postulaciones, pager, hayFiltros }: Props) {
  const { detalle } = useUrlAdmin();
  const columnas: ColumnaAdmin<PostulacionAdmin>[] = [
    {
      id: "postulante",
      cabecera: "Postulante",
      celda: (p) => {
        const nombre = nombreCompleto(p.postulante);
        return (
          <CeldaDoble
            titulo={nombre || "Sin nombre cargado"}
            detalle={p.postulante.dni ? `DNI ${p.postulante.dni}` : <Ausente />}
          />
        );
      },
    },
    {
      id: "puesto",
      cabecera: "Puesto y empresa",
      celda: (p) => (
        <CeldaDoble
          titulo={p.oferta.titulo}
          detalle={p.oferta.empresa?.razonSocial ?? "Empresa"}
        />
      ),
    },
    {
      id: "estado",
      cabecera: "Estado",
      celda: (p) => <BadgePostulacion estado={p.estado} />,
    },
    {
      id: "resultado",
      cabecera: "Resultado con la empresa",
      // Only a referred application has a company answer (D-044); the rest have none to show.
      celda: (p) => (p.estado === "derivado" ? <BadgeDecisionEmpresa decision={p.decisionEmpresa} /> : <Ausente />),
    },
    {
      id: "fecha",
      cabecera: "Fecha",
      alinear: "derecha",
      celda: (p) => fechaCorta(p.postuladoEl),
    },
    {
      id: "accion",
      cabecera: "",
      alinear: "derecha",
      celda: (p) => (
        <EnlaceAccion href={detalle(`/admin/postulaciones/${p.id}`)}>Ver</EnlaceAccion>
      ),
    },
  ];

  return (
    <div className="overflow-hidden rounded-[10px] border border-border">
      <AdminTable
        columnas={columnas}
        filas={postulaciones}
        idDe={(p) => p.id}
        hrefFila={(p) => detalle(`/admin/postulaciones/${p.id}`)}
        pager={pager}
        etiquetaFila={(p) =>
          `${nombreCompleto(p.postulante) ?? "Postulante"} para ${p.oferta.titulo}`
        }
        vacio={
          hayFiltros
            ? {
                titulo: "No hay postulaciones con esos filtros",
                descripcion: "Probá con otra búsqueda o usá “Limpiar”.",
              }
            : {
                titulo: "Todavía no hay postulaciones registradas",
                descripcion: "Las postulaciones que hagan los postulantes van a aparecer acá.",
              }
        }
      />
    </div>
  );
}
