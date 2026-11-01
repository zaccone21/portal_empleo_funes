import Link from "next/link";
import {
  ArrowUpRightIcon,
  BriefcaseIcon,
  CircleCheckIcon,
  CircleXIcon,
  FileTextIcon,
  MailIcon,
  MessageCircleIcon,
  PhoneIcon,
} from "lucide-react";

import { IconoRubro } from "@/components/ofertas/IconoRubro";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatearDia } from "@/lib/fechas";
import { enlaceLlamada, enlaceWhatsApp, formatearTelefonoAR } from "@/lib/telefonos";
import type { CandidatoDerivado } from "@/lib/validation/candidatos";
import { NOMBRE_RUBRO, RUBROS, type Rubro } from "@/lib/validation/rubros";

import { DecisionCandidato } from "./DecisionCandidato";

type Props = {
  candidato: CandidatoDerivado;
  onDecidido: (candidato: CandidatoDerivado) => void;
};

function esRubro(valor: string): valor is Rubro {
  return (RUBROS as readonly string[]).includes(valor);
}

/**
 * One applicant the Office referred to the company (P17, D-044): name, trades,
 * one-tap contact (call, WhatsApp, email), the CV through a short-lived signed
 * link (RNF1), and the company's answer or the buttons to give it.
 * Structured with uniform height (h-full min-h-[350px]) and anchored footer so
 * hired and pending cards align symmetrically in grid view.
 */
export function TarjetaCandidato({ candidato, onDecidido }: Props) {
  const nombre = [candidato.nombre, candidato.apellido].filter(Boolean).join(" ") || "Persona sin nombre cargado";
  const whatsapp = enlaceWhatsApp(candidato.telefono);
  const rubros = candidato.rubros.filter(esRubro);

  return (
    <article className="flex h-full min-h-[350px] flex-col justify-between gap-4 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card p-4.5 ring-1 ring-foreground/10 sm:p-5">
      {/* Zona superior: Búsqueda, información del candidato y vías de contacto */}
      <div className="flex flex-col gap-4">
        {candidato.oferta && (
          <div className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-1.5 text-xs text-muted-foreground border border-border/50">
            <div className="flex items-center gap-1.5 font-medium text-foreground min-w-0">
              <BriefcaseIcon className="size-3.5 text-primary shrink-0" aria-hidden="true" />
              <span className="text-muted-foreground shrink-0">Búsqueda:</span>
              <Link
                href={`/empresa/ofertas?oferta=${encodeURIComponent(candidato.oferta.id)}`}
                className="font-semibold text-primary hover:underline truncate inline-flex items-center gap-1"
              >
                <span className="truncate">{candidato.oferta.titulo}</span>
                <ArrowUpRightIcon className="size-3 opacity-70 shrink-0" aria-hidden="true" />
              </Link>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <h4 className="text-lg font-semibold">{nombre}</h4>
          {rubros.length > 0 && (
            <p className="flex items-center gap-2 text-base text-muted-foreground">
              <IconoRubro rubro={rubros[0]} className="size-4 shrink-0 text-primary" />
              {rubros.map((r) => NOMBRE_RUBRO[r]).join(" · ")}
            </p>
          )}
          {candidato.derivadoEl && (
            <p className="text-sm text-muted-foreground">Propuesto el {formatearDia(candidato.derivadoEl)}.</p>
          )}
        </div>

        {/* Canales de contacto directos */}
        <div className="flex flex-wrap gap-2">
          {candidato.telefono && (
            <a href={enlaceLlamada(candidato.telefono)} className={buttonVariants({ variant: "outline", size: "sm" })}>
              <PhoneIcon data-icon="inline-start" aria-hidden="true" />
              Llamar · {formatearTelefonoAR(candidato.telefono)}
            </a>
          )}
          {whatsapp && (
            <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "outline", size: "sm" })}>
              <MessageCircleIcon data-icon="inline-start" aria-hidden="true" />
              WhatsApp
            </a>
          )}
          {candidato.email && (
            <a href={`mailto:${candidato.email}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
              <MailIcon data-icon="inline-start" aria-hidden="true" />
              Email
            </a>
          )}
          {candidato.tieneCv && (
            <a
              href={`/api/empresa/candidatos/${encodeURIComponent(candidato.postulacionId)}/cv`}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <FileTextIcon data-icon="inline-start" aria-hidden="true" />
              Ver CV
            </a>
          )}
        </div>
      </div>

      {/* Zona inferior fija: Estado de resolución o formulario de decisión */}
      <div className="mt-auto flex flex-col gap-3 pt-2">
        <Separator />

        {candidato.decision === "contratado" ? (
          <div className="flex min-h-[88px] items-center gap-3 rounded-xl border border-brand-mint/60 bg-brand-mint/20 p-4">
            <CircleCheckIcon aria-hidden="true" className="size-6 shrink-0 text-primary" />
            <div className="flex flex-col">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-deep">Resolución confirmada</span>
              <p className="text-base font-semibold text-foreground">Contrataste a esta persona</p>
            </div>
          </div>
        ) : candidato.decision === "no_contratado" ? (
          <div className="flex min-h-[88px] flex-col justify-center gap-1.5 rounded-xl border border-border bg-muted/60 p-4">
            <div className="flex items-center gap-2">
              <CircleXIcon aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" />
              <p className="text-base font-medium text-foreground">No contrataste a esta persona</p>
            </div>
            {candidato.motivoNoContratacion && (
              <p className="pl-7 text-xs text-muted-foreground">Motivo: {candidato.motivoNoContratacion}</p>
            )}
          </div>
        ) : (
          <div className="min-h-[88px] flex flex-col justify-center">
            <DecisionCandidato candidato={candidato} nombre={nombre} onDecidido={onDecidido} />
          </div>
        )}
      </div>
    </article>
  );
}
