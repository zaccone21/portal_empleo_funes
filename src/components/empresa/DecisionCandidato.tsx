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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useDecidirCandidato } from "@/hooks/useDecidirCandidato";
import { decisionCandidatoSchema, type CandidatoDerivado, type DatosDecisionCandidato } from "@/lib/validation/candidatos";

type Props = {
  candidato: CandidatoDerivado;
  /** Name to use in the confirmation. */
  nombre: string;
  /** Receives the candidate with its decision, to update the list. */
  onDecidido: (candidato: CandidatoDerivado) => void;
};

/**
 * The company's answer about a referred applicant (P17, RF1.6.4, D-044).
 *
 * Flow:
 * 1. "Contratar" asks for confirmation right away.
 * 2. "No contratar" opens the reason field right there (DESIGN §5: no modal
 *    for typing), and "Enviar respuesta" checks it is written before asking for
 *    confirmation.
 * 3. The confirmation (AlertDialog) says it cannot be changed: it is answered
 *    once, and corrections go through the Office. On success a toast confirms
 *    it and the card shows the answer; on failure the dialog shows the
 *    server's message.
 */
export function DecisionCandidato({ candidato, nombre, onDecidido }: Props) {
  const { decidir, loading, error } = useDecidirCandidato();
  const [escribiendoMotivo, setEscribiendoMotivo] = useState(false);
  const [errorMotivo, setErrorMotivo] = useState<string | undefined>(undefined);
  const [porConfirmar, setPorConfirmar] = useState<DatosDecisionCandidato | null>(null);
  const idMotivo = `motivo-${candidato.postulacionId}`;

  function enviarMotivo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const resultado = decisionCandidatoSchema.safeParse({ decision: "no_contratado", motivo: formData.get(idMotivo) });
    if (!resultado.success) {
      setErrorMotivo(resultado.error.issues[0]?.message);
      return;
    }
    setErrorMotivo(undefined);
    setPorConfirmar(resultado.data);
  }

  async function confirmar() {
    if (!porConfirmar) return;
    const actualizado = await decidir(candidato.postulacionId, porConfirmar);
    if (actualizado) {
      setPorConfirmar(null);
      toast.success("Guardamos tu respuesta. La Oficina de Empleo ya la puede ver.");
      onDecidido(actualizado);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-base font-medium">¿Contrataste a esta persona?</p>
      {escribiendoMotivo ? (
        <form onSubmit={enviarMotivo} noValidate className="flex flex-col gap-4">
          <CampoTexto
            id={idMotivo}
            label="¿Por qué no la contratás?"
            descripcion="Lo lee solo la Oficina de Empleo, para seguir ayudando a esta persona."
            error={errorMotivo}
            multilinea
            maxLength={500}
            obligatorio
          />
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="submit" size="lg">
              Enviar respuesta
            </Button>
            <Button type="button" variant="ghost" size="lg" onClick={() => setEscribiendoMotivo(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button size="lg" onClick={() => setPorConfirmar({ decision: "contratado" })}>
            Sí, la contraté
          </Button>
          <Button variant="outline" size="lg" onClick={() => setEscribiendoMotivo(true)}>
            No la contraté
          </Button>
        </div>
      )}

      <AlertDialog open={porConfirmar !== null} onOpenChange={(abierto) => !abierto && setPorConfirmar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">
              {porConfirmar?.decision === "contratado"
                ? `¿Confirmás que contrataste a ${nombre}?`
                : `¿Confirmás que no contrataste a ${nombre}?`}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Después no se puede cambiar. Si te equivocás, escribile a la Oficina de Empleo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <ErrorDelServidor error={error} />
          <AlertDialogFooter>
            <AlertDialogCancel size="lg">No, volver</AlertDialogCancel>
            <AlertDialogAction size="lg" onClick={confirmar} disabled={loading}>
              {loading && <Spinner data-icon="inline-start" aria-hidden="true" />}
              {loading ? "Guardando…" : "Sí, confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
