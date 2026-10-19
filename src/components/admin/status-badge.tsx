import { cn } from "@/lib/utils";

import { ESTADOS_OFERTA } from "@/features/ofertas/domain/estados";
import { DECISIONES_EMPRESA, ESTADOS_POSTULACION } from "@/features/postulaciones/domain/estados";
import type { DecisionEmpresa } from "@/lib/validation/candidatos";
import type { EstadoOferta } from "@/lib/validation/ofertas";
import type { EstadoPostulacion } from "@/lib/validation/postulaciones";

export type Tono = "neutral" | "attention" | "success" | "danger";

const TONOS: Record<Tono, string> = {
  neutral: "bg-neutral-soft text-neutral-soft-foreground",
  attention: "bg-attention text-attention-foreground",
  success: "bg-success-soft text-success-soft-foreground",
  danger: "bg-danger-soft text-danger-soft-foreground",
};

type Props = {
  etiqueta: string;
  tono: Tono;
  className?: string;
};

/**
 * The only status badge of the Office (D-042): a pill with a dot of the text
 * color. The label and tone come from the domain rules
 * (features/<feature>/domain/estados.ts), never from the screen.
 */
export function StatusBadge({ etiqueta, tono, className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-[9px] py-0.5 text-[11.5px] leading-normal font-semibold whitespace-nowrap",
        TONOS[tono],
        className,
      )}
    >
      <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-current" />
      {etiqueta}
    </span>
  );
}

/** Badge of an offer status. */
export function BadgeOferta({ estado, className }: { estado: EstadoOferta; className?: string }) {
  const { etiqueta, tono } = ESTADOS_OFERTA[estado];
  return <StatusBadge etiqueta={etiqueta} tono={tono} className={className} />;
}

/** Badge of an offer status with optional cierre solicitado note. */
export function BadgeEstadoOferta({
  estado,
  cierreSolicitado,
  className,
}: {
  estado: EstadoOferta;
  cierreSolicitado?: boolean;
  className?: string;
}) {
  const { etiqueta, tono } = ESTADOS_OFERTA[estado];
  return (
    <div className="flex flex-col">
      <StatusBadge etiqueta={etiqueta} tono={tono} className={className} />
      {cierreSolicitado && estado === "publicada" && (
        <span className="text-[11px] text-muted-foreground">Cierre solicitado</span>
      )}
    </div>
  );
}

/** Badge of an application status. */
export function BadgePostulacion({ estado, className }: { estado: EstadoPostulacion; className?: string }) {
  const { etiqueta, tono } = ESTADOS_POSTULACION[estado];
  return <StatusBadge etiqueta={etiqueta} tono={tono} className={className} />;
}

/** Badge of the company's answer about a referred application; null means it has not answered (D-054). */
export function BadgeDecisionEmpresa({ decision, className }: { decision: DecisionEmpresa | null; className?: string }) {
  const { etiqueta, tono } = DECISIONES_EMPRESA[decision ?? "sin_respuesta"];
  return <StatusBadge etiqueta={etiqueta} tono={tono} className={className} />;
}
