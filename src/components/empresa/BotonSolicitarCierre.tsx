"use client";

import { useState } from "react";
import { toast } from "sonner";

import { ErrorDelServidor } from "@/components/auth/ErrorDelServidor";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useSolicitarCierre } from "@/hooks/useSolicitarCierre";
import type { OfertaEmpresa } from "@/lib/validation/ofertas";

type Props = {
  ofertaId: string;
  /** Receives the offer with `cierreSolicitado: true` so the list updates. */
  onSolicitado: (oferta: OfertaEmpresa) => void;
};

/**
 * "Pedir el cierre" of a published offer (RF1.3.6). It asks for confirmation
 * first, with a short AlertDialog (the only kind of modal the portal uses,
 * D-025), because the company cannot undo it by itself (Q-003).
 *
 * Flow: the button opens the confirmation → "Sí, pedir el cierre" calls
 * useSolicitarCierre → on success the dialog closes, a toast confirms it and
 * the offer is updated in the list; on failure the dialog stays open with the
 * server's message. The offer stays published until the Office closes it.
 */
export function BotonSolicitarCierre({ ofertaId, onSolicitado }: Props) {
  const [abierto, setAbierto] = useState(false);
  const { solicitar, loading, error } = useSolicitarCierre();

  async function confirmar() {
    const oferta = await solicitar(ofertaId);
    if (oferta) {
      setAbierto(false);
      toast.success("Pediste el cierre de la oferta.");
      onSolicitado(oferta);
    }
  }

  return (
    <AlertDialog open={abierto} onOpenChange={setAbierto}>
      <AlertDialogTrigger render={<Button variant="outline" size="lg" className="w-full sm:w-auto" />}>
        Pedir el cierre
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl">¿Pedir el cierre de esta oferta?</AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            La Oficina de Empleo la va a cerrar. Hasta entonces, la oferta sigue publicada.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <ErrorDelServidor error={error} />
        <AlertDialogFooter>
          <AlertDialogCancel size="lg">No, volver</AlertDialogCancel>
          <AlertDialogAction size="lg" onClick={confirmar} disabled={loading}>
            {loading && <Spinner data-icon="inline-start" aria-hidden="true" />}
            {loading ? "Enviando…" : "Sí, pedir el cierre"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
