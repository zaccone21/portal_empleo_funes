"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDownIcon, ChevronUpIcon, EyeIcon, EyeOffIcon, ListChecksIcon } from "lucide-react";

import { nombreCompleto } from "@/components/admin/celdas";
import { DialogoReprogramarPreentrevista } from "@/components/admin/dialogo-reprogramar-preentrevista";
import { EnlaceAccion } from "@/components/admin/enlace-accion";
import { StatusBadge } from "@/components/admin/status-badge";
import { AnimarColapsable } from "@/components/marca/animaciones";
import { Button } from "@/components/ui/button";
import { fechaHora } from "@/lib/admin/fechas";
import { conDesde } from "@/lib/admin/url";
import type { PostulacionAdmin } from "@/lib/validation/oficina";

export type VistaCalendarioPre = "dia" | "semana" | "mes" | "periodo";

type Props = {
  preentrevistas: PostulacionAdmin[];
  vista: VistaCalendarioPre;
  etiquetaPeriodo: string;
};

/**
 * Collapsible panel showing the scheduled (`agendada`) and pending (`pendiente_confirmacion`)
 * pre-interviews filtered by the active Day / Week / Month period.
 * Features a prominent, unmistakable toggle button to hide or show the list.
 */
export function ListaPreentrevistasColapsable({
  preentrevistas,
  vista,
  etiquetaPeriodo,
}: Props) {
  const [abierto, setAbierto] = useState(true);
  const textoVista =
    vista === "dia"
      ? "del día"
      : vista === "semana"
        ? "de la semana"
        : vista === "periodo"
          ? "del período seleccionado"
          : "del mes";
  const agendadasCount = preentrevistas.filter((p) => p.preentrevistaEstado === "agendada").length;
  const pendientesCount = preentrevistas.length - agendadasCount;

  return (
    <section
      aria-labelledby="lista-preentrevistas-titulo"
      className="rounded-xl border border-border bg-card shadow-2xs"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-5">
        <div className="flex flex-wrap items-center gap-2.5">
          <span
            aria-hidden="true"
            className="flex size-8 items-center justify-center rounded-lg bg-secondary text-primary"
          >
            <ListChecksIcon className="size-4" />
          </span>
          <div>
            <h2 id="lista-preentrevistas-titulo" className="font-heading text-[15px] font-bold text-foreground">
              Listado de pre-entrevistas {textoVista} ({etiquetaPeriodo})
            </h2>
            <p className="text-[12px] text-muted-foreground">
              Resumen en tabla sincronizado con el período elegido arriba
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 pl-1">
            <StatusBadge etiqueta={`${agendadasCount} agendadas`} tono="success" />
            {pendientesCount > 0 && (
              <StatusBadge etiqueta={`${pendientesCount} pendientes de confirmación`} tono="attention" />
            )}
          </div>
        </div>

        <Button
          type="button"
          variant={abierto ? "outline" : "default"}
          size="sm"
          onClick={() => setAbierto((prev) => !prev)}
          aria-expanded={abierto}
          className="h-9 gap-2 px-3.5 font-semibold"
        >
          {abierto ? (
            <>
              <EyeOffIcon data-icon="inline-start" aria-hidden="true" />
              Ocultar listado
              <ChevronUpIcon data-icon="inline-end" aria-hidden="true" />
            </>
          ) : (
            <>
              <EyeIcon data-icon="inline-start" aria-hidden="true" />
              Mostrar listado ({preentrevistas.length})
              <ChevronDownIcon data-icon="inline-end" aria-hidden="true" />
            </>
          )}
        </Button>
      </div>

      <AnimarColapsable abierto={abierto}>
        <div className="border-t border-border px-4 pt-3 pb-4 sm:px-5">
          {preentrevistas.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-surface py-6 text-center text-[13px] text-muted-foreground">
              No hay pre-entrevistas registradas para este período ({etiquetaPeriodo}).
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-[13px]">
                <thead>
                  <tr className="border-b border-border text-[11px] tracking-wider text-muted-foreground uppercase">
                    <th className="py-2 pr-3 font-semibold">Fecha y hora</th>
                    <th className="py-2 pr-3 font-semibold">Estado</th>
                    <th className="py-2 pr-3 font-semibold">Postulante</th>
                    <th className="py-2 pr-3 font-semibold">Oferta / Empresa</th>
                    <th className="py-2 pr-3 font-semibold">Notas</th>
                    <th className="py-2 pl-3 text-right font-semibold">Acciones directas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {preentrevistas.map((p) => {
                    const postulante = nombreCompleto(p.postulante) ?? "Postulante";
                    const esPendiente = p.preentrevistaEstado === "pendiente_confirmacion";
                    const fechaCita = p.preentrevista?.fecha ?? p.postuladoEl;

                    return (
                      <tr key={p.id} className="hover:bg-row-hover">
                        <td className="py-2.5 pr-3 align-middle font-semibold text-foreground tabular-nums">
                          {fechaHora(fechaCita)}
                        </td>
                        <td className="py-2.5 pr-3 align-middle">
                          <StatusBadge
                            etiqueta={esPendiente ? "Pendiente de confirmación" : "Agendada"}
                            tono={esPendiente ? "attention" : "success"}
                          />
                        </td>
                        <td className="py-2.5 pr-3 align-middle">
                          <Link
                            href={conDesde(`/admin/postulantes/${p.postulante.id}`, "/admin/preentrevistas")}
                            className="font-bold text-foreground hover:text-primary hover:underline"
                          >
                            {postulante}
                          </Link>
                        </td>
                        <td className="py-2.5 pr-3 align-middle">
                          <div className="flex flex-col leading-tight">
                            <Link
                              href={conDesde(`/admin/ofertas/${p.oferta.id}`, "/admin/preentrevistas")}
                              className="font-semibold text-foreground hover:text-primary hover:underline"
                            >
                              {p.oferta.titulo}
                            </Link>
                            <span className="text-[11.5px] text-muted-foreground">
                              {p.oferta.empresa?.razonSocial ?? "Empresa"}
                            </span>
                          </div>
                        </td>
                        <td className="max-w-[220px] truncate py-2.5 pr-3 align-middle text-[12px] text-muted-foreground">
                          {p.preentrevista?.notas || "—"}
                        </td>
                        <td className="py-2.5 pl-3 text-right align-middle">
                          <div className="flex flex-wrap items-center justify-end gap-1.5">
                            <EnlaceAccion
                              href={conDesde(`/admin/postulaciones/${p.id}`, "/admin/preentrevistas")}
                              variante="primario"
                            >
                              Postulación
                            </EnlaceAccion>
                            <EnlaceAccion
                              href={conDesde(`/admin/ofertas/${p.oferta.id}`, "/admin/preentrevistas")}
                            >
                              Oferta
                            </EnlaceAccion>
                            <EnlaceAccion
                              href={conDesde(`/admin/postulantes/${p.postulante.id}`, "/admin/preentrevistas")}
                            >
                              Postulante
                            </EnlaceAccion>
                            <DialogoReprogramarPreentrevista
                              postulacionId={p.id}
                              nombrePostulante={postulante}
                              tituloOferta={p.oferta.titulo}
                              fechaActual={p.preentrevista?.fecha}
                              notasActuales={p.preentrevista?.notas}
                              etiquetaBoton="Reprogramar"
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </AnimarColapsable>
    </section>
  );
}
