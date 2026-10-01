import { ArchiveIcon, CircleCheckIcon, CircleXIcon, ClockIcon, type LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { EstadoOferta as Estado } from "@/lib/validation/ofertas";

type Variante = "default" | "secondary" | "destructive" | "outline";

/**
 * How each status (D-008) looks. The status is never told by color alone: it
 * always has its word and its icon, for people who do not tell colors apart.
 * Shared by the company (P12) and, later, the Office (P15).
 */
const ESTADOS: Record<Estado, { texto: string; icono: LucideIcon; variante: Variante }> = {
  pendiente: { texto: "Pendiente", icono: ClockIcon, variante: "outline" },
  publicada: { texto: "Publicada", icono: CircleCheckIcon, variante: "default" },
  rechazada: { texto: "Rechazada", icono: CircleXIcon, variante: "destructive" },
  cerrada: { texto: "Cerrada", icono: ArchiveIcon, variante: "secondary" },
};

/** Offer status as a label (RF1.3.4): Pendiente, Publicada, Rechazada or Cerrada. */
export function EstadoOferta({ estado }: { estado: Estado }) {
  const { texto, icono: Icono, variante } = ESTADOS[estado];

  return (
    <Badge variant={variante} className="h-7 gap-1.5 px-2.5 text-sm">
      <Icono data-icon="inline-start" aria-hidden="true" />
      {texto}
    </Badge>
  );
}
