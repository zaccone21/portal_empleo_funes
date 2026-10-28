"use client";

import { useState, useTransition, type FormEvent } from "react";
import { CalendarClockIcon } from "lucide-react";
import { toast } from "sonner";

import { BotonAdmin } from "@/components/admin/boton-admin";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { reprogramarPreentrevistaAccion } from "@/lib/actions/oficina";
import { aValorFechaHora, desdeValorFechaHora } from "@/lib/admin/fechas";

type Props = {
  postulacionId: string;
  nombrePostulante: string;
  tituloOferta: string;
  fechaActual?: string | null;
  notasActuales?: string | null;
  etiquetaBoton?: string;
};

/**
 * Proactive manual rescheduling dialog for the Office (Item 3).
 * Can be opened at any time from the pre-interview calendar, collapsible list,
 * or the application evaluation screen.
 */
export function DialogoReprogramarPreentrevista({
  postulacionId,
  nombrePostulante,
  tituloOferta,
  fechaActual,
  notasActuales,
  etiquetaBoton = "Reprogramar",
}: Props) {
  const [abierto, setAbierto] = useState(false);
  const [pendiente, iniciar] = useTransition();
  const [errorFecha, setErrorFecha] = useState<string | undefined>(undefined);
  const [confirmarDirecto, setConfirmarDirecto] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const fechaRaw = String(formData.get("reprogramar-fecha") ?? "");
    if (!fechaRaw) {
      setErrorFecha("Elegí la nueva fecha y hora de la pre-entrevista");
      return;
    }
    setErrorFecha(undefined);

    iniciar(async () => {
      const respuesta = await reprogramarPreentrevistaAccion(postulacionId, {
        fecha: desdeValorFechaHora(fechaRaw),
        notas: String(formData.get("reprogramar-notas") ?? ""),
        confirmarDirecto,
      });

      if (respuesta.ok) {
        toast.success(respuesta.mensaje);
        setAbierto(false);
      } else {
        toast.error(respuesta.mensaje);
      }
    });
  }

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger
        render={
          <BotonAdmin type="button" variante="secundario">
            <CalendarClockIcon data-icon="inline-start" aria-hidden="true" />
            {etiquetaBoton}
          </BotonAdmin>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reprogramar pre-entrevista</DialogTitle>
          <DialogDescription>
            {nombrePostulante} · {tituloOferta}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <FieldGroup className="gap-3">
            <Field data-invalid={errorFecha ? true : undefined}>
              <FieldLabel htmlFor={`reprogramar-fecha-${postulacionId}`}>Nueva fecha y hora</FieldLabel>
              <Input
                id={`reprogramar-fecha-${postulacionId}`}
                name="reprogramar-fecha"
                type="datetime-local"
                defaultValue={fechaActual ? aValorFechaHora(fechaActual) : undefined}
                aria-invalid={errorFecha ? true : undefined}
                aria-describedby={errorFecha ? `reprogramar-fecha-error-${postulacionId}` : undefined}
              />
              <FieldError id={`reprogramar-fecha-error-${postulacionId}`}>{errorFecha}</FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor={`reprogramar-notas-${postulacionId}`}>Notas o motivo (opcional)</FieldLabel>
              <Textarea
                id={`reprogramar-notas-${postulacionId}`}
                name="reprogramar-notas"
                defaultValue={notasActuales ?? undefined}
                maxLength={2000}
                className="min-h-20"
              />
            </Field>

            <label className="flex cursor-pointer items-start gap-2.5 rounded-[8px] border border-border bg-surface p-2.5 text-[12.5px]">
              <input
                type="checkbox"
                checked={confirmarDirecto}
                onChange={(e) => setConfirmarDirecto(e.target.checked)}
                className="mt-0.5 size-4 accent-primary"
              />
              <span className="leading-snug text-foreground">
                <strong>Dejar directamente como Agendada</strong> (tildar si ya acordaste el horario por teléfono o en persona; si no, queda Pendiente de confirmación por mail).
              </span>
            </label>
          </FieldGroup>

          <DialogFooter>
            <BotonAdmin type="button" onClick={() => setAbierto(false)} disabled={pendiente}>
              Cancelar
            </BotonAdmin>
            <BotonAdmin type="submit" variante="primario" disabled={pendiente}>
              {pendiente ? "Reprogramando…" : "Guardar nuevo horario"}
            </BotonAdmin>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
