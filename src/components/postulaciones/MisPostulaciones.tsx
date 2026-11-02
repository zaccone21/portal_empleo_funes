"use client";

import Link from "next/link";
import { InboxIcon } from "lucide-react";

import { ErrorAlCargar } from "@/components/estados/ErrorAlCargar";
import { PedirIngreso } from "@/components/estados/PedirIngreso";
import { EsqueletoTarjetaOferta } from "@/components/marca/animaciones";
import { OfertasSugeridas } from "@/components/ofertas/OfertasSugeridas";
import { buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useMisPostulaciones } from "@/hooks/useMisPostulaciones";
import { cn } from "@/lib/utils";

import { ListaPostulaciones } from "./ListaPostulaciones";

/**
 * "Mis postulaciones" (P07) with its states: gleaming skeleton loading, not logged in,
 * error, empty, and the responsive grid of application cards (`ListaPostulaciones`),
 * followed by personalized offer recommendations (`OfertasSugeridas`).
 */
export function MisPostulaciones() {
  const { postulaciones, loading, error, sinAcceso, recargar } = useMisPostulaciones();

  if (loading) {
    return (
      <div aria-busy="true" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <span className="sr-only" role="status">
          Cargando tus postulaciones…
        </span>
        {Array.from({ length: 6 }, (_, i) => (
          <EsqueletoTarjetaOferta key={i} />
        ))}
      </div>
    );
  }

  if (sinAcceso) {
    return (
      <PedirIngreso
        rol="postulante"
        titulo="Ingresá para ver tus postulaciones"
        descripcion="Acá vas a ver las ofertas a las que te postulaste."
      />
    );
  }

  if (error) {
    return <ErrorAlCargar que="tus postulaciones" mensaje={error} onReintentar={recargar} />;
  }

  if (!postulaciones || postulaciones.length === 0) {
    return (
      <div className="flex flex-col gap-10">
        <Empty className="rounded-tl-2xl rounded-br-2xl bg-card">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <InboxIcon aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>Todavía no te postulaste a ninguna oferta</EmptyTitle>
            <EmptyDescription className="text-base">
              Mirá las ofertas publicadas y postulate a las que te interesen.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Link href="/ofertas" className={cn(buttonVariants({ size: "lg" }), "w-full")}>
              Ver ofertas
            </Link>
          </EmptyContent>
        </Empty>

        <OfertasSugeridas titulo="Ofertas sugeridas para tus rubros" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="max-w-2xl text-base text-muted-foreground">
            La Oficina de Empleo revisa cada postulación y te contacta si tu perfil encaja con la
            búsqueda. Tocá cualquier tarjeta para volver a leer los requisitos del puesto.
          </p>
          <span className="rounded-full bg-secondary px-3.5 py-1 text-sm font-semibold text-secondary-foreground tabular-nums">
            {postulaciones.length} {postulaciones.length === 1 ? "postulación" : "postulaciones"}
          </span>
        </div>
        <ListaPostulaciones postulaciones={postulaciones} />
      </div>

      <OfertasSugeridas titulo="Más ofertas en tus rubros" />
    </div>
  );
}
