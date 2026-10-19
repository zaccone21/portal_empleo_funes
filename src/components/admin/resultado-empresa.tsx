import { BadgeDecisionEmpresa } from "@/components/admin/status-badge";
import { fechaLarga, haceCuanto } from "@/lib/admin/fechas";
import type { PostulacionAdmin } from "@/lib/validation/oficina";

/**
 * What happened after referring an application (D-044, D-054): when it was
 * referred, the company's answer and its reason, or how long it has been
 * waiting for one. Nothing before the referral.
 */
export function ResultadoEmpresa({ postulacion }: { postulacion: PostulacionAdmin }) {
  if (!postulacion.derivadaEl) return null;
  const sinRespuesta = postulacion.decisionEmpresa === null;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-2 text-[12.5px]">
        <BadgeDecisionEmpresa decision={postulacion.decisionEmpresa} />
        <span className="text-muted-foreground">
          Derivada el {fechaLarga(postulacion.derivadaEl)}
          {sinRespuesta && ` · ${haceCuanto(postulacion.derivadaEl)}`}
        </span>
      </div>
      {postulacion.motivoNoContratacion && (
        <p className="text-[12.5px] text-foreground">
          <span className="text-muted-foreground">Motivo de la empresa: </span>
          {postulacion.motivoNoContratacion}
        </p>
      )}
    </div>
  );
}
