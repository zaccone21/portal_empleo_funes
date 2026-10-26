"use client";

import Link from "next/link";
import { Building2Icon } from "lucide-react";

import { ErrorAlCargar } from "@/components/estados/ErrorAlCargar";
import { PedirIngreso } from "@/components/estados/PedirIngreso";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePerfilEmpresa } from "@/hooks/usePerfilEmpresa";
import { cn } from "@/lib/utils";
import type { DatosNuevaOferta } from "@/lib/validation/ofertas";

import { AvisoEstadoEmpresa } from "./AvisoEstadoEmpresa";
import { FormularioOferta } from "./FormularioOferta";

/**
 * The body of P11: the offer form for an approved company, or the notice of
 * where its approval stands (D-068). The server refuses the offer of a company
 * that is not approved as well; this only keeps it from filling in a form that
 * could not be sent.
 */
export function PublicarOferta({ ofertaPrevia }: { ofertaPrevia?: DatosNuevaOferta | null }) {
  const { perfil, estado, motivoRechazo, loading, error, sinAcceso, recargar } = usePerfilEmpresa();

  if (loading) {
    return (
      <div aria-busy="true">
        <span className="sr-only" role="status">
          Cargando…
        </span>
        <Skeleton className="h-[36rem] rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card" />
      </div>
    );
  }

  if (sinAcceso) {
    return (
      <PedirIngreso rol="empresa" titulo="Ingresá como empresa" descripcion="Para publicar ofertas de trabajo." />
    );
  }

  if (error) {
    return <ErrorAlCargar que="los datos de la empresa" mensaje={error} onReintentar={recargar} />;
  }

  if (perfil === null) {
    return (
      <Alert>
        <Building2Icon aria-hidden="true" />
        <AlertTitle className="text-base">Primero completá los datos de la empresa</AlertTitle>
        <AlertDescription className="text-base">
          La Oficina de Empleo los revisa para aprobar tu empresa. Después vas a poder publicar ofertas.
        </AlertDescription>
        {/* Outside AlertDescription, which underlines every link inside it. */}
        <Link href="/empresa/perfil" className={cn(buttonVariants(), "col-start-2 mt-2 justify-self-start")}>
          Completar datos
        </Link>
      </Alert>
    );
  }

  if (estado !== "aprobada") {
    return <AvisoEstadoEmpresa estado={estado} motivoRechazo={motivoRechazo} />;
  }

  return <FormularioOferta ofertaPrevia={ofertaPrevia} />;
}
