"use client";

import Link from "next/link";

import { AdminTable, type ColumnaAdmin } from "@/components/admin/admin-table";
import { Ausente, CeldaDoble, nombreCompleto } from "@/components/admin/celdas";
import { BadgeCv } from "@/components/admin/tabla-postulantes";
import { diasDesde } from "@/lib/admin/fechas";
import type { PostulacionAdmin } from "@/lib/validation/oficina";
import { NOMBRE_RUBRO, type Rubro } from "@/lib/validation/rubros";

type Props = {
  postulaciones: PostulacionAdmin[];
  pager: { desde: number; hasta: number; total: number; pagina: number; paginas: number };
  hayFiltros: boolean;
};

/** Screen 05 table: new applications queue waiting for evaluation. */
export function TablaPostulacionesNuevas({ postulaciones, pager, hayFiltros }: Props) {
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
      id: "rubros",
      cabecera: "Rubros",
      soloAncha: true,
      celda: (p) =>
        p.oferta.rubros.length > 0 ? (
          p.oferta.rubros.map((r) => NOMBRE_RUBRO[r as Rubro] ?? r).join(", ")
        ) : (
          <Ausente />
        ),
    },
    {
      id: "cv",
      cabecera: "CV",
      celda: (p) => <BadgeCv cargado={Boolean(p.postulante.cvNombre)} />,
    },
    {
      id: "espera",
      cabecera: "Espera",
      alinear: "derecha",
      celda: (p) => {
        const dias = diasDesde(p.postuladoEl);
        if (dias === 0) return "Hoy";
        return `${dias} d`;
      },
    },
    {
      id: "accion",
      cabecera: "",
      alinear: "derecha",
      celda: (p) => (
        <Link
          href={`/admin/postulaciones/${p.id}`}
          className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
        >
          Evaluar →
        </Link>
      ),
    },
  ];

  return (
    <div className="overflow-hidden rounded-[10px] border border-border">
      <AdminTable
        columnas={columnas}
        filas={postulaciones}
        idDe={(p) => p.id}
        conPanel={false}
        hrefFila={(p) => `/admin/postulaciones/${p.id}`}
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
                titulo: "No hay postulaciones nuevas",
                descripcion: "Todas las postulaciones recibidas fueron evaluadas.",
              }
        }
      />
    </div>
  );
}
