"use client";

import Link from "next/link";
import { ArrowRightIcon, BriefcaseBusinessIcon, CircleAlertIcon, ClockIcon, InboxIcon, type LucideIcon } from "lucide-react";

import { ErrorAlCargar } from "@/components/estados/ErrorAlCargar";
import { PedirIngreso } from "@/components/estados/PedirIngreso";
import { Skeleton } from "@/components/ui/skeleton";
import { useResumenOficina } from "@/hooks/useOficina";
import { MENSAJE_ERROR_GENERICO } from "@/lib/http";
import { cn } from "@/lib/utils";

type Indicador = {
  titulo: string;
  valor: number;
  accion: string;
  href: string;
  icono: LucideIcon;
  /** Needs the Office's attention when it is above zero: painted in the brand green. */
  urgente: boolean;
};

/**
 * The Office's panel (P14, RF1.5.1). Each indicator is also the shortcut to
 * act on it: "3 ofertas para revisar" takes the operator straight to the
 * pending tab. The ones that need work (offers to review, close requests)
 * stand out while they are above zero.
 * PROVISIONAL (DT-006): only indicators that come straight from the states;
 * the final set and "postulante activo" are still open (Q-012).
 */
export function ResumenOficina() {
  const { resumen, loading, error, sinAcceso, recargar } = useResumenOficina();

  if (loading) {
    return (
      <div aria-busy="true" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <span className="sr-only" role="status">
          Cargando el panel…
        </span>
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-40 rounded-tl-2xl rounded-br-2xl bg-card" />
        ))}
      </div>
    );
  }

  if (sinAcceso) {
    return (
      <PedirIngreso
        rol="admin"
        titulo="Ingresá con tu cuenta de la Oficina"
        descripcion="Este panel es para el personal de la Oficina de Empleo."
      />
    );
  }

  if (error || !resumen) {
    return <ErrorAlCargar que="el panel" mensaje={error ?? MENSAJE_ERROR_GENERICO} onReintentar={recargar} />;
  }

  const indicadores: Indicador[] = [
    {
      titulo: resumen.ofertasPendientes === 1 ? "oferta para revisar" : "ofertas para revisar",
      valor: resumen.ofertasPendientes,
      accion: "Revisar ofertas",
      href: "/admin/ofertas?estado=pendiente",
      icono: ClockIcon,
      urgente: resumen.ofertasPendientes > 0,
    },
    {
      titulo: resumen.pedidosDeCierre === 1 ? "pedido de cierre" : "pedidos de cierre",
      valor: resumen.pedidosDeCierre,
      accion: "Ver pedidos",
      href: "/admin/ofertas?estado=publicada",
      icono: CircleAlertIcon,
      urgente: resumen.pedidosDeCierre > 0,
    },
    {
      titulo: resumen.postulacionesSinRevisar === 1 ? "postulación sin revisar" : "postulaciones sin revisar",
      valor: resumen.postulacionesSinRevisar,
      accion: "Ver ofertas publicadas",
      href: "/admin/ofertas?estado=publicada",
      icono: InboxIcon,
      urgente: false,
    },
    {
      titulo: resumen.ofertasPublicadas === 1 ? "oferta publicada" : "ofertas publicadas",
      valor: resumen.ofertasPublicadas,
      accion: "Ver publicadas",
      href: "/admin/ofertas?estado=publicada",
      icono: BriefcaseBusinessIcon,
      urgente: false,
    },
  ];

  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {indicadores.map(({ titulo, valor, accion, href, icono: Icono, urgente }) => (
        <li key={titulo}>
          <Link
            href={href}
            className={cn(
              "flex h-full flex-col gap-3 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md p-5 ring-1 outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              urgente
                ? "bg-brand-deep text-primary-foreground ring-transparent"
                : "bg-card text-card-foreground ring-foreground/5 hover:ring-foreground/20",
            )}
          >
            <Icono aria-hidden="true" className={cn("size-6", urgente ? "text-brand-mint" : "text-primary")} />
            <p className="flex flex-col">
              <span className="font-heading text-4xl font-semibold tabular-nums">{valor}</span>
              <span className="text-base">{titulo}</span>
            </p>
            <span className={cn("mt-auto flex items-center gap-1 text-base font-medium", urgente ? "text-brand-mint" : "text-primary")}>
              {accion}
              <ArrowRightIcon aria-hidden="true" className="size-4" />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
