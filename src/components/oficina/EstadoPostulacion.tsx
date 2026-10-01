import { BanIcon, CircleDotIcon, SendIcon, UserCheckIcon, type LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { EstadoPostulacion as Estado } from "@/lib/validation/postulaciones";

type Variante = "default" | "secondary" | "destructive" | "outline";

/** Words of the glossary (AGENTS §4) for each application status (D-008). */
export const NOMBRE_ESTADO_POSTULACION: Record<Estado, string> = {
  postulado: "Postulado",
  preseleccionado: "Pre-seleccionado",
  derivado: "Derivado",
  no_apto: "No apto",
};

const ESTILO: Record<Estado, { icono: LucideIcon; variante: Variante }> = {
  postulado: { icono: CircleDotIcon, variante: "outline" },
  preseleccionado: { icono: UserCheckIcon, variante: "secondary" },
  derivado: { icono: SendIcon, variante: "default" },
  no_apto: { icono: BanIcon, variante: "destructive" },
};

/**
 * Application status as a label, only for the Office (RF1.5.6; the applicant
 * never sees it, RF1.2.4). Word and icon, never color alone.
 */
export function EstadoPostulacion({ estado }: { estado: Estado }) {
  const { icono: Icono, variante } = ESTILO[estado];
  return (
    <Badge variant={variante} className="h-7 gap-1.5 px-2.5 text-sm">
      <Icono data-icon="inline-start" aria-hidden="true" />
      {NOMBRE_ESTADO_POSTULACION[estado]}
    </Badge>
  );
}
