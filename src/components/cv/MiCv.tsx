"use client";

import { useState } from "react";
import Link from "next/link";
import { InfoIcon, ShieldCheckIcon } from "lucide-react";
import { toast } from "sonner";

import { ErrorAlCargar } from "@/components/estados/ErrorAlCargar";
import { PedirIngreso } from "@/components/estados/PedirIngreso";
import { BloqueReluciente } from "@/components/marca/animaciones";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { useMiCv } from "@/hooks/useMiCv";
import { cn } from "@/lib/utils";

import { FormularioCv } from "./FormularioCv";
import { TarjetaCvActual } from "./TarjetaCvActual";

/**
 * "Mi CV" (P04): the current CV, the form to upload or replace it, and who
 * can see it. Loads and uploads with useMiCv.
 * Aligned to the exact same `lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)]` grid
 * as `PerfilPostulante` so the main and side cards line up cleanly.
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
      <div aria-busy="true" className="grid gap-6 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)] lg:items-start">
        <span className="sr-only" role="status">
          Cargando tu CV…
        </span>
        <BloqueReluciente className="h-64 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card ring-1 ring-foreground/5" />
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
    <div className="grid gap-6 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)] lg:items-start">
      <div className="flex flex-col gap-4">
        {ofertaId && !recienSubido && !cv && (
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
      <aside className="flex gap-3 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card p-5 ring-1 ring-foreground/5 sm:p-6">
        <ShieldCheckIcon aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-primary" />
        <div className="flex flex-col gap-1.5">
          <h2 className="font-heading text-lg font-semibold text-foreground">¿Quién ve tu CV?</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            La Oficina de Empleo. Si tu perfil encaja con una búsqueda, la Oficina te propone a esa
            empresa, y entonces la empresa también puede verlo.{" "}
            <Link href="/privacidad" className="font-semibold text-primary underline underline-offset-2 hover:text-primary/80">
              Conocé cómo cuidamos tus datos
            </Link>
            .
          </p>
        </div>
      </aside>
    </div>
  );
}
