"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { BotonAdmin } from "@/components/admin/boton-admin";
import { DialogoReprogramarPreentrevista } from "@/components/admin/dialogo-reprogramar-preentrevista";
import { StatusBadge } from "@/components/admin/status-badge";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { registrarPreentrevistaAccion } from "@/lib/actions/oficina";
import { aValorFechaHora, desdeValorFechaHora, fechaHora } from "@/lib/admin/fechas";
import type { EstadoPreentrevista, PostulacionAdmin } from "@/lib/validation/oficina";

type Props = {
  postulacionId: string;
  preentrevista: PostulacionAdmin["preentrevista"];
  preentrevistaEstado?: EstadoPreentrevista;
  nombrePostulante?: string;
  tituloOferta?: string;
};

const ETIQUETA_ESTADO_PRE: Record<
  EstadoPreentrevista,
  { etiqueta: string; tono: "neutral" | "attention" | "success" }
> = {
  no_agendada: { etiqueta: "No agendada", tono: "neutral" },
  pendiente_confirmacion: { etiqueta: "Pendiente de confirmación", tono: "attention" },
  agendada: { etiqueta: "Agendada", tono: "success" },
};

/**
 * The pre-interview of an application (P15, RF1.6.1, D-045):
 * Transitions from `no_agendada` -> `pendiente_confirmacion` (sends email to candidate)
 * -> `agendada` (once candidate confirms or operator confirms manually).
 * Also provides proactive manual rescheduling at any moment.
 */
export function FormularioPreentrevista({
  postulacionId,
  preentrevista,
  preentrevistaEstado,
  nombrePostulante = "Postulante",
  tituloOferta = "Oferta laboral",
}: Props) {
  const [pendiente, iniciar] = useTransition();
  const [errorFecha, setErrorFecha] = useState<string | undefined>(undefined);

  const estadoActual: EstadoPreentrevista =
    preentrevistaEstado ?? (preentrevista ? "agendada" : "no_agendada");
  const infoEstado = ETIQUETA_ESTADO_PRE[estadoActual];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const fecha = String(formData.get("preentrevista-fecha") ?? "");
    if (!fecha) {
      setErrorFecha("Elegí la fecha de la preentrevista");
      return;
    }
    setErrorFecha(undefined);

    iniciar(async () => {
      const respuesta = await registrarPreentrevistaAccion(postulacionId, {
        fecha: desdeValorFechaHora(fecha),
        notas: String(formData.get("preentrevista-notas") ?? ""),
        confirmarDirecto: false,
      });
      if (respuesta.ok) toast.success(respuesta.mensaje);
      else toast.error(respuesta.mensaje);
    });
  }

  function handleConfirmarManual() {
    if (!preentrevista) return;
    iniciar(async () => {
      const respuesta = await registrarPreentrevistaAccion(postulacionId, {
        fecha: preentrevista.fecha,
        notas: preentrevista.notas ?? "",
        confirmarDirecto: true,
      });
      if (respuesta.ok) toast.success("La pre-entrevista quedó marcada como Agendada.");
      else toast.error(respuesta.mensaje);
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-[10px] border border-border bg-surface p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-muted-foreground uppercase">Pre-entrevista</span>
          <StatusBadge etiqueta={infoEstado.etiqueta} tono={infoEstado.tono} />
        </div>
        {preentrevista && (
          <Link
            href="/admin/preentrevistas"
            className="text-[12px] font-semibold text-primary hover:underline"
          >
            Ver en calendario
          </Link>
        )}
      </div>

      {preentrevista && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-[8px] border border-border bg-card px-3 py-2 text-[12.5px]">
          <div className="flex flex-col">
            <span className="font-semibold text-foreground">
              Cita: {fechaHora(preentrevista.fecha)}
            </span>
            {preentrevista.notas && (
              <span className="text-muted-foreground">{preentrevista.notas}</span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {estadoActual === "pendiente_confirmacion" && (
              <BotonAdmin
                type="button"
                variante="primario"
                disabled={pendiente}
                onClick={handleConfirmarManual}
              >
                Confirmar cita manualmente
              </BotonAdmin>
            )}
            <DialogoReprogramarPreentrevista
              postulacionId={postulacionId}
              nombrePostulante={nombrePostulante}
              tituloOferta={tituloOferta}
              fechaActual={preentrevista.fecha}
              notasActuales={preentrevista.notas}
              etiquetaBoton="Reprogramar entrevista"
            />
          </div>
        </div>
      )}

      <form
        key={`${preentrevista?.fecha ?? ""}|${preentrevista?.notas ?? ""}|${estadoActual}`}
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-3"
      >
        <FieldGroup className="gap-3">
          <Field data-invalid={errorFecha ? true : undefined}>
            <FieldLabel htmlFor="preentrevista-fecha">Fecha y hora</FieldLabel>
            <Input
              id="preentrevista-fecha"
              name="preentrevista-fecha"
              type="datetime-local"
              defaultValue={preentrevista ? aValorFechaHora(preentrevista.fecha) : undefined}
              aria-invalid={errorFecha ? true : undefined}
              aria-describedby={errorFecha ? "preentrevista-fecha-error" : undefined}
            />
            <FieldError id="preentrevista-fecha-error">{errorFecha}</FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor="preentrevista-notas">Notas para la cita (opcional)</FieldLabel>
            <Textarea
              id="preentrevista-notas"
              name="preentrevista-notas"
              defaultValue={preentrevista?.notas ?? undefined}
              maxLength={2000}
              className="min-h-20"
            />
          </Field>
        </FieldGroup>
        <div className="flex flex-wrap items-center gap-2">
          <BotonAdmin type="submit" variante="primario" disabled={pendiente}>
            {pendiente
              ? "Enviando invitación…"
              : preentrevista
                ? "Actualizar y reenviar confirmación por mail"
                : "Agendar y pedir confirmación por mail"}
          </BotonAdmin>
        </div>
      </form>
    </div>
  );
}
