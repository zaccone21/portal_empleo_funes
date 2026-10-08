"use client";

import { useSearchParams } from "next/navigation";
import { DataTable } from "@/components/admin/data-table/data-table";
import { FilterBar } from "@/components/admin/filter-bar";
import { PageHeader } from "@/components/admin/page-header";
import type { EmpresaLista } from "@/lib/dal/empresas";
import { columnasRegistroEmpresas } from "./ColumnasEmpresas";

type Props = {
  empresas: EmpresaLista[];
};

export function RegistroEmpresas({ empresas }: Props) {
  const searchParams = useSearchParams();

  // Paginación y Ordenamiento local
  const filtradas = [...empresas];
  const sortCol = searchParams.get("orden");
  const sortDir = searchParams.get("dir") || "asc";

  if (sortCol) {
    filtradas.sort((a, b) => {
      let valA = "";
      let valB = "";
      if (sortCol === "empresa") {
        valA = (a.razonSocial || "").toLowerCase();
        valB = (b.razonSocial || "").toLowerCase();
      } else if (sortCol === "fecha") {
        valA = a.creadaEl;
        valB = b.creadaEl;
      }

      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  } else {
    // default sort
    filtradas.sort((a, b) => b.creadaEl.localeCompare(a.creadaEl));
  }

  const pageSize = Number(searchParams.get("limite")) || 25;
  const currentPage = Number(searchParams.get("pagina")) || 1;
  const total = filtradas.length;
  const startIndex = (currentPage - 1) * pageSize;
  const pagedData = filtradas.slice(startIndex, startIndex + pageSize);

  return (
    <>
      <PageHeader
        titulo="Registro de empresas"
        descripcion="Administrá las cuentas de las empresas registradas en el portal de empleo."
        conPatron
      />
      
      <div className="flex flex-col gap-4">
        <FilterBar placeholderBuscar="Buscar por razón social, CUIT o email..." />

        <DataTable
          data={pagedData}
          columns={columnasRegistroEmpresas}
          idAccessor={(row) => row.id}
          totalElements={total}
          pageSize={pageSize}
          currentPage={currentPage}
        />
      </div>
    </>
  );
}
