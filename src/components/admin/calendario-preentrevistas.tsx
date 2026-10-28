"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";
import { es } from "date-fns/locale";
import {
  CalendarDaysIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  LayoutGridIcon,
} from "lucide-react";

import { nombreCompleto } from "@/components/admin/celdas";
import { DialogoReprogramarPreentrevista } from "@/components/admin/dialogo-reprogramar-preentrevista";
import {
  ListaPreentrevistasColapsable,
  type VistaCalendarioPre,
} from "@/components/admin/lista-preentrevistas-colapsable";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { AnimarEntrada } from "@/components/marca/animaciones";
import { Button } from "@/components/ui/button";
import { fechaHora, hoyArgentino } from "@/lib/admin/fechas";
import { conDesde } from "@/lib/admin/url";
import { cn } from "@/lib/utils";
import type { PostulacionAdmin } from "@/lib/validation/oficina";

type Props = {
  postulacionesConPreentrevista: PostulacionAdmin[];
};

type FiltroEstado = "todas" | "agendadas" | "pendientes";

const DIAS_SEMANA = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const formatoHoraAR = new Intl.DateTimeFormat("es-AR", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "America/Argentina/Buenos_Aires",
});

const formatoDiaClaveAR = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "America/Argentina/Buenos_Aires",
});

function claveDiaAR(fecha: Date | string): string {
  const d = typeof fecha === "string" ? new Date(fecha) : fecha;
  return formatoDiaClaveAR.format(d);
}

function parsearDiaLocal(yyyyMmDd: string): Date {
  const [y, m, d] = yyyyMmDd.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

function TarjetaEventoCalendario({
  postulacion,
  compacta = false,
}: {
  postulacion: PostulacionAdmin;
  compacta?: boolean;
}) {
  const postulante = nombreCompleto(postulacion.postulante) ?? "Postulante";
  const fechaIso = postulacion.preentrevista?.fecha ?? postulacion.postuladoEl;
  const hora = formatoHoraAR.format(new Date(fechaIso));
  const esPendiente = postulacion.preentrevistaEstado === "pendiente_confirmacion";

  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 rounded-lg border p-2.5 text-left text-[12px] shadow-2xs transition-shadow hover:shadow-xs",
        esPendiente
          ? "border-attention-card-border bg-attention-card/70"
          : "border-primary/25 bg-secondary/55",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-1">
        <span className="font-heading text-[12.5px] font-bold text-foreground tabular-nums">
          {hora} hs
        </span>
        <StatusBadge
          etiqueta={esPendiente ? "Pendiente" : "Agendada"}
          tono={esPendiente ? "attention" : "success"}
        />
      </div>

      <div className="flex flex-col leading-snug">
        <Link
          href={conDesde(`/admin/postulantes/${postulacion.postulante.id}`, "/admin/preentrevistas")}
          className="truncate font-bold text-foreground hover:text-primary hover:underline"
          title={`Postulante: ${postulante}`}
        >
          {postulante}
        </Link>
        <Link
          href={conDesde(`/admin/ofertas/${postulacion.oferta.id}`, "/admin/preentrevistas")}
          className="truncate text-[11.5px] font-medium text-muted-foreground hover:text-primary hover:underline"
          title={`Oferta: ${postulacion.oferta.titulo}`}
        >
          {postulacion.oferta.titulo}
        </Link>
      </div>

      {!compacta && postulacion.preentrevista?.notas && (
        <p className="line-clamp-2 text-[11.5px] text-muted-foreground">
          {postulacion.preentrevista.notas}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-1.5 border-t border-border/60 pt-1">
        <Link
          href={conDesde(`/admin/postulaciones/${postulacion.id}`, "/admin/preentrevistas")}
          className="text-[11px] font-semibold text-primary hover:underline"
        >
          Postulación
        </Link>
        <span aria-hidden="true" className="text-muted-foreground">·</span>
        <Link
          href={conDesde(`/admin/ofertas/${postulacion.oferta.id}`, "/admin/preentrevistas")}
          className="text-[11px] font-semibold text-primary hover:underline"
        >
          Oferta
        </Link>
        <span aria-hidden="true" className="text-muted-foreground">·</span>
        <Link
          href={conDesde(`/admin/postulantes/${postulacion.postulante.id}`, "/admin/preentrevistas")}
          className="text-[11px] font-semibold text-primary hover:underline"
        >
          Postulante
        </Link>
      </div>

      <div className="pt-0.5">
        <DialogoReprogramarPreentrevista
          postulacionId={postulacion.id}
          nombrePostulante={postulante}
          tituloOferta={postulacion.oferta.titulo}
          fechaActual={postulacion.preentrevista?.fecha}
          notasActuales={postulacion.preentrevista?.notas}
          etiquetaBoton="Reprogramar"
        />
      </div>
    </div>
  );
}

/**
 * Full-width, full-height responsive Pre-interviews Calendar (`/admin/preentrevistas`).
 * Features a 3-zone intuitive filter bar (Period navigation, Day/Week/Month segmented toggle,
 * and State pills with counts), a collapsible summary table, and the interactive calendar grid.
 */
export function CalendarioPreentrevistas({ postulacionesConPreentrevista }: Props) {
  const hoyClave = hoyArgentino();
  const [vista, setVista] = useState<VistaCalendarioPre>("mes");
  const [fechaBase, setFechaBase] = useState<Date>(() => parsearDiaLocal(hoyClave));
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("todas");

  function irAnterior() {
    setFechaBase((actual) =>
      vista === "dia" ? subDays(actual, 1) : vista === "semana" ? subWeeks(actual, 1) : subMonths(actual, 1),
    );
  }

  function irSiguiente() {
    setFechaBase((actual) =>
      vista === "dia" ? addDays(actual, 1) : vista === "semana" ? addWeeks(actual, 1) : addMonths(actual, 1),
    );
  }

  function irHoy() {
    setFechaBase(parsearDiaLocal(hoyClave));
  }

  const rango = useMemo(() => {
    if (vista === "dia") {
      return { inicio: fechaBase, fin: fechaBase };
    }
    if (vista === "semana") {
      return {
        inicio: startOfWeek(fechaBase, { weekStartsOn: 1 }),
        fin: endOfWeek(fechaBase, { weekStartsOn: 1 }),
      };
    }
    const inicioMes = startOfMonth(fechaBase);
    const finMes = endOfMonth(fechaBase);
    return {
      inicio: startOfWeek(inicioMes, { weekStartsOn: 1 }),
      fin: endOfWeek(finMes, { weekStartsOn: 1 }),
    };
  }, [vista, fechaBase]);

  const etiquetaPeriodo = useMemo(() => {
    if (vista === "dia") {
      return format(fechaBase, "EEEE d 'de' MMMM yyyy", { locale: es });
    }
    if (vista === "semana") {
      const ini = startOfWeek(fechaBase, { weekStartsOn: 1 });
      const fin = endOfWeek(fechaBase, { weekStartsOn: 1 });
      return `Semana del ${format(ini, "d MMM", { locale: es })} al ${format(fin, "d MMM yyyy", { locale: es })}`;
    }
    return format(fechaBase, "MMMM yyyy", { locale: es });
  }, [vista, fechaBase]);

  const conteosEstado = useMemo(() => {
    let agendadas = 0;
    let pendientes = 0;
    for (const p of postulacionesConPreentrevista) {
      if (!p.preentrevista) continue;
      if (p.preentrevistaEstado === "pendiente_confirmacion") {
        pendientes += 1;
      } else {
        agendadas += 1;
      }
    }
    return { todas: agendadas + pendientes, agendadas, pendientes };
  }, [postulacionesConPreentrevista]);

  const filtradasPorEstado = useMemo(() => {
    return postulacionesConPreentrevista.filter((p) => {
      if (!p.preentrevista) return false;
      const estado = p.preentrevistaEstado ?? "agendada";
      if (filtroEstado === "agendadas") return estado === "agendada";
      if (filtroEstado === "pendientes") return estado === "pendiente_confirmacion";
      return estado === "agendada" || estado === "pendiente_confirmacion";
    });
  }, [postulacionesConPreentrevista, filtroEstado]);

  const eventosPorDia = useMemo(() => {
    const mapa = new Map<string, PostulacionAdmin[]>();
    for (const p of filtradasPorEstado) {
      if (!p.preentrevista) continue;
      const clave = claveDiaAR(p.preentrevista.fecha);
      const lista = mapa.get(clave) ?? [];
      lista.push(p);
      mapa.set(clave, lista);
    }
    for (const lista of mapa.values()) {
      lista.sort((a, b) => (a.preentrevista?.fecha ?? "").localeCompare(b.preentrevista?.fecha ?? ""));
    }
    return mapa;
  }, [filtradasPorEstado]);

  const preentrevistasEnPeriodo = useMemo(() => {
    const dias =
      vista === "mes"
        ? eachDayOfInterval({ start: startOfMonth(fechaBase), end: endOfMonth(fechaBase) })
        : eachDayOfInterval({ start: rango.inicio, end: rango.fin });

    const clavesValidas = new Set(dias.map((d) => format(d, "yyyy-MM-dd")));
    return filtradasPorEstado
      .filter((p) => p.preentrevista && clavesValidas.has(claveDiaAR(p.preentrevista.fecha)))
      .sort((a, b) => (a.preentrevista?.fecha ?? "").localeCompare(b.preentrevista?.fecha ?? ""));
  }, [filtradasPorEstado, fechaBase, rango, vista]);

  const diasGrilla = useMemo(
    () => eachDayOfInterval({ start: rango.inicio, end: rango.fin }),
    [rango],
  );

  return (
    <AnimarEntrada className="flex w-full flex-col gap-4 pb-8">
      <PageHeader
        migas={["Gestión", "Pre-entrevistas"]}
        titulo="Agenda y Calendario de Pre-entrevistas"
        descripcion="Organizá las entrevistas previas por día, semana o mes, verificá quiénes confirmaron asistencia y reprogramá citas en un clic."
        aside={`${filtradasPorEstado.length} en total`}
      />

      {/* Barra de Control y Filtros rediseñada (3 zonas claras) */}
      <section
        aria-label="Controles del calendario"
        className="grid grid-cols-1 gap-3 rounded-xl border border-border bg-card p-4 shadow-2xs xl:grid-cols-[minmax(0,1.2fr)_auto_auto] xl:items-center"
      >
        {/* Zona 1: Navegación del período */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex items-center rounded-lg border border-border bg-surface p-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={irAnterior}
              aria-label="Período anterior"
            >
              <ChevronLeftIcon className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={irHoy}
              className="px-3 font-semibold"
            >
              Ir a hoy
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={irSiguiente}
              aria-label="Período siguiente"
            >
              <ChevronRightIcon className="size-4" />
            </Button>
          </div>

          <div className="flex flex-col">
            <span className="text-[10.5px] font-bold tracking-wider text-muted-foreground uppercase">
              Período seleccionado
            </span>
            <h2 className="font-heading text-lg font-bold capitalize text-foreground">
              {etiquetaPeriodo}
            </h2>
          </div>
        </div>

        {/* Zona 2: Selector de Vista (Día / Semana / Mes) */}
        <div className="flex flex-col gap-1">
          <span className="text-[10.5px] font-bold tracking-wider text-muted-foreground uppercase">
            Vista del calendario
          </span>
          <div
            role="group"
            aria-label="Elegir vista por día, semana o mes"
            className="inline-flex rounded-lg border border-border bg-surface p-1"
          >
            {(
              [
                { id: "dia", label: "Día", icono: ClockIcon },
                { id: "semana", label: "Semana", icono: CalendarDaysIcon },
                { id: "mes", label: "Mes", icono: LayoutGridIcon },
              ] as const
            ).map(({ id, label, icono: Icono }) => {
              const activa = vista === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setVista(id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-[12.5px] font-semibold transition-all",
                    activa
                      ? "bg-primary text-primary-foreground shadow-2xs"
                      : "text-muted-foreground hover:bg-card hover:text-foreground",
                  )}
                >
                  <Icono aria-hidden="true" className="size-3.5" />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Zona 3: Filtro de Estado con indicadores visuales */}
        <div className="flex flex-col gap-1">
          <span className="text-[10.5px] font-bold tracking-wider text-muted-foreground uppercase">
            Filtrar por confirmación
          </span>
          <div
            role="group"
            aria-label="Filtrar por estado de confirmación"
            className="inline-flex flex-wrap rounded-lg border border-border bg-surface p-1"
          >
            <button
              type="button"
              onClick={() => setFiltroEstado("todas")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-semibold transition-all",
                filtroEstado === "todas"
                  ? "bg-card text-foreground shadow-2xs ring-1 ring-border"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Todas ({conteosEstado.todas})
            </button>
            <button
              type="button"
              onClick={() => setFiltroEstado("agendadas")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-semibold transition-all",
                filtroEstado === "agendadas"
                  ? "bg-card text-foreground shadow-2xs ring-1 ring-border"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span aria-hidden="true" className="size-2 rounded-full bg-primary" />
              Agendadas ({conteosEstado.agendadas})
            </button>
            <button
              type="button"
              onClick={() => setFiltroEstado("pendientes")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-semibold transition-all",
                filtroEstado === "pendientes"
                  ? "bg-card text-foreground shadow-2xs ring-1 ring-border"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span aria-hidden="true" className="size-2 rounded-full bg-amber-500" />
              Pendientes ({conteosEstado.pendientes})
            </button>
          </div>
        </div>
      </section>

      {/* Componente 1: Listado colapsable con botón prominente */}
      <ListaPreentrevistasColapsable
        preentrevistas={preentrevistasEnPeriodo}
        vista={vista}
        etiquetaPeriodo={etiquetaPeriodo}
      />

      {/* Componente 2 (Feature Principal): Calendario Full-Width y Responsive */}
      <section className="flex w-full flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-2xs sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="flex size-8 items-center justify-center rounded-lg bg-secondary text-primary"
            >
              <CalendarIcon className="size-4" />
            </span>
            <div>
              <h2 className="font-heading text-[15px] font-bold text-foreground">
                Calendario de turnos ({vista === "dia" ? "Vista diaria" : vista === "semana" ? "Vista semanal" : "Vista mensual completa"})
              </h2>
              <p className="text-[12px] text-muted-foreground">
                Tocá cualquier número de día en la vista mensual para abrir el detalle de ese día.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[12px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-primary" />
              Confirmada (Agendada)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-amber-500" />
              Pendiente de confirmación
            </span>
          </div>
        </div>

        {vista === "dia" && (
          <div className="flex flex-col gap-3 pt-1">
            {preentrevistasEnPeriodo.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-surface py-12 text-center text-[13px] text-muted-foreground">
                No hay entrevistas agendadas para el {etiquetaPeriodo}.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {preentrevistasEnPeriodo.map((p) => (
                  <TarjetaEventoCalendario key={p.id} postulacion={p} />
                ))}
              </div>
            )}
          </div>
        )}

        {vista === "semana" && (
          <div className="grid w-full grid-cols-1 gap-2.5 pt-1 md:grid-cols-7">
            {diasGrilla.map((dia) => {
              const clave = format(dia, "yyyy-MM-dd");
              const eventos = eventosPorDia.get(clave) ?? [];
              const esHoy = clave === hoyClave;

              return (
                <div
                  key={clave}
                  className={cn(
                    "flex min-h-[320px] flex-col gap-2 rounded-lg border p-2.5",
                    esHoy ? "border-primary bg-secondary/20" : "border-border bg-surface/50",
                  )}
                >
                  <div className="flex items-baseline justify-between border-b border-border pb-1.5">
                    <span className="text-[12px] font-semibold capitalize text-muted-foreground">
                      {format(dia, "EEEE", { locale: es })}
                    </span>
                    <span
                      className={cn(
                        "inline-flex size-6 items-center justify-center rounded-full text-[12.5px] font-bold tabular-nums",
                        esHoy ? "bg-primary text-primary-foreground" : "text-foreground",
                      )}
                    >
                      {format(dia, "d")}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col gap-2">
                    {eventos.length === 0 ? (
                      <span className="py-6 text-center text-[11.5px] text-muted-foreground/60">
                        Sin turnos
                      </span>
                    ) : (
                      eventos.map((ev) => <TarjetaEventoCalendario key={ev.id} postulacion={ev} />)
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {vista === "mes" && (
          <div className="flex w-full flex-col gap-1.5 pt-1">
            <div className="hidden grid-cols-7 gap-2 text-center text-[11px] font-bold tracking-wider text-muted-foreground uppercase md:grid">
              {DIAS_SEMANA.map((d) => (
                <div key={d} className="rounded-md bg-surface py-1.5">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-7">
              {diasGrilla.map((dia) => {
                const clave = format(dia, "yyyy-MM-dd");
                const eventos = eventosPorDia.get(clave) ?? [];
                const enMesActual = isSameMonth(dia, fechaBase);
                const esHoy = isSameDay(dia, parsearDiaLocal(hoyClave));

                return (
                  <div
                    key={clave}
                    className={cn(
                      "flex min-h-[140px] flex-col gap-1.5 rounded-lg border p-2.5 transition-colors",
                      !enMesActual && "bg-muted/30 opacity-55",
                      esHoy ? "border-primary bg-secondary/25 ring-1 ring-primary/20" : "border-border bg-surface/40",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold capitalize text-muted-foreground md:hidden">
                        {format(dia, "EEEE d MMM", { locale: es })}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setFechaBase(dia);
                          setVista("dia");
                        }}
                        className={cn(
                          "ml-auto inline-flex size-6 items-center justify-center rounded-full text-[12px] font-bold tabular-nums hover:bg-secondary",
                          esHoy ? "bg-primary text-primary-foreground" : "text-foreground",
                        )}
                        title={`Abrir agenda del ${fechaHora(dia.toISOString())}`}
                      >
                        {format(dia, "d")}
                      </button>
                    </div>
                    <div className="flex flex-1 flex-col gap-1.5">
                      {eventos.map((ev) => (
                        <TarjetaEventoCalendario key={ev.id} postulacion={ev} compacta />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </AnimarEntrada>
  );
}
