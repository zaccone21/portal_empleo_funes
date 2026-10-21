"use client";

import { AdminTable, type ColumnaAdmin } from "@/components/admin/admin-table";
import { AprobarSeleccionadas } from "@/components/admin/acciones-oferta";
import { Ausente, CeldaDoble } from "@/components/admin/celdas";
import { EnlaceAccion } from "@/components/admin/enlace-accion";
import { BadgeOferta } from "@/components/admin/status-badge";
import { useUrlAdmin } from "@/hooks/useUrlAdmin";
import { fechaCorta, haceCuanto } from "@/lib/admin/fechas";
import type { ModoOfertas } from "@/lib/admin/ofertas";
import type { OfertaOficina } from "@/lib/validation/oficina";
import { NOMBRE_RUBRO } from "@/lib/validation/rubros";

type Props = {
  modo: ModoOfertas;
  ofertas: OfertaOficina[];
  conPanel: boolean;
  pager: { desde: number; hasta: number; total: number; pagina: number; paginas: number };
  hayFiltros: boolean;
};

const PISTA_TECLADO = "↑ ↓ para moverte · Enter abre · Esc cierra · / busca";

/**
 * Offers table of the Office (screens 02, 03, 04). Columns: register with the
 * panel closed shows the full set; with the panel open (or in a queue) it
 * falls back to the compact one. Only the "por revisar" queue has bulk approval.
 */
export function TablaOfertas({ modo, ofertas, conPanel, pager, hayFiltros }: Props) {
  const { construir } = useUrlAdmin();
  const cola = modo !== "registro";

  const puesto: ColumnaAdmin<OfertaOficina> = {
    id: "puesto",
    cabecera: "Puesto / empresa",
    celda: (o) => <CeldaDoble titulo={o.titulo} detalle={o.empresa?.razonSocial ?? "Sin datos de empresa"} />,
  };
  const estado: ColumnaAdmin<OfertaOficina> = {
    id: "estado",
    cabecera: "Estado",
    celda: (o) => (
      <div className="flex flex-col items-start leading-tight">
        <BadgeOferta estado={o.estado} />
        {o.cierreSolicitado && <small className="text-[11.5px] text-muted-foreground">Cierre solicitado</small>}
      </div>
    ),
  };
  const enviada: ColumnaAdmin<OfertaOficina> = {
    id: "enviada",
    cabecera: "Enviada",
    celda: (o) =>
      cola ? (
        <div className="flex flex-col leading-tight tabular-nums">
          <span>{fechaCorta(o.creadaEl)}</span>
          <small className="text-[11.5px] text-muted-foreground">{haceCuanto(o.creadaEl)}</small>
        </div>
      ) : (
        <span className="tabular-nums">{fechaCorta(o.creadaEl)}</span>
      ),
  };
  const postulaciones: ColumnaAdmin<OfertaOficina> = {
    id: "postulaciones",
    cabecera: "Postul.",
    alinear: "derecha",
    celda: (o) => o.cantidadPostulaciones,
  };

  const columnas: ColumnaAdmin<OfertaOficina>[] = cola
    ? [puesto, ...(modo === "cierres" ? [estado] : []), enviada]
    : [
        puesto,
        {
          id: "rubro",
          cabecera: "Rubro",
          soloAncha: true,
          celda: (o) => (o.rubros.length > 0 ? o.rubros.map((r) => NOMBRE_RUBRO[r]).join(", ") : <Ausente />),
        },
        estado,
        enviada,
        {
          id: "publicada",
          cabecera: "Publicada",
          soloAncha: true,
          celda: (o) => (o.publicadaEl ? <span className="tabular-nums">{fechaCorta(o.publicadaEl)}</span> : <Ausente />),
        },
        postulaciones,
        {
          id: "ver",
          cabecera: "",
          soloAncha: true,
          celda: (o) => (
            <EnlaceAccion href={construir({ sel: o.id })} scroll={false}>
              Ver
            </EnlaceAccion>
          ),
        },
      ];

  return (
    <AdminTable
      columnas={columnas}
      filas={ofertas}
      idDe={(o) => o.id}
      conPanel={conPanel}
      masiva={modo === "por-revisar" ? (ids, limpiar) => <AprobarSeleccionadas ids={ids} limpiar={limpiar} /> : undefined}
      pager={{ ...pager, pista: cola ? PISTA_TECLADO : undefined }}
      etiquetaFila={(o) => `${o.titulo}, ${o.empresa?.razonSocial ?? "sin empresa"}`}
      vacio={
        hayFiltros
          ? { titulo: "No hay ofertas con esos filtros", descripcion: "Probá con otra búsqueda o usá “Limpiar”." }
          : modo === "por-revisar"
            ? { titulo: "No hay ofertas por revisar", descripcion: "Cuando una empresa envíe una oferta nueva, la vas a ver acá." }
            : modo === "cierres"
              ? { titulo: "No hay cierres solicitados", descripcion: "Cuando una empresa pida cerrar una oferta, la vas a ver acá." }
              : { titulo: "Todavía no hay ofertas", descripcion: "Las ofertas que envíen las empresas van a aparecer acá." }
      }
    />
  );
}
