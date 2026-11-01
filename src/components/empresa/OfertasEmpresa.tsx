"use client";

import { useState } from "react";
import Link from "next/link";
import { MegaphoneIcon, PlusIcon } from "lucide-react";

import { ErrorAlCargar } from "@/components/estados/ErrorAlCargar";
import { PedirIngreso } from "@/components/estados/PedirIngreso";
import { Button } from "@/components/ui/button";
import { useOfertasEmpresa } from "@/hooks/useOfertasEmpresa";

type EstadoFiltro = "todas" | "publicada" | "pendiente" | "rechazada" | "cerrada";

export function OfertasEmpresa({ seleccionadaId }: { seleccionadaId?: string }) {
  const { ofertas, loading, error, sinAcceso, recargar } = useOfertasEmpresa();
  const [filtroEstado, setFiltroEstado] = useState<EstadoFiltro>("todas");

  if (sinAcceso) {
    return <PedirIngreso mensaje="Tenés que iniciar sesión como empresa para ver tus ofertas." />;
  }

  if (error) {
    return <ErrorAlCargar mensaje={error} alReintentar={recargar} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground">
            Mis Ofertas Laborales
          </h1>
          <p className="text-base text-muted-foreground">
            Gestioná las ofertas publicadas y creá nuevas oportunidades.
          </p>
        </div>
        <Button asChild className="gap-2 font-bold">
          <Link href="/empresa/ofertas/nueva">
            <PlusIcon className="size-4" />
            Nueva oferta
          </Link>
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Cargando ofertas...</p>
      ) : ofertas.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-foreground/20 p-12 text-center">
          <MegaphoneIcon className="size-12 text-muted-foreground/50" />
          <p className="text-lg font-medium text-muted-foreground">No tenés ofertas cargadas todavía.</p>
          <Button asChild>
            <Link href="/empresa/ofertas/nueva">Crear mi primera oferta</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {ofertas.map((oferta) => (
            <div key={oferta.id} className="rounded-xl border bg-card p-5 shadow-sm">
              <h2 className="text-lg font-bold">{oferta.titulo}</h2>
              <p className="text-sm text-muted-foreground">{oferta.lugar}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}