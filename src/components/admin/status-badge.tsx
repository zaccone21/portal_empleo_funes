import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Tono = "neutral" | "warning" | "success" | "danger";

type Props = {
  etiqueta: string;
  tono: Tono;
  className?: string;
};

const TONO_STYLES: Record<Tono, string> = {
  neutral: "bg-secondary text-secondary-foreground hover:bg-secondary",
  warning: "bg-warning text-warning-foreground hover:bg-warning",
  success: "bg-success text-success-foreground hover:bg-success",
  danger: "bg-danger text-danger-foreground hover:bg-danger",
};

/**
 * Badge de estado universal. El color y texto provienen de las reglas de dominio
 * (ver features/<feature>/domain/estados.ts).
 */
export function StatusBadge({ etiqueta, tono, className }: Props) {
  return (
    <Badge
      variant="outline"
      className={cn("border-transparent font-medium", TONO_STYLES[tono], className)}
    >
      {etiqueta}
    </Badge>
  );
}
