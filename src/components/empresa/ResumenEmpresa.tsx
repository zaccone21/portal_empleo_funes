"use client";

import Link from "next/link";
import { PlusIcon, UsersIcon } from "lucide-react";

import { ErrorAlCargar } from "@/components/estados/ErrorAlCargar";
import { PedirIngreso } from "@/components/estados/PedirIngreso";
import { MosaicoOficios } from "@/components/marca/MosaicoOficios";
import { EstadoOferta } from "@/components/ofertas/EstadoOferta";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCandidatosDerivados } from "@/hooks/useCandidatosDerivados";
import { useOfertasEmpresa } from "@/hooks/useOfertasEmpresa";
import { usePerfilEmpresa } from "@/hooks/usePerfilEmpresa";
import { cn } from "@/lib/utils";
import type { EstadoOferta as Estado, OfertaEmpresa } from "@/lib/validation/ofertas";

import { OnboardingEmpresa } from "./OnboardingEmpresa";
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
 */
export function ResumenEmpresa() {
  const ofertas = useOfertasEmpresa();
  const perfil = usePerfilEmpresa();
  const candidatos = useCandidatosDerivados();

  if (ofertas.loading || perfil.loading || candidatos.loading) {
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

  if (ofertas.sinAcceso || perfil.sinAcceso || candidatos.sinAcceso) {
    return (
      <PedirIngreso
        rol="empresa"
        titulo="Ingresá como empresa"
        descripcion="Para publicar ofertas de trabajo y seguir cómo avanzan."
      />
    );
  }

  const error = ofertas.error ?? perfil.error ?? candidatos.error;
  if (error) {
    return (
      <ErrorAlCargar
        que="el resumen"
        mensaje={error}
        onReintentar={() => {
          ofertas.recargar();
          perfil.recargar();
          candidatos.recargar();
        }}
      />
    );
  }

  const aprobada = perfil.estado === "aprobada";
  const lista = ofertas.ofertas ?? [];
  const conteo = contarPorEstado(lista);
  // The list comes oldest referral first, so the first one without an answer is the most overdue.
  const sinRespuesta = (candidatos.candidatos ?? []).filter((c) => c.decision === null);

  return (
    <div className="flex flex-col gap-8">
      {/* Onboarding guiado paso a paso para empresas nuevas o con perfil incompleto */}
      <OnboardingEmpresa
        perfil={perfil.perfil ?? null}
        cuit={perfil.cuitRegistrado}
        estado={perfil.estado}
        motivoRechazo={perfil.motivoRechazo}
        cantidadOfertas={lista.length}
      />

      {!perfil.perfil && (
        <Alert>
          <AlertTitle className="text-base">Completá los datos de la empresa</AlertTitle>
          <AlertDescription className="text-base">
            Para que la Oficina de Empleo pueda aprobar tu cuenta y publicar tus ofertas.
          </AlertDescription>
          <Link href="/empresa/perfil" className={cn(buttonVariants(), "col-start-2 mt-2 justify-self-start")}>
            Completar datos
          </Link>
        </Alert>
      )}

      {perfil.perfil && perfil.estado === "pendiente" && (
        <Alert>
          <AlertTitle className="text-base">Tu empresa está en revisión</AlertTitle>
          <AlertDescription className="text-base">
            La Oficina de Empleo está revisando tus datos. Te avisamos por mail cuando esté aprobada.
          </AlertDescription>
        </Alert>
      )}

      {perfil.perfil && perfil.estado === "rechazada" && (
        <Alert variant="destructive">
          <AlertTitle className="text-base">La Oficina de Empleo no aprobó tu empresa</AlertTitle>
          <AlertDescription className="text-base">
            {perfil.motivoRechazo ? `Motivo: ${perfil.motivoRechazo}. ` : ""}Revisá los datos cargados para que
            podamos revisarla de nuevo.
          </AlertDescription>
          <Link
            href="/empresa/perfil"
            className={cn(buttonVariants({ variant: "outline" }), "col-start-2 mt-2 justify-self-start")}
          >
            Revisar los datos
          </Link>
        </Alert>
      )}

      {sinRespuesta.length > 0 && (
        <Alert>
          <UsersIcon aria-hidden="true" />
          <AlertTitle className="text-base">
            {sinRespuesta.length === 1
              ? "1 persona espera tu respuesta"
              : `${sinRespuesta.length} personas esperan tu respuesta`}
          </AlertTitle>
          <AlertDescription className="text-base">
            La Oficina de Empleo te propuso candidatos. Contanos si los contrataste.
          </AlertDescription>
          {/* Outside AlertDescription, which underlines every link inside it. */}
          <Link
            href={`/empresa/ofertas?oferta=${encodeURIComponent(sinRespuesta[0].oferta.id)}`}
            className={cn(buttonVariants(), "col-start-2 mt-2 justify-self-start")}
          >
            Ver candidatos
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
          {aprobada ? (
            <Link
              href="/empresa/ofertas/nueva"
              className={cn(
                buttonVariants({ size: "lg" }),
                "w-full sm:w-auto bg-brand-mint text-brand-deep hover:bg-brand-mint/90",
              )}
            >
              <PlusIcon data-icon="inline-start" aria-hidden="true" />
              Publicar una oferta
            </Link>
          ) : (
            <p className="max-w-sm text-base font-medium">
              Vas a poder publicar cuando la Oficina de Empleo apruebe tu empresa.
            </p>
          )}
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

      <div className="flex flex-col items-start gap-1">




        {/* The company's phone bar has no "Ayuda" (D-056), so its guide is reached from here. */}
        <Link href="/ayuda?para=empresa" className={cn(buttonVariants({ variant: "link" }), "px-0")}>
          Ver la guía para empresas
        </Link>
      </div>
    </div>
  );
}
