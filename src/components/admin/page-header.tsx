import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { MosaicoOficios } from "@/components/marca/MosaicoOficios";

type Props = {
  titulo: string;
  descripcion?: string;
  children?: ReactNode;
  conPatron?: boolean;
};

/**
 * Encabezado compacto por página para el área de administración.
 * Título, descripción de una línea y acciones principales a la derecha.
 */
export function PageHeader({ titulo, descripcion, children, conPatron = false }: Props) {
  return (
    <div className={cn(
      "relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6 overflow-hidden",
      conPatron ? "bg-brand-mint/10 rounded-xl px-5 py-4 border border-brand-mint/20" : ""
    )}>
      {conPatron && (
        <MosaicoOficios
          cantidad={24}
          className="absolute inset-y-0 right-0 -z-10 w-1/3 opacity-[0.08] [mask-image:linear-gradient(to_right,transparent,black_70%)] pointer-events-none"
        />
      )}
      <div className="flex flex-col gap-1 z-10">
        <h1 className={cn("text-2xl font-bold tracking-tight", conPatron ? "text-brand-deep" : "text-foreground")}>{titulo}</h1>
        {descripcion && <p className={cn("text-sm", conPatron ? "text-brand-deep/70" : "text-muted-foreground")}>{descripcion}</p>}
      </div>
      {children && <div className="flex items-center gap-2 z-10">{children}</div>}
    </div>
  );
}
