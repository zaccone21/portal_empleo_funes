"use client";

import Link from "next/link";
import { Building2Icon, PlusIcon } from "lucide-react";

import { ErrorAlCargar } from "@/components/estados/ErrorAlCargar";
import { PedirIngreso } from "@/components/estados/PedirIngreso";
import { MosaicoOficios } from "@/components/marca/MosaicoOficios";
import { EstadoOferta } from "@/components/ofertas/EstadoOferta";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useOfertasEmpresa } from "@/hooks/useOfertasEmpresa";
import { usePerfilEmpresa } from "@/hooks/usePerfilEmpresa";
import { cn } from "@/lib/utils";
import type { EstadoOferta as Estado, OfertaEmpresa } from "@/lib/validation/ofertas";

import { TarjetaOfertaEmpresa } from "./TarjetaOfertaEmpresa";

const ORDEN_ESTADOS: Estado[] = ["pendiente", "publicada", "rechazada", "cerrada"];

/** How many offers are in each status. */
function contarPorEstado(ofertas: OfertaEmpresa[]): Record<Estado, number> {
  const conteo: Record<Estado, number> = { pendiente: 0, publicada: 0, rechazada: 0, cerrada: 0 };
  for (const oferta of ofertas) {
    conteo[oferta.estado] += 1;
  }
  return conteo;
}

/**
 * The company's home (P09, RF1.3.1): a summary of its activity in the portal.
 *
 * What it shows:
 * - a reminder to fill in the company data while there is none (P10);
 * - the main action, publishing an offer;
 * - how many offers are in each status, and the three latest ones.
 * PROVISIONAL (DT-005): the exact indicators are still open (Q-012); offers
 * by status are the one summary that only uses data the company already has.
 * It never shows anything about applicants: the Office is the intermediary.
 *
 * It loads the offers and the profile; if either fails, the error screen
 * retries both.
 */
export function ResumenEmpresa() {
  const ofertas = useOfertasEmpresa();
  const perfil = usePerfilEmpresa();

  if (ofertas.loading || perfil.loading) {
    return (
      <div aria-busy="true" className="grid gap-6 lg:grid-cols-2">
        <span className="sr-only" role="status">
          Cargando el resumen…
        </span>
        <Skeleton className="h-56 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card" />
        <Skeleton className="h-56 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card" />
      </div>
    );
  }

  if (ofertas.sinAcceso || perfil.sinAcceso) {
    return (
      <PedirIngreso
        rol="empresa"
        titulo="Ingresá como empresa"
        descripcion="Para publicar ofertas de trabajo y seguir cómo avanzan."
      />
    );
  }

  const error = ofertas.error ?? perfil.error;
  if (error) {
    return (
      <ErrorAlCargar
        que="el resumen"
        mensaje={error}
        onReintentar={() => {
          ofertas.recargar();
          perfil.recargar();
        }}
      />
    );
  }

  const lista = ofertas.ofertas ?? [];
  const conteo = contarPorEstado(lista);

  return (
    <div className="flex flex-col gap-8">
      {perfil.perfil === null && (
        <Alert>
          <Building2Icon aria-hidden="true" />
          <AlertTitle className="text-base">Completá los datos de la empresa</AlertTitle>
          <AlertDescription className="text-base">
            La Oficina de Empleo los usa para comunicarse con ustedes.
          </AlertDescription>
          {/* Outside AlertDescription, which underlines every link inside it. */}
          <Link
            href="/empresa/perfil"
            className={cn(buttonVariants({ variant: "outline" }), "col-start-2 mt-2 justify-self-start")}
          >
            Completar datos
          </Link>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="relative isolate flex flex-col items-start gap-4 overflow-hidden rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-brand-deep p-6 text-primary-foreground sm:p-7">
          <MosaicoOficios
            cantidad={18}
            className="absolute inset-y-0 right-0 -z-10 w-1/2 [mask-image:linear-gradient(to_right,transparent,black)]"
          />
          <h2 className="max-w-xs text-2xl leading-tight font-semibold">¿Buscás a alguien para tu equipo?</h2>
          <p className="max-w-sm text-base text-primary-foreground/80">
            Publicá una oferta y la Oficina de Empleo te acerca candidatos de Funes.
          </p>
          <Link
            href="/empresa/ofertas/nueva"
            className={cn(
              buttonVariants({ size: "lg" }),
              "bg-brand-mint text-brand-deep hover:bg-brand-mint/90",
            )}
          >
            <PlusIcon data-icon="inline-start" aria-hidden="true" />
            Publicar una oferta
          </Link>
        </section>

        <section
          aria-labelledby="resumen-estados"
          className="flex flex-col gap-4 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card p-6 ring-1 ring-foreground/5 sm:p-7"
        >
          <h2 id="resumen-estados" className="text-xl font-semibold">
            Tus ofertas
          </h2>
          <ul className="flex flex-col divide-y">
            {ORDEN_ESTADOS.map((estado) => (
              <li key={estado} className="flex items-center justify-between py-2.5">
                <EstadoOferta estado={estado} />
                <span className="font-heading text-2xl font-semibold tabular-nums">{conteo[estado]}</span>
              </li>
            ))}
          </ul>
          <Link href="/empresa/ofertas" className={cn(buttonVariants({ variant: "link" }), "self-start px-0")}>
            Ver todas mis ofertas
          </Link>
        </section>
      </div>

      {lista.length > 0 && (
        <section aria-labelledby="resumen-ultimas" className="flex flex-col gap-3">
          <h2 id="resumen-ultimas" className="text-xl font-semibold">
            Últimas ofertas
          </h2>
          <ul className="grid gap-3 md:grid-cols-3">
            {lista.slice(0, 3).map((oferta) => (
              <li key={oferta.id}>
                <TarjetaOfertaEmpresa oferta={oferta} seleccionada={false} soloEnEscritorio={false} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="max-w-2xl text-base text-muted-foreground">
        La Oficina de Empleo es la que se comunica con los candidatos. Por eso acá no vas a ver
        datos de postulantes: cuando haya personas para tu búsqueda, la Oficina se contacta con
        ustedes.
      </p>
    </div>
  );
}
