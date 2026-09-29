"use client";

import Link from "next/link";
import { InboxIcon } from "lucide-react";

import { ErrorAlCargar } from "@/components/estados/ErrorAlCargar";
import { PedirIngreso } from "@/components/estados/PedirIngreso";
import { buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { useMisPostulaciones } from "@/hooks/useMisPostulaciones";
import { cn } from "@/lib/utils";

import { ListaPostulaciones } from "./ListaPostulaciones";

/**
 * "Mis postulaciones" (P07) with its states: loading, not logged in, error,
 * empty and the list. Loads the data with useMisPostulaciones.
 *
 * "No access" (401 or 403) is not an error: without an applicant session it
 * invites the person to log in and come back here (PedirIngreso). Above the
 * list, one sentence explains what happens next, because the screen shows no
 * status (RF1.2.4) and people would otherwise wonder.
 */
export function MisPostulaciones() {
  const { postulaciones, loading, error, sinAcceso, recargar } = useMisPostulaciones();

  if (loading) {
    return (
      <div aria-busy="true" className="flex flex-col gap-3">
        <span className="sr-only" role="status">
          Cargando tus postulaciones…
        </span>
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-28 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card" />
        ))}
      </div>
    );
  }

  if (sinAcceso) {
    return (
      <PedirIngreso
        rol="applicant"
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
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="max-w-2xl text-base text-muted-foreground">
        La Oficina de Empleo revisa cada postulación y te contacta si tu perfil encaja con la
        búsqueda.
      </p>
      <ListaPostulaciones postulaciones={postulaciones} />
    </div>
  );
}
