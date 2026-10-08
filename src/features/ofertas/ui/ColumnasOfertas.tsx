import Link from "next/link";
import { Eye } from "lucide-react";

import type { Column } from "@/components/admin/data-table/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { RubroTile } from "@/components/admin/rubro-tile";
import { Button } from "@/components/ui/button";
import { ESTADOS_OFERTA } from "@/features/ofertas/domain/estados";
import { antiguedad, formatearFechaCorta } from "@/lib/fechas";
import type { OfertaOficina } from "@/lib/validation/oficina";
import { NOMBRE_RUBRO } from "@/lib/validation/rubros";

export const columnasRegistroOfertas: Column<OfertaOficina>[] = [
  {
    id: "puesto",
    header: "Puesto",
    sortable: true,
    cell: (row) => (
      <div className="flex flex-col">
        <span className="font-medium text-foreground">{row.titulo}</span>
        <span className="text-xs text-muted-foreground">{row.empresa?.razonSocial || "Empresa"}</span>
      </div>
    ),
  },
  {
    id: "rubros",
    header: "Rubros",
    sortable: false,
    cell: (row) => (
      <div className="flex items-center gap-1.5 flex-wrap max-w-[200px]">
        {row.rubros?.map((rubro) => (
          <div key={rubro} className="flex items-center gap-1.5" title={NOMBRE_RUBRO[rubro]}>
            <RubroTile rubro={rubro} size="sm" />
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "estado",
    header: "Estado",
    sortable: false,
    cell: (row) => {
      const info = ESTADOS_OFERTA[row.estado];
      return (
        <div className="flex flex-col items-start gap-1">
          <StatusBadge etiqueta={info.etiqueta} tono={info.tono} />
          {row.estado === "publicada" && row.cierreSolicitado && (
            <span className="text-[10px] font-semibold text-warning uppercase">Cierre Solicitado</span>
          )}
        </div>
      );
    },
  },
  {
    id: "fecha",
    header: "Publicada / Enviada",
    sortable: true,
    cell: (row) => {
      // D.2: fecha en formato argentino + antigüedad atenuada debajo. Valor ausente = un único "—".
      const fechaBase = row.publicadaEl || row.creadaEl;
      if (!fechaBase) return <span className="text-muted-foreground opacity-50">—</span>;

      return (
        <div className="flex flex-col">
          <span className="text-sm">{formatearFechaCorta(fechaBase)}</span>
          <span className="text-xs text-muted-foreground">{antiguedad(fechaBase)}</span>
        </div>
      );
    },
  },
  {
    id: "postulaciones",
    header: "Postulantes",
    sortable: false,
    cell: (row) => (
      <div className="text-right pr-4">
        <span className="text-sm font-medium tabular-nums">{row.cantidadPostulaciones}</span>
      </div>
    ),
  },
  {
    id: "acciones",
    header: "",
    sortable: false,
    cell: (row) => (
      <div className="flex justify-end">
        <Button variant="ghost" size="icon" nativeButton={false} render={<Link href={`/admin/ofertas/${row.id}`} />}>
          <Eye className="size-4" />
          <span className="sr-only">Ver oferta</span>
        </Button>
      </div>
    ),
  },
];
