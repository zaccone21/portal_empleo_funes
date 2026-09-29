import Link from "next/link";
import { SearchXIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { cn } from "@/lib/utils";

type Props = {
  titulo: string;
  descripcion: string;
  /** The list without a selection. */
  volverHref: string;
  volverTexto: string;
};

/**
 * Shown in the detail area when the URL points to an item that is not in the
 * list (an offer that was closed, or a wrong link). The way back only shows on
 * phones, where this notice replaces the list; on desktop the list is right
 * next to it.
 */
export function ItemNoDisponible({ titulo, descripcion, volverHref, volverTexto }: Props) {
  return (
    <Empty className="rounded-tl-2xl rounded-br-2xl bg-card">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchXIcon aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>{titulo}</EmptyTitle>
        <EmptyDescription className="text-base">{descripcion}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Link href={volverHref} className={cn(buttonVariants({ size: "lg" }), "w-full lg:hidden")}>
          {volverTexto}
        </Link>
      </EmptyContent>
    </Empty>
  );
}
