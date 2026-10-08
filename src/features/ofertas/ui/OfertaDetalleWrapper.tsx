"use client";

import { useRouter } from "next/navigation";
import { DetalleOfertaOficina } from "@/components/oficina/DetalleOfertaOficina";
import type { OfertaOficina } from "@/lib/validation/oficina";

type Props = {
  oferta: OfertaOficina;
};

export function OfertaDetalleWrapper({ oferta }: Props) {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full bg-muted/20 pb-12">
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 pt-6">
        <DetalleOfertaOficina 
          oferta={oferta} 
          elegida={true} 
          volverHref="/admin/ofertas" 
          onActualizada={() => router.refresh()} 
        />
      </div>
    </div>
  );
}
