import { ReactNode } from "react";
import { FolderSearch } from "lucide-react";

type Props = {
  titulo: string;
  descripcion: string;
  children?: ReactNode;
};

/**
 * Estado vacío para las tablas y colas de trabajo cuando no hay resultados.
 */
export function EmptyState({ titulo, descripcion, children }: Props) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px] border border-dashed rounded-lg bg-card text-card-foreground">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground mb-4">
        <FolderSearch className="size-6" />
      </div>
      <h3 className="text-lg font-semibold tracking-tight">{titulo}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">{descripcion}</p>
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}
