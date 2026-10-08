"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";

import { DataTable } from "@/components/admin/data-table/data-table";
import { FilterBar } from "@/components/admin/filter-bar";
import { PageHeader } from "@/components/admin/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { OfertaOficina } from "@/lib/validation/oficina";
import { columnasRegistroOfertas } from "./ColumnasOfertas";

type Props = {
  ofertas: OfertaOficina[];
};

export function RegistroOfertas({ ofertas }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const q = searchParams.get("q")?.toLowerCase() || "";
  const estado = searchParams.get("estado") || "todas";
  
  // Filtrado en el cliente para el prototipo (idealmente se hace en el server/DB en un refactor mayor)
  let filtradas = ofertas;
  
  if (estado !== "todas") {
    filtradas = filtradas.filter(o => o.estado === estado);
  }
  
  if (q) {
    filtradas = filtradas.filter(o => 
      o.titulo.toLowerCase().includes(q) || 
      (o.empresa?.razonSocial.toLowerCase() || "").includes(q)
    );
  }

  // Ordenamiento
  const sortCol = searchParams.get("orden");
  const sortDir = searchParams.get("dir") || "asc";
  
  if (sortCol) {
    filtradas = [...filtradas].sort((a, b) => {
      let valA = "";
      let valB = "";
      if (sortCol === "puesto") {
        valA = a.titulo.toLowerCase();
        valB = b.titulo.toLowerCase();
      } else if (sortCol === "fecha") {
        valA = a.publicadaEl || a.creadaEl;
        valB = b.publicadaEl || b.creadaEl;
      }
      
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  } else {
    // Default sort: más recientes primero
    filtradas = [...filtradas].sort((a, b) => b.creadaEl.localeCompare(a.creadaEl));
  }

  // Paginación
  const pageSize = Number(searchParams.get("limite")) || 25;
  const currentPage = Number(searchParams.get("pagina")) || 1;
  
  const total = filtradas.length;
  const startIndex = (currentPage - 1) * pageSize;
  const pagedData = filtradas.slice(startIndex, startIndex + pageSize);

  return (
    <>
      <PageHeader
        titulo="Gestión de ofertas"
        descripcion="Revisá el registro completo de ofertas, filtrá por estado y buscalas por nombre o empresa."
        conPatron
      />
      
      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-0 sm:p-6">
          <div className="flex flex-col gap-4">
            <FilterBar 
              placeholderBuscar="Buscar por puesto o empresa..." 
              filtros={
                <Tabs 
                  value={estado} 
                  onValueChange={(val) => {
                    const params = new URLSearchParams(searchParams.toString());
                    if (val === "todas") params.delete("estado");
                    else params.set("estado", val);
                    params.delete("pagina");
                    router.push(`${pathname}?${params.toString()}`);
                  }}
                  className="w-full sm:w-auto"
                >
                  <TabsList className="w-full sm:w-auto overflow-x-auto justify-start h-10 bg-muted/50 p-1">
                    <TabsTrigger value="todas" className="rounded-sm">Todas</TabsTrigger>
                    <TabsTrigger value="pendiente" className="rounded-sm text-warning data-[state=active]:bg-warning/10 data-[state=active]:text-warning">Pendientes</TabsTrigger>
                    <TabsTrigger value="publicada" className="rounded-sm text-success data-[state=active]:bg-success/10 data-[state=active]:text-success">Publicadas</TabsTrigger>
                    <TabsTrigger value="rechazada" className="rounded-sm text-destructive data-[state=active]:bg-destructive/10 data-[state=active]:text-destructive">Rechazadas</TabsTrigger>
                    <TabsTrigger value="cerrada" className="rounded-sm">Cerradas</TabsTrigger>
                  </TabsList>
                </Tabs>
              }
            />

            <DataTable
              data={pagedData}
              columns={columnasRegistroOfertas}
              idAccessor={(row) => row.id}
              totalElements={total}
              pageSize={pageSize}
              currentPage={currentPage}
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
}
