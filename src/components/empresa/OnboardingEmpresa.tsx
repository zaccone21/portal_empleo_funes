"use client";

import Link from "next/link";
import {
  Building2Icon,
  CheckCircle2Icon,
  ClockIcon,
  FileTextIcon,
  SparklesIcon,
  UserCheckIcon,
  XCircleIcon,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { EstadoEmpresa, PerfilEmpresa } from "@/lib/validation/empresa";

type Props = {
  perfil: PerfilEmpresa | null;
  cuit: string | null;
  estado: EstadoEmpresa;
  motivoRechazo: string | null;
  cantidadOfertas: number;
};

/**
 * Onboarding guiado para empresas (P09 pulido).
 * Reemplaza los avisos estáticos por un flujo visual claro paso a paso
 * que explica el proceso de validación municipal y motiva a publicar búsquedas.
 */
export function OnboardingEmpresa({ perfil, cuit, estado, motivoRechazo, cantidadOfertas }: Props) {
  // Solo se muestra si la empresa todavía no tiene ofertas publicadas o su perfil está incompleto / pendiente
  const paso1Completado = true; // Cuenta creada
  const paso2Completado = Boolean(perfil && perfil.razonSocial && perfil.contactoEmail);
  const paso3Completado = estado === "aprobada";
  const paso4Completado = cantidadOfertas > 0;

  if (paso4Completado && paso3Completado) {
    return null;
  }

  const pasos = [
    {
      numero: 1,
      titulo: "Cuenta creada",
      descripcion: cuit ? `CUIT: ${cuit}` : "Usuario registrado",
      completado: paso1Completado,
      activo: false,
      icono: CheckCircle2Icon,
    },
    {
      numero: 2,
      titulo: "Datos de la empresa",
      descripcion: paso2Completado
        ? perfil?.razonSocial
        : "Completá razón social, descripción y persona de contacto.",
      completado: paso2Completado,
      activo: !paso2Completado,
      icono: paso2Completado ? CheckCircle2Icon : Building2Icon,
      accion: !paso2Completado ? (
        <Link
          href="/empresa/perfil"
          className={cn(buttonVariants({ size: "sm" }), "mt-2 self-start font-semibold")}
        >
          Completar datos ahora
        </Link>
      ) : null,
    },
    {
      numero: 3,
      titulo: "Validación municipal",
      descripcion:
        estado === "aprobada"
          ? "¡Tu empresa ya está aprobada para publicar!"
          : estado === "rechazada"
            ? `Rechazada: ${motivoRechazo ?? "Revisá los datos cargados."}`
            : "La Oficina de Empleo revisará los datos para habilitar la publicación de ofertas.",
      completado: paso3Completado,
      activo: paso2Completado && !paso3Completado,
      icono:
        estado === "aprobada"
          ? CheckCircle2Icon
          : estado === "rechazada"
            ? XCircleIcon
            : ClockIcon,
      accion:
        estado === "rechazada" ? (
          <Link
            href="/empresa/perfil"
            className={cn(buttonVariants({ variant: "destructive", size: "sm" }), "mt-2 self-start")}
          >
            Corregir datos de la empresa
          </Link>
        ) : null,
    },
    {
      numero: 4,
      titulo: "Publicar ofertas y recibir candidatos",
      descripcion: paso3Completado
        ? "Ya podés publicar búsquedas laborales y recibir candidatos de Funes."
        : "Se habilitará automáticamente cuando la Oficina apruebe tu cuenta.",
      completado: paso4Completado,
      activo: paso3Completado && !paso4Completado,
      icono: paso4Completado ? CheckCircle2Icon : FileTextIcon,
      accion:
        paso3Completado && !paso4Completado ? (
          <Link
            href="/empresa/ofertas/nueva"
            className={cn(
              buttonVariants({ size: "sm" }),
              "mt-2 self-start bg-brand-deep text-primary-foreground font-semibold hover:bg-brand-deep/90"
            )}
          >
            Publicar primera oferta
          </Link>
        ) : null,
    },
  ];

  return (
    <section
      aria-label="Progreso de tu cuenta"
      className="flex flex-col gap-6 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md border border-border/80 bg-card p-5 shadow-xs sm:p-7"
    >
      <div className="flex flex-col gap-1.5 border-b border-border/60 pb-4">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-brand-mint/40 text-brand-deep">
            <SparklesIcon className="size-4" aria-hidden="true" />
          </span>
          <h2 className="font-heading text-lg font-bold text-foreground sm:text-xl">
            Primeros pasos para encontrar tu próximo colaborador
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Seguí estos pasos para comenzar a recibir candidatos propuestos para tu empresa.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {pasos.map((paso) => {
          const Icono = paso.icono;
          return (
            <div
              key={paso.numero}
              className={cn(
                "flex flex-col justify-between rounded-xl border p-4 transition-all",
                paso.completado
                  ? "border-primary/25 bg-primary/5"
                  : paso.activo
                    ? "border-primary bg-card shadow-xs ring-2 ring-primary/20"
                    : "border-border/60 bg-muted/20 opacity-75"
              )}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "flex size-6 items-center justify-center rounded-full text-xs font-bold",
                      paso.completado
                        ? "bg-primary text-primary-foreground"
                        : paso.activo
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                    )}
                  >
                    {paso.numero}
                  </span>
                  <Icono
                    className={cn(
                      "size-5",
                      paso.completado
                        ? "text-primary"
                        : paso.activo
                          ? "text-primary"
                          : "text-muted-foreground"
                    )}
                    aria-hidden="true"
                  />
                </div>
                <h3 className="font-heading text-base font-semibold text-foreground">
                  {paso.titulo}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {paso.descripcion}
                </p>
              </div>

              {paso.accion && <div className="pt-2">{paso.accion}</div>}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-muted/40 p-3.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <UserCheckIcon className="size-4 text-primary shrink-0" aria-hidden="true" />
          Servicio municipal 100% gratuito: pre-entrevistamos a los candidatos según el perfil que buscás.
        </span>
        <Link href="/ayuda" className="font-semibold text-primary hover:underline">
          ¿Cómo funciona?
        </Link>
      </div>
    </section>
  );
}
