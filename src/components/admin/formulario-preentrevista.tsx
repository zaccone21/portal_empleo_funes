"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { CalendarClockIcon, CalendarPlusIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";

import { BotonAdmin } from "@/components/admin/boton-admin";
import { SelectorFechaHora } from "@/components/admin/selector-fecha-hora";
import { StatusBadge } from "@/components/admin/status-badge";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { registrarPreentrevistaAccion, reprogramarPreentrevistaAccion } from "@/lib/actions/oficina";
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
 * The pre-interview card/form of an application (P15, RF1.6.1, D-045).
 * - For applicants with an existing interview, displays in READ-ONLY mode by default.
 * - Opens the edit/reschedule form ONLY when the operator clicks "Reprogramar cita".
 * - Uses custom shadcn/ui Calendar & Popover, never the native browser datetime input.
 */
export function FormularioPreentrevista({
  postulacionId,
  preentrevista,
  preentrevistaEstado,
}: Props) {
  const [pendiente, iniciar] = useTransition();
  const [errorFecha, setErrorFecha] = useState<string | undefined>(undefined);
  const [modoEdicion, setModoEdicion] = useState(!preentrevista);
  const [confirmarDirecto, setConfirmarDirecto] = useState(false);

  const estadoActual: EstadoPreentrevista =
    preentrevistaEstado ?? (preentrevista ? "agendada" : "no_agendada");
  const infoEstado = ETIQUETA_ESTADO_PRE[estadoActual];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const fecha = String(formData.get("preentrevista-fecha") ?? "");
    if (!fecha) {
      setErrorFecha("Elegí la fecha y hora de la preentrevista");
      return;
    }
    setErrorFecha(undefined);

    iniciar(async () => {
      let respuesta;
      if (preentrevista) {
        respuesta = await reprogramarPreentrevistaAccion(postulacionId, {
          fecha: desdeValorFechaHora(fecha),
          notas: String(formData.get("preentrevista-notas") ?? ""),
          confirmarDirecto,
        });
      } else {
        respuesta = await registrarPreentrevistaAccion(postulacionId, {
          fecha: desdeValorFechaHora(fecha),
          notas: String(formData.get("preentrevista-notas") ?? ""),
          confirmarDirecto,
        });
      }

      if (respuesta.ok) {
        toast.success(respuesta.mensaje);
        setModoEdicion(false);
      } else {
        toast.error(respuesta.mensaje);
      }
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
    <motion.div
      layout
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-3 rounded-[10px] border border-border bg-surface p-3.5 shadow-2xs"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            Pre-entrevista
          </span>
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

      <AnimatePresence mode="wait" initial={false}>
        {/* MODO VISTA: Solo lectura cuando ya hay pre-entrevista agendada */}
        {preentrevista && !modoEdicion ? (
          <motion.div
            key="modo-vista"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="flex flex-col gap-2.5 rounded-[8px] border border-border bg-card p-3 text-[12.5px]"
          >
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-medium text-muted-foreground uppercase">
                Horario acordado
              </span>
              <span className="font-heading text-sm font-bold text-foreground">
                {fechaHora(preentrevista.fecha)} hs
              </span>
              {preentrevista.notas ? (
                <p className="mt-0.5 text-muted-foreground">{preentrevista.notas}</p>
              ) : (
                <p className="mt-0.5 text-[11.5px] italic text-muted-foreground/70">
                  Sin notas adicionales
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-1">
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

              <BotonAdmin
                type="button"
                variante="secundario"
                onClick={() => setModoEdicion(true)}
              >
                <CalendarClockIcon data-icon="inline-start" aria-hidden="true" />
                Reprogramar cita
              </BotonAdmin>
            </div>
          </motion.div>
        ) : (
          /* FORMULARIO: Aparece para agendar por primera vez o al tocar "Reprogramar cita" */
          <motion.form
            key={`${preentrevista?.fecha ?? ""}|${preentrevista?.notas ?? ""}|${estadoActual}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col gap-3.5 rounded-[8px] border border-border bg-card p-3"
          >
            <div className="flex items-center gap-2 border-b border-border/60 pb-1">
              <CalendarPlusIcon aria-hidden="true" className="size-4 text-primary" />
              <h3 className="font-heading text-[13px] font-bold text-foreground">
                {preentrevista ? "Reprogramar horario de la cita" : "Agendar pre-entrevista"}
              </h3>
            </div>

            <FieldGroup className="gap-3">
              <Field data-invalid={errorFecha ? true : undefined}>
                <FieldLabel htmlFor="preentrevista-fecha">Fecha y hora de la cita</FieldLabel>
                <SelectorFechaHora
                  id="preentrevista-fecha"
                  name="preentrevista-fecha"
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
                  placeholder="Lugar, modalidad o indicaciones para el postulante…"
                  maxLength={2000}
                  className="min-h-20"
                />
              </Field>

              <label className="flex cursor-pointer items-start gap-2.5 rounded-[8px] border border-border bg-surface p-2.5 text-[12px]">
                <input
                  type="checkbox"
                  checked={confirmarDirecto}
                  onChange={(e) => setConfirmarDirecto(e.target.checked)}
                  className="mt-0.5 size-4 accent-primary"
                />
                <span className="leading-snug text-foreground">
                  <strong>Confirmar de inmediato</strong> (tildar si ya lo acordaste por teléfono o en persona; si no, queda Pendiente de confirmación por mail).
                </span>
              </label>
            </FieldGroup>

            <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-1">
              {preentrevista && (
                <BotonAdmin
                  type="button"
                  variante="secundario"
                  disabled={pendiente}
                  onClick={() => {
                    setErrorFecha(undefined);
                    setModoEdicion(false);
                  }}
                >
                  Cancelar
                </BotonAdmin>
              )}

              <BotonAdmin type="submit" variante="primario" disabled={pendiente}>
                {pendiente
                  ? "Guardando cita…"
                  : preentrevista
                    ? "Guardar nueva fecha"
                    : "Agendar y pedir confirmación"}
              </BotonAdmin>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
