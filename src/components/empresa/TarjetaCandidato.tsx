import { CircleCheckIcon, CircleXIcon, FileTextIcon, MailIcon, MessageCircleIcon, PhoneIcon } from "lucide-react";

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
 */
export function TarjetaCandidato({ candidato, onDecidido }: Props) {
  const nombre = [candidato.nombre, candidato.apellido].filter(Boolean).join(" ") || "Persona sin nombre cargado";
  const whatsapp = enlaceWhatsApp(candidato.telefono);
  const rubros = candidato.rubros.filter(esRubro);

  return (
    <article className="flex flex-col gap-4 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card p-4 ring-1 ring-foreground/10 sm:p-5">
      <div className="flex flex-col gap-1">
        <h4 className="text-lg font-semibold">{nombre}</h4>
        {rubros.length > 0 && (
          <p className="flex items-center gap-2 text-base text-muted-foreground">
            <IconoRubro rubro={rubros[0]} className="size-4 shrink-0 text-primary" />
            {rubros.map((r) => NOMBRE_RUBRO[r]).join(" · ")}
          </p>
        )}
        {candidato.derivadoEl && (
          <p className="text-sm text-muted-foreground">Te la propuso la Oficina el {formatearDia(candidato.derivadoEl)}.</p>
        )}
      </div>

      {/* Links styled as buttons keep the link role: they open a call, a chat, an email or the CV. */}
      <div className="flex flex-wrap gap-2">
        {candidato.telefono && (
          <a href={enlaceLlamada(candidato.telefono)} className={buttonVariants({ variant: "outline" })}>
            <PhoneIcon data-icon="inline-start" aria-hidden="true" />
            Llamar · {formatearTelefonoAR(candidato.telefono)}
          </a>
        )}
        {whatsapp && (
          <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "outline" })}>
            <MessageCircleIcon data-icon="inline-start" aria-hidden="true" />
            WhatsApp
          </a>
        )}
        {candidato.email && (
          <a href={`mailto:${candidato.email}`} className={buttonVariants({ variant: "outline" })}>
            <MailIcon data-icon="inline-start" aria-hidden="true" />
            Email
          </a>
        )}
        {candidato.tieneCv && (
          <a
            href={`/api/empresa/candidatos/${encodeURIComponent(candidato.postulacionId)}/cv`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "outline" })}
          >
            <FileTextIcon data-icon="inline-start" aria-hidden="true" />
            Ver CV
          </a>
        )}
      </div>

      <Separator />

      {candidato.decision === "contratado" ? (
        <p className="flex items-start gap-2 text-base">
          <CircleCheckIcon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
          Contrataste a esta persona.
        </p>
      ) : candidato.decision === "no_contratado" ? (
        <div className="flex flex-col gap-1">
          <p className="flex items-start gap-2 text-base">
            <CircleXIcon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
            No contrataste a esta persona.
          </p>
          {candidato.motivoNoContratacion && (
            <p className="pl-7 text-base text-muted-foreground">Motivo: {candidato.motivoNoContratacion}</p>
          )}
        </div>
      ) : (
        <DecisionCandidato candidato={candidato} nombre={nombre} onDecidido={onDecidido} />
      )}
    </article>
  );
}
