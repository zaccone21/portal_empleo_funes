"use client";

import { MiCv } from "@/components/cv/MiCv";
import { useSesion } from "@/hooks/useSesion";

/**
 * The CV block of "Mi perfil" (P03 + P04). Without an applicant session the
 * profile above already asks to log in, so this block stays hidden instead of
 * repeating the same prompt. The session is only used for what is shown; the
 * CV API checks permissions on its own.
 */
export function SeccionCv({ ofertaId }: { ofertaId?: string }) {
  const { usuario } = useSesion();
  if (usuario?.rol !== "postulante") return null;

  return (
    <div id="cv" className="scroll-mt-24">
      <h2 className="mb-6 font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Curriculum vitae
      </h2>
      <MiCv ofertaId={ofertaId} />
    </div>
  );
}
