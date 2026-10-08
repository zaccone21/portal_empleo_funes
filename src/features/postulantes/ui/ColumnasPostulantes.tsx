import Link from "next/link";
import { MailIcon, PhoneIcon, FileCheckIcon, FileXIcon, Eye } from "lucide-react";
import type { Column } from "@/components/admin/data-table/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RubroTile } from "@/components/admin/rubro-tile";
import type { ResultadoBusquedaPostulante } from "@/lib/dal/postulantes";
import { formatearDia } from "@/lib/fechas";
import { NOMBRE_RUBRO, esRubro } from "@/lib/validation/rubros";

export const columnasRegistroPostulantes: Column<ResultadoBusquedaPostulante>[] = [
  {
    id: "postulante",
    header: "Postulante",
    sortable: true,
    cell: (row) => {
      const nombre = [row.nombre, row.apellido].filter(Boolean).join(" ");
      return (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{nombre || "Sin nombre"}</span>
          {row.dni && <span className="text-xs text-muted-foreground tabular-nums">DNI {row.dni}</span>}
        </div>
      );
    },
  },
  {
    id: "contacto",
    header: "Contacto",
    sortable: false,
    cell: (row) => (
      <div className="flex flex-col gap-1 text-sm">
        {row.email && (
          <a href={`mailto:${row.email}`} className="flex items-center gap-1.5 text-primary hover:underline underline-offset-4">
            <MailIcon className="size-3.5" />
            {row.email}
          </a>
        )}
        {row.telefono && (
          <a href={`tel:${row.telefono.replace(/[^\d+]/g, "")}`} className="flex items-center gap-1.5 text-primary hover:underline underline-offset-4 tabular-nums">
            <PhoneIcon className="size-3.5" />
            {row.telefono}
          </a>
        )}
        {!row.email && !row.telefono && <span className="text-muted-foreground">Sin contacto</span>}
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
          <div key={rubro} className="flex items-center gap-1.5" title={esRubro(rubro) ? NOMBRE_RUBRO[rubro] : rubro}>
            <RubroTile rubro={rubro} size="sm" />
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "cv",
    header: "Estado CV",
    sortable: true,
    cell: (row) => {
      if (!row.cvSubidoEl) {
        return (
          <Badge variant="outline" className="h-7 gap-1.5 border-dashed px-2.5 text-xs text-muted-foreground whitespace-nowrap">
            <FileXIcon className="size-3.5" />
            Sin CV
          </Badge>
        );
      }
      return (
        <div className="flex flex-col items-start gap-1 whitespace-nowrap">
          <Badge variant="secondary" className="h-7 gap-1.5 px-2.5 text-xs bg-brand-mint text-brand-deep">
            <FileCheckIcon className="size-3.5" />
            CV cargado
          </Badge>
          <span className="text-[10px] text-muted-foreground">Subido el {formatearDia(row.cvSubidoEl)}</span>
        </div>
      );
    },
  },
  {
    id: "acciones",
    header: "",
    sortable: false,
    cell: (row) => (
      <div className="flex justify-end">
        <Button variant="ghost" size="icon" nativeButton={false} render={<Link href={`/admin/postulantes/${row.id}`} />}>
          <Eye className="size-4" />
          <span className="sr-only">Ver postulante</span>
        </Button>
      </div>
    ),
  },
];
