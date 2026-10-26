"use client";

import { AdminTable, type ColumnaAdmin } from "@/components/admin/admin-table";
import { AprobarSeleccionadas } from "@/components/admin/acciones-oferta";
import { Ausente, CeldaDoble } from "@/components/admin/celdas";
import { EnlaceAccion } from "@/components/admin/enlace-accion";
import { BadgeOferta } from "@/components/admin/status-badge";
import { useUrlAdmin } from "@/hooks/useUrlAdmin";
import type { OrdenTabla } from "@/lib/admin/orden";
import { fechaCorta, haceCuanto } from "@/lib/admin/fechas";
import type { ModoOfertas } from "@/lib/admin/ofertas";
import type { OfertaOficina } from "@/lib/validation/oficina";
import { NOMBRE_RUBRO } from "@/lib/validation/rubros";

type Props = {
  modo: ModoOfertas;
  ofertas: OfertaOficina[];
  pager: { desde: number; hasta: number; total: number; pagina: number; paginas: number };
  hayFiltros: boolean;
  /** The order the rows come in, to mark its column (D-063). */
  orden: OrdenTabla;
};

const PISTA_TECLADO = "Tab para moverte · Enter abre · / busca";

/**
 * Offers table of the Office (screens 02, 03, 04). The register shows the full
 * set of columns and the queues the compact one; every row opens the offer's
 * page (D-062). Only the "por revisar" queue has bulk approval.
 */
export function TablaOfertas({ modo, ofertas, pager, hayFiltros, orden }: Props) {
  const { detalle } = useUrlAdmin();
  const cola = modo !== "registro";

  const puesto: ColumnaAdmin<OfertaOficina> = {
    id: "puesto",
    cabecera: "Puesto / empresa",
    ordenable: true,
    celda: (o) => <CeldaDoble titulo={o.titulo} detalle={o.empresa?.razonSocial ?? "Sin datos de empresa"} />,
  };
  const estado: ColumnaAdmin<OfertaOficina> = {
    id: "estado",
    cabecera: "Estado",
    ordenable: true,
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
    ordenable: true,
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
    ordenable: true,
    alinear: "derecha",
    celda: (o) => o.cantidadPostulaciones,
  };

  const ver: ColumnaAdmin<OfertaOficina> = {
    id: "ver",
    cabecera: "",
    alinear: "derecha",
    celda: (o) => (
      <EnlaceAccion href={detalle(`/admin/ofertas/${o.id}`)} variante={cola ? "primario" : "secundario"}>
        {cola ? "Resolver" : "Ver"}
      </EnlaceAccion>
    ),
  };

  const columnas: ColumnaAdmin<OfertaOficina>[] = cola
    ? [puesto, ...(modo === "cierres" ? [estado] : []), enviada, ver]
    : [
        puesto,
        {
          id: "rubro",
          cabecera: "Rubro",
          ordenable: true,
          celda: (o) => (o.rubros.length > 0 ? o.rubros.map((r) => NOMBRE_RUBRO[r]).join(", ") : <Ausente />),
        },
        estado,
        enviada,
        {
          id: "publicada",
          cabecera: "Publicada",
          ordenable: true,
          celda: (o) => (o.publicadaEl ? <span className="tabular-nums">{fechaCorta(o.publicadaEl)}</span> : <Ausente />),
        },
        postulaciones,
        ver,
      ];

  return (
    <AdminTable
      columnas={columnas}
      filas={ofertas}
      idDe={(o) => o.id}
      hrefFila={(o) => detalle(`/admin/ofertas/${o.id}`)}
      orden={orden}
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
