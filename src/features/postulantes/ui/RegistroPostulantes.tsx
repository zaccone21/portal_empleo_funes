"use client";

import { useSearchParams } from "next/navigation";
import { DataTable } from "@/components/admin/data-table/data-table";
import { FilterBar } from "@/components/admin/filter-bar";
import { PageHeader } from "@/components/admin/page-header";
import type { ResultadoBusquedaPostulante } from "@/lib/dal/postulantes";
import { columnasRegistroPostulantes } from "./ColumnasPostulantes";

type Props = {
  postulantes: ResultadoBusquedaPostulante[];
};

export function RegistroPostulantes({ postulantes }: Props) {
  const searchParams = useSearchParams();

  // Paginación y Ordenamiento local
  const filtradas = [...postulantes];
  const sortCol = searchParams.get("orden");
  const sortDir = searchParams.get("dir") || "asc";

  if (sortCol) {
    filtradas.sort((a, b) => {
      let valA = "";
      let valB = "";
      if (sortCol === "postulante") {
        valA = [a.nombre, a.apellido].join(" ").toLowerCase();
        valB = [b.nombre, b.apellido].join(" ").toLowerCase();
      } else if (sortCol === "cv") {
        valA = a.cvSubidoEl || "";
        valB = b.cvSubidoEl || "";
      }

      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  } else {
    // default sort by date created or something, since we might not have createdAt in ResultadoBusquedaPostulante, sort by name
    filtradas.sort((a, b) => {
      const nameA = [a.nombre, a.apellido].join(" ").toLowerCase();
      const nameB = [b.nombre, b.apellido].join(" ").toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }

  const pageSize = Number(searchParams.get("limite")) || 25;
  const currentPage = Number(searchParams.get("pagina")) || 1;
  const total = filtradas.length;
  const startIndex = (currentPage - 1) * pageSize;
  const pagedData = filtradas.slice(startIndex, startIndex + pageSize);

  return (
    <>
      <PageHeader
        titulo="Registro de postulantes"
        descripcion="Buscá a las personas registradas en el portal por nombre, DNI o datos de contacto."
        conPatron
      />
      
      <div className="flex flex-col gap-4">
        <FilterBar placeholderBuscar="Buscar por nombre, DNI o email..." />

        <DataTable
          data={pagedData}
          columns={columnasRegistroPostulantes}
          idAccessor={(row) => row.id}
          totalElements={total}
          pageSize={pageSize}
          currentPage={currentPage}
        />
      </div>
    </>
  );
}
