"use client";

import { useState } from "react";
import Link from "next/link";
import { InfoIcon, ShieldCheckIcon } from "lucide-react";
import { toast } from "sonner";

import { ErrorAlCargar } from "@/components/estados/ErrorAlCargar";
import { PedirIngreso } from "@/components/estados/PedirIngreso";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMiCv } from "@/hooks/useMiCv";
import { cn } from "@/lib/utils";

import { FormularioCv } from "./FormularioCv";
import { TarjetaCvActual } from "./TarjetaCvActual";

/**
 * "Mi CV" (P04): the current CV, the form to upload or replace it, and who
 * can see it. Loads and uploads with useMiCv.
 *
 * `ofertaId` arrives when the person came from "Postularme" without a CV
 * (RF1.4.4). Then the screen says why they are here and, once the CV is up,
 * offers to go back to that same offer to finish applying. Only an id is
 * taken from the URL and the link is built here, so the parameter cannot
 * send anyone to another site.
 */
export function MiCv({ ofertaId }: { ofertaId?: string }) {
  const { cv, loading, error, sinAcceso, recargar, subir, subiendo, errorSubida } = useMiCv();
  const [recienSubido, setRecienSubido] = useState(false);

  async function handleSubir(archivo: File) {
    const subido = await subir(archivo);
    if (subido) {
      toast.success("Listo, subiste tu CV.");
      setRecienSubido(true);
    }
    return subido;
  }

  if (loading) {
    return (
      <div aria-busy="true" className="flex flex-col gap-4 lg:max-w-2xl">
        <span className="sr-only" role="status">
          Cargando tu CV…
        </span>
        <Skeleton className="h-64 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card" />
      </div>
    );
  }

  if (sinAcceso) {
    return (
      <PedirIngreso
        rol="postulante"
        titulo="Ingresá para subir tu CV"
        descripcion="Con tu CV cargado te podés postular a las ofertas."
      />
    );
  }

  if (error) {
    return <ErrorAlCargar que="tu CV" mensaje={error} onReintentar={recargar} />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-start">
      <div className="flex flex-col gap-4">
        {ofertaId && !recienSubido && (
          <Alert>
            <InfoIcon aria-hidden="true" />
            <AlertTitle className="text-base">Para postularte necesitás tu CV</AlertTitle>
            <AlertDescription className="text-base">
              Subilo acá y después volvé a la oferta para terminar.
            </AlertDescription>
          </Alert>
        )}
        {ofertaId && recienSubido && (
          <div role="status" className="flex flex-col gap-3 rounded-2xl bg-secondary p-5">
            <p className="font-heading text-lg font-semibold text-secondary-foreground">
              Ya podés postularte a la oferta
            </p>
            <Link
              href={`/ofertas?oferta=${encodeURIComponent(ofertaId)}`}
              className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto sm:self-start")}
            >
              Volver a la oferta
            </Link>
          </div>
        )}
        {cv && <TarjetaCvActual cv={cv} />}
        <FormularioCv tieneCv={cv !== null} onSubir={handleSubir} subiendo={subiendo} error={errorSubida} />
      </div>
      <aside className="flex gap-3 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card p-5 ring-1 ring-foreground/5">
        <ShieldCheckIcon aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-primary" />
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold">¿Quién ve tu CV?</h2>
          <p className="text-base text-muted-foreground">
            Solo la Oficina de Empleo. Las empresas no ven tus datos: la Oficina te contacta si tu
            perfil encaja con una búsqueda.
          </p>
        </div>
      </aside>
    </div>
  );
}
