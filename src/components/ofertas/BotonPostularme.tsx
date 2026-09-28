"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { usePostularme } from "@/hooks/usePostularme";

import { AvisoPostulacion } from "./AvisoPostulacion";

/**
 * "Postularme" (RF1.4.3). Sends the application with usePostularme and shows
 * the outcome with AvisoPostulacion.
 *
 * What stays on screen after pressing it:
 * - applied, not logged in or missing CV: only the notice. Pressing again
 *   would give the same answer, and the notice already has the next step;
 * - any other error: the notice and the button, so the person can retry.
 * While sending, the button is disabled to avoid a double application on a
 * slow connection.
 */
export function BotonPostularme({ ofertaId }: { ofertaId: string }) {
  const { postularme, loading, resultado } = usePostularme();

  if (resultado && resultado.tipo !== "error") {
    return <AvisoPostulacion resultado={resultado} ofertaId={ofertaId} />;
  }

  return (
    <div className="flex flex-col gap-3">
      {resultado && <AvisoPostulacion resultado={resultado} ofertaId={ofertaId} />}
      <Button size="lg" className="w-full" disabled={loading} onClick={() => postularme(ofertaId)}>
        {loading && <Spinner data-icon="inline-start" aria-hidden="true" />}
        {loading ? "Enviando postulación…" : "Postularme"}
      </Button>
    </div>
  );
}
