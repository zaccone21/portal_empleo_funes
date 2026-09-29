"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { ErrorDelServidor } from "@/components/auth/ErrorDelServidor";
import { CampoTexto } from "@/components/formularios/CampoTexto";
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
import { useModerarOferta } from "@/hooks/useOficina";
import { rechazoSchema, type OfertaOficina } from "@/lib/validation/oficina";

/**
 * Whether the Office has something to decide on this offer: review it
 * (pending) or close it (the company asked). The detail only shows its action
 * footer when this is true, so there is no empty bar covering the content.
 */
export function hayDecisionPendiente(oferta: OfertaOficina): boolean {
  return oferta.estado === "pending" || (oferta.estado === "published" && oferta.cierreSolicitado);
}

type Props = {
  oferta: OfertaOficina;
  /** Receives the offer after the decision, to move it to its new status in the list. */
  onActualizada: (oferta: OfertaOficina) => void;
};

/**
 * The Office's decisions on an offer, pinned at the bottom of its detail:
 * - Pending (RF1.5.3): "Publicar", with a short confirmation (it becomes
 *   public at once), or "Rechazar", which opens the reason field right there
 *   instead of a modal (D-025). The reason is required because the company
 *   reads it (RF1.3.5).
 * - Published with a close request (RF1.5.4): "Cerrar la oferta", with a
 *   confirmation (it leaves the catalog).
 * - Anything else: nothing to decide, so it renders nothing.
 * After each decision a toast says what happened and the offer moves to its
 * new status. If another operator decided first, the server's message shows.
 */
export function AccionesOferta({ oferta, onActualizada }: Props) {
  const { moderar, loading, error } = useModerarOferta();
  const [rechazando, setRechazando] = useState(false);
  const [errorMotivo, setErrorMotivo] = useState<string | undefined>(undefined);

  async function decidir(accion: Parameters<typeof moderar>[1], mensaje: string) {
    const actualizada = await moderar(oferta.id, accion);
    if (actualizada) {
      toast.success(mensaje);
      setRechazando(false);
      onActualizada(actualizada);
    }
  }

  function rechazar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const resultado = rechazoSchema.safeParse({ motivo: new FormData(event.currentTarget).get("motivo") });
    if (!resultado.success) {
      setErrorMotivo(resultado.error.issues[0].message);
      return;
    }
    setErrorMotivo(undefined);
    void decidir({ tipo: "rechazar", motivo: resultado.data.motivo }, "Rechazaste la oferta. La empresa va a ver el motivo.");
  }

  if (oferta.estado === "pending" && rechazando) {
    return (
      <form onSubmit={rechazar} noValidate className="flex flex-col gap-3">
        <CampoTexto
          id="motivo"
          label="Motivo del rechazo"
          descripcion="La empresa lo va a leer. Contá qué tiene que corregir."
          error={errorMotivo}
          multilinea
          maxLength={500}
        />
        <ErrorDelServidor error={error} />
        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          <Button type="button" variant="outline" size="lg" onClick={() => setRechazando(false)}>
            Cancelar
          </Button>
          <Button type="submit" variant="destructive" size="lg" disabled={loading}>
            {loading && <Spinner data-icon="inline-start" aria-hidden="true" />}
            Rechazar la oferta
          </Button>
        </div>
      </form>
    );
  }

  if (oferta.estado === "pending") {
    return (
      <div className="flex flex-col gap-3">
        <ErrorDelServidor error={error} />
        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          <Button variant="outline" size="lg" onClick={() => setRechazando(true)}>
            Rechazar
          </Button>
          <Confirmar
            textoBoton="Publicar"
            titulo="¿Publicar esta oferta?"
            descripcion="Va a aparecer enseguida en el catálogo de ofertas del portal."
            textoConfirmar="Sí, publicar"
            loading={loading}
            onConfirmar={() => decidir({ tipo: "publicar" }, "Publicaste la oferta.")}
          />
        </div>
      </div>
    );
  }

  if (oferta.estado === "published" && oferta.cierreSolicitado) {
    return (
      <div className="flex flex-col gap-3">
        <ErrorDelServidor error={error} />
        <Confirmar
          textoBoton="Cerrar la oferta"
          titulo="¿Cerrar esta oferta?"
          descripcion="La empresa lo pidió. Deja de aparecer en el catálogo y no recibe más postulaciones."
          textoConfirmar="Sí, cerrar"
          loading={loading}
          onConfirmar={() => decidir({ tipo: "cerrar" }, "Cerraste la oferta.")}
        />
      </div>
    );
  }

  return null;
}

type PropsConfirmar = {
  textoBoton: string;
  titulo: string;
  descripcion: string;
  textoConfirmar: string;
  loading: boolean;
  onConfirmar: () => Promise<void>;
};

/** Main button that asks for a short confirmation first (the only kind of modal the portal uses, D-025). */
function Confirmar({ textoBoton, titulo, descripcion, textoConfirmar, loading, onConfirmar }: PropsConfirmar) {
  const [abierto, setAbierto] = useState(false);

  async function confirmar() {
    await onConfirmar();
    setAbierto(false);
  }

  return (
    <AlertDialog open={abierto} onOpenChange={setAbierto}>
      <AlertDialogTrigger render={<Button size="lg" className="sm:flex-1" />}>{textoBoton}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl">{titulo}</AlertDialogTitle>
          <AlertDialogDescription className="text-base">{descripcion}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel size="lg">No, volver</AlertDialogCancel>
          <AlertDialogAction size="lg" onClick={confirmar} disabled={loading}>
            {loading && <Spinner data-icon="inline-start" aria-hidden="true" />}
            {textoConfirmar}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
