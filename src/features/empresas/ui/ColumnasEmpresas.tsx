import Link from "next/link";
import { MailIcon, PhoneIcon, Eye } from "lucide-react";
import type { Column } from "@/components/admin/data-table/data-table";
import { Button } from "@/components/ui/button";
import type { EmpresaLista } from "@/lib/dal/empresas";
import { formatearFechaCorta } from "@/lib/fechas";

export const columnasRegistroEmpresas: Column<EmpresaLista>[] = [
  {
    id: "empresa",
    header: "Empresa",
    sortable: true,
    cell: (row) => (
      <div className="flex flex-col">
        <span className="font-medium text-foreground">{row.razonSocial || "Empresa sin datos"}</span>
        {row.cuit && <span className="text-xs text-muted-foreground tabular-nums">CUIT {row.cuit}</span>}
      </div>
    ),
  },
  {
    id: "contacto",
    header: "Contacto Principal",
    sortable: false,
    cell: (row) => (
      <div className="flex flex-col">
        <span className="font-medium text-sm">{row.contactoNombre || "Sin nombre"}</span>
        <div className="flex flex-col gap-0.5 mt-1 text-sm text-muted-foreground">
          {row.contactoEmail && (
            <a href={`mailto:${row.contactoEmail}`} className="flex items-center gap-1.5 hover:text-primary hover:underline underline-offset-4">
              <MailIcon className="size-3.5" />
              {row.contactoEmail}
            </a>
          )}
          {row.contactoTelefono && (
            <a href={`tel:${row.contactoTelefono.replace(/[^\d+]/g, "")}`} className="flex items-center gap-1.5 hover:text-primary hover:underline underline-offset-4 tabular-nums">
              <PhoneIcon className="size-3.5" />
              {row.contactoTelefono}
            </a>
          )}
        </div>
      </div>
    ),
  },
  {
    id: "fecha",
    header: "Registrada el",
    sortable: true,
    cell: (row) => (
      <span className="text-sm">{formatearFechaCorta(row.creadaEl)}</span>
    ),
  },
  {
    id: "acciones",
    header: "",
    sortable: false,
    cell: (row) => (
      <div className="flex justify-end">
        <Button variant="ghost" size="icon" nativeButton={false} render={<Link href={`/admin/empresas/${row.id}`} />}>
          <Eye className="size-4" />
          <span className="sr-only">Ver empresa</span>
        </Button>
      </div>
    ),
  },
];
