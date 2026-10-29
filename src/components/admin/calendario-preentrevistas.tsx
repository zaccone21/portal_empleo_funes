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
import { AnimatePresence, motion } from "motion/react";
import type { DateRange } from "react-day-picker";
import {
  CalendarDaysIcon,
  CalendarIcon,
  CalendarRangeIcon,
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { hoyArgentino } from "@/lib/admin/fechas";
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
        "flex flex-col rounded-lg border text-left text-[12px] shadow-2xs transition-shadow hover:shadow-xs",
        compacta ? "gap-1 p-2 text-[11px]" : "gap-1.5 p-2.5",
        esPendiente
          ? "border-attention-card-border bg-attention-card/70"
          : "border-primary/25 bg-secondary/55",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-1">
        <span className="font-heading text-[12px] font-bold text-foreground tabular-nums">
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
          className="truncate text-[11px] font-medium text-muted-foreground hover:text-primary hover:underline"
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

      {!compacta && (
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
      )}

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
 * Full-width, responsive Pre-interviews Calendar (`/admin/preentrevistas`).
 * Layout order:
 * 1. PageHeader
 * 2. Filter & Period control bar (with fluid motion animations for view mode and status toggle)
 * 3. Calendar grid (with equal sized cells, compact activities and smooth height animation)
 * 4. Collapsible list of pre-interviews below the calendar
 */
export function CalendarioPreentrevistas({ postulacionesConPreentrevista }: Props) {
  const hoyClave = hoyArgentino();
  const [vista, setVista] = useState<VistaCalendarioPre>("mes");
  const [fechaBase, setFechaBase] = useState<Date>(() => parsearDiaLocal(hoyClave));
  const [rangoPersonalizado, setRangoPersonalizado] = useState<DateRange | undefined>(() => ({
    from: parsearDiaLocal(hoyClave),
    to: addDays(parsearDiaLocal(hoyClave), 14),
  }));
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("todas");
  const [popoverPeriodoAbierto, setPopoverPeriodoAbierto] = useState(false);

  function irAnterior() {
    if (vista === "periodo" && rangoPersonalizado?.from) {
      const ini = rangoPersonalizado.from;
      const fin = rangoPersonalizado.to ?? ini;
      const dias = Math.max(1, Math.round((fin.getTime() - ini.getTime()) / (24 * 60 * 60 * 1000)));
      setRangoPersonalizado({
        from: subDays(ini, dias),
        to: subDays(fin, dias),
      });
      return;
    }
    setFechaBase((actual) =>
      vista === "dia" ? subDays(actual, 1) : vista === "semana" ? subWeeks(actual, 1) : subMonths(actual, 1),
    );
  }

  function irSiguiente() {
    if (vista === "periodo" && rangoPersonalizado?.from) {
      const ini = rangoPersonalizado.from;
      const fin = rangoPersonalizado.to ?? ini;
      const dias = Math.max(1, Math.round((fin.getTime() - ini.getTime()) / (24 * 60 * 60 * 1000)));
      setRangoPersonalizado({
        from: addDays(ini, dias),
        to: addDays(fin, dias),
      });
      return;
    }
    setFechaBase((actual) =>
      vista === "dia" ? addDays(actual, 1) : vista === "semana" ? addWeeks(actual, 1) : addMonths(actual, 1),
    );
  }

  function irHoy() {
    const hoy = parsearDiaLocal(hoyClave);
    setFechaBase(hoy);
    if (vista === "periodo") {
      setRangoPersonalizado({ from: hoy, to: addDays(hoy, 14) });
    }
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
    if (vista === "periodo" && rangoPersonalizado?.from) {
      return {
        inicio: rangoPersonalizado.from,
        fin: rangoPersonalizado.to ?? rangoPersonalizado.from,
      };
    }
    const inicioMes = startOfMonth(fechaBase);
    const finMes = endOfMonth(fechaBase);
    return {
      inicio: startOfWeek(inicioMes, { weekStartsOn: 1 }),
      fin: endOfWeek(finMes, { weekStartsOn: 1 }),
    };
  }, [vista, fechaBase, rangoPersonalizado]);

  const etiquetaPeriodo = useMemo(() => {
    if (vista === "dia") {
      return format(fechaBase, "EEEE d 'de' MMMM yyyy", { locale: es });
    }
    if (vista === "semana") {
      const ini = startOfWeek(fechaBase, { weekStartsOn: 1 });
      const fin = endOfWeek(fechaBase, { weekStartsOn: 1 });
      return `Semana del ${format(ini, "d MMM", { locale: es })} al ${format(fin, "d MMM yyyy", { locale: es })}`;
    }
    if (vista === "periodo" && rangoPersonalizado?.from) {
      const ini = rangoPersonalizado.from;
      const fin = rangoPersonalizado.to;
      if (!fin || isSameDay(ini, fin)) {
        return format(ini, "EEEE d 'de' MMMM yyyy", { locale: es });
      }
      return `${format(ini, "d 'de' MMM", { locale: es })} al ${format(fin, "d 'de' MMM yyyy", { locale: es })}`;
    }
    return format(fechaBase, "MMMM yyyy", { locale: es });
  }, [vista, fechaBase, rangoPersonalizado]);

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
        titulo="Agenda de Pre-entrevistas"
        descripcion="Organizá y reprogramá entrevistas previas por día, semana, mes o período personalizado."
        aside={`${filtradasPorEstado.length} en total`}
        compacto
      />

      {/* Barra de Control, Navegación y Filtros (con animaciones de transición suave) */}
      <section
        aria-label="Controles del calendario"
        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3.5 sm:px-5 sm:py-3.5 shadow-2xs transition-shadow"
      >
        {/* Zona 1: Navegación del período */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex items-center rounded-lg border border-border bg-surface p-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={irAnterior}
              aria-label="Período anterior"
              className="size-8.5 rounded-md hover:bg-card"
            >
              <ChevronLeftIcon className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={irHoy}
              className="h-8.5 px-3 text-xs sm:text-[13px] font-bold hover:bg-card"
            >
              Hoy
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={irSiguiente}
              aria-label="Período siguiente"
              className="size-8.5 rounded-md hover:bg-card"
            >
              <ChevronRightIcon className="size-4" />
            </Button>
          </div>

          <div className="flex min-w-[200px] items-center pl-1 overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.h2
                key={etiquetaPeriodo}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 6 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="font-heading text-base sm:text-lg font-bold capitalize text-foreground truncate"
              >
                {etiquetaPeriodo}
              </motion.h2>
            </AnimatePresence>
          </div>
        </div>

        {/* Zona 2 & 3: Selector de Vista + Filtros de Estado con transiciones deslizantes */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Selector de Vista (Día / Semana / Mes / Período) */}
          <div
            role="group"
            aria-label="Elegir vista del calendario"
            className="relative inline-flex rounded-lg border border-border bg-surface p-1"
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
                    "relative z-10 inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs sm:text-[12.5px] font-semibold transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    activa
                      ? "text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {activa && (
                    <motion.span
                      layoutId="indicador-vista-activa"
                      className="absolute inset-0 -z-10 rounded-md bg-primary shadow-2xs"
                      transition={{ type: "spring", stiffness: 450, damping: 32 }}
                    />
                  )}
                  <Icono aria-hidden="true" className="size-3.5" />
                  {label}
                </button>
              );
            })}

            {/* Acomodar por período específico (shadcn Calendar mode="range") */}
            <Popover open={popoverPeriodoAbierto} onOpenChange={setPopoverPeriodoAbierto}>
              <PopoverTrigger
                render={
                  <button
                    type="button"
                    className={cn(
                      "relative z-10 inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs sm:text-[12.5px] font-semibold transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      vista === "periodo"
                        ? "text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                    title="Acomodar el calendario por un período de tiempo específico"
                  >
                    {vista === "periodo" && (
                      <motion.span
                        layoutId="indicador-vista-activa"
                        className="absolute inset-0 -z-10 rounded-md bg-primary shadow-2xs"
                        transition={{ type: "spring", stiffness: 450, damping: 32 }}
                      />
                    )}
                    <CalendarRangeIcon aria-hidden="true" className="size-3.5" />
                    Período
                  </button>
                }
              />
              <PopoverContent align="end" className="w-auto p-4 max-w-sm">
                <PopoverHeader className="pb-2">
                  <PopoverTitle className="text-sm font-semibold text-foreground">
                    Acomodar por período específico
                  </PopoverTitle>
                </PopoverHeader>

                <div className="flex flex-col gap-3">
                  {/* Atajos rápidos de período */}
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        const hoy = parsearDiaLocal(hoyClave);
                        setRangoPersonalizado({ from: hoy, to: addDays(hoy, 6) });
                        setVista("periodo");
                        setPopoverPeriodoAbierto(false);
                      }}
                      className="rounded border border-border bg-surface px-2 py-1 font-medium hover:bg-card"
                    >
                      Próximos 7 días
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const hoy = parsearDiaLocal(hoyClave);
                        setRangoPersonalizado({ from: hoy, to: addDays(hoy, 13) });
                        setVista("periodo");
                        setPopoverPeriodoAbierto(false);
                      }}
                      className="rounded border border-border bg-surface px-2 py-1 font-medium hover:bg-card"
                    >
                      Próximos 14 días
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const hoy = parsearDiaLocal(hoyClave);
                        setRangoPersonalizado({ from: hoy, to: addDays(hoy, 29) });
                        setVista("periodo");
                        setPopoverPeriodoAbierto(false);
                      }}
                      className="rounded border border-border bg-surface px-2 py-1 font-medium hover:bg-card"
                    >
                      Próximos 30 días
                    </button>
                  </div>

                  <Calendar
                    mode="range"
                    selected={rangoPersonalizado}
                    onSelect={(nuevoRango) => {
                      setRangoPersonalizado(nuevoRango);
                    }}
                    locale={es}
                    className="rounded-lg border border-border p-2"
                  />

                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    disabled={!rangoPersonalizado?.from}
                    onClick={() => {
                      if (rangoPersonalizado?.from) {
                        setVista("periodo");
                        setPopoverPeriodoAbierto(false);
                      }
                    }}
                    className="w-full font-semibold"
                  >
                    Ver este período en el calendario
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Filtro de Estado con transición fluida */}
          <div
            role="group"
            aria-label="Filtrar por estado de confirmación"
            className="relative inline-flex flex-wrap rounded-lg border border-border bg-surface p-1"
          >
            {[
              { id: "todas" as const, label: `Todas (${conteosEstado.todas})` },
              {
                id: "agendadas" as const,
                label: `Agendadas (${conteosEstado.agendadas})`,
                punto: "bg-primary",
              },
              {
                id: "pendientes" as const,
                label: `Pendientes (${conteosEstado.pendientes})`,
                punto: "bg-amber-500",
              },
            ].map(({ id, label, punto }) => {
              const activa = filtroEstado === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFiltroEstado(id)}
                  className={cn(
                    "relative z-10 inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    activa ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {activa && (
                    <motion.span
                      layoutId="indicador-estado-activo"
                      className="absolute inset-0 -z-10 rounded-md bg-card shadow-2xs ring-1 ring-border"
                      transition={{ type: "spring", stiffness: 450, damping: 32 }}
                    />
                  )}
                  {punto && (
                    <span aria-hidden="true" className={cn("size-2 rounded-full", punto)} />
                  )}
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Componente 1: Calendario con animación de layout suave (sin saltos bruscos) */}
      <motion.section
        layout
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="flex w-full flex-col gap-3 rounded-xl border border-border bg-card p-3.5 sm:p-5 shadow-2xs"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2.5">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="flex size-7.5 items-center justify-center rounded-lg bg-secondary text-primary"
            >
              <CalendarIcon className="size-4" />
            </span>
            <h2 className="font-heading text-sm sm:text-base font-bold text-foreground">
              Calendario (
              {vista === "dia"
                ? "Vista diaria"
                : vista === "semana"
                  ? "Vista semanal"
                  : vista === "periodo"
                    ? "Período personalizado"
                    : "Vista mensual"}
              )
            </h2>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-primary" />
              Agendada
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-amber-500" />
              Pendiente
            </span>
          </div>
        </div>

        {/* Contenedor animado con AnimatePresence para suavizar el cambio de vista y filtros */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${vista}-${filtroEstado}-${rango.inicio.toISOString()}-${rango.fin.toISOString()}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
          >
            {/* Vista: Día */}
            {vista === "dia" && (
              <div className="flex flex-col gap-3 pt-1">
                {preentrevistasEnPeriodo.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border bg-surface py-12 text-center text-sm text-muted-foreground">
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

            {/* Vista: Semana */}
            {vista === "semana" && (
              <div className="grid w-full grid-cols-1 gap-2 pt-0.5 md:grid-cols-7">
                {diasGrilla.map((dia) => {
                  const clave = format(dia, "yyyy-MM-dd");
                  const eventos = eventosPorDia.get(clave) ?? [];
                  const esHoy = clave === hoyClave;

                  return (
                    <div
                      key={clave}
                      className={cn(
                        "flex h-[340px] md:h-[360px] flex-col rounded-lg border p-2 overflow-hidden",
                        esHoy ? "border-primary bg-secondary/20" : "border-border bg-surface/50",
                      )}
                    >
                      <div className="flex items-baseline justify-between border-b border-border pb-1.5">
                        <span className="text-[11.5px] font-semibold capitalize text-muted-foreground">
                          {format(dia, "EEEE", { locale: es })}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setFechaBase(dia);
                            setVista("dia");
                          }}
                          className={cn(
                            "inline-flex size-6 items-center justify-center rounded-full text-[12px] font-bold tabular-nums hover:bg-secondary transition-colors",
                            esHoy ? "bg-primary text-primary-foreground" : "text-foreground",
                          )}
                          title={`Abrir agenda del ${format(dia, "d 'de' MMMM", { locale: es })}`}
                        >
                          {format(dia, "d")}
                        </button>
                      </div>

                      <div className="flex flex-1 flex-col gap-1.5 overflow-y-auto pr-0.5 pt-1.5">
                        {eventos.length === 0 ? (
                          <span className="py-6 text-center text-[11px] text-muted-foreground/60">
                            Sin turnos
                          </span>
                        ) : (
                          eventos.map((ev) => (
                            <TarjetaEventoCalendario
                              key={ev.id}
                              postulacion={ev}
                              compacta={eventos.length > 1}
                            />
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Vista: Mes o Período personalizado */}
            {(vista === "mes" || vista === "periodo") && (
              <div className="flex w-full flex-col gap-1 pt-0.5">
                <div className="hidden grid-cols-7 gap-1.5 text-center text-[11px] font-bold tracking-wider text-muted-foreground uppercase md:grid">
                  {DIAS_SEMANA.map((d) => (
                    <div key={d} className="rounded bg-surface py-1">
                      {d}
                    </div>
                  ))}
                </div>
                <div className="grid w-full grid-cols-1 gap-1.5 sm:grid-cols-2 md:grid-cols-7">
                  {diasGrilla.map((dia) => {
                    const clave = format(dia, "yyyy-MM-dd");
                    const eventos = eventosPorDia.get(clave) ?? [];
                    const enMesActual = vista === "mes" ? isSameMonth(dia, fechaBase) : true;
                    const esHoy = isSameDay(dia, parsearDiaLocal(hoyClave));

                    return (
                      <div
                        key={clave}
                        className={cn(
                          "flex h-[116px] flex-col rounded-lg border p-1.5 transition-colors overflow-hidden",
                          !enMesActual && "bg-muted/20 opacity-50",
                          esHoy
                            ? "border-primary bg-secondary/25 ring-1 ring-primary/20"
                            : "border-border bg-surface/40",
                        )}
                      >
                        <div className="flex items-center justify-between pb-1">
                          <span className="text-[10.5px] font-semibold capitalize text-muted-foreground md:hidden">
                            {format(dia, "EEEE d MMM", { locale: es })}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setFechaBase(dia);
                              setVista("dia");
                            }}
                            className={cn(
                              "ml-auto inline-flex size-5.5 items-center justify-center rounded-full text-[11px] font-bold tabular-nums hover:bg-secondary transition-colors",
                              esHoy ? "bg-primary text-primary-foreground" : "text-foreground",
                            )}
                            title={`Abrir turnos del ${format(dia, "d 'de' MMMM", { locale: es })}`}
                          >
                            {format(dia, "d")}
                          </button>
                        </div>

                        {/* Contenido del día con casillas de igual tamaño y actividades compactas */}
                        <div className="flex flex-1 flex-col gap-1 overflow-hidden">
                          {eventos.length === 0 ? null : eventos.length === 1 ? (
                            (() => {
                              const ev = eventos[0];
                              const fechaIso = ev.preentrevista?.fecha ?? ev.postuladoEl;
                              const hora = formatoHoraAR.format(new Date(fechaIso));
                              const esPendiente = ev.preentrevistaEstado === "pendiente_confirmacion";
                              const postulante = nombreCompleto(ev.postulante) ?? "Postulante";
                              return (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFechaBase(dia);
                                    setVista("dia");
                                  }}
                                  className={cn(
                                    "group flex flex-1 flex-col justify-center rounded border p-1 text-left text-[11px] transition-colors hover:border-primary/50",
                                    esPendiente
                                      ? "border-attention-card-border/80 bg-attention-card/60"
                                      : "border-primary/20 bg-secondary/50",
                                  )}
                                  title={`${hora} hs · ${postulante} (${ev.oferta.titulo}) · ${esPendiente ? "Pendiente" : "Agendada"} - Clic para ver día`}
                                >
                                  <div className="flex items-center justify-between gap-1 leading-none">
                                    <span className="font-heading text-[11px] font-bold tabular-nums text-foreground">
                                      {hora} hs
                                    </span>
                                    <span
                                      aria-hidden="true"
                                      className={cn(
                                        "size-1.5 shrink-0 rounded-full",
                                        esPendiente ? "bg-amber-500" : "bg-primary",
                                      )}
                                    />
                                  </div>
                                  <span className="truncate font-semibold text-foreground group-hover:text-primary">
                                    {postulante}
                                  </span>
                                  <span className="truncate text-[10px] text-muted-foreground">
                                    {ev.oferta.titulo}
                                  </span>
                                </button>
                              );
                            })()
                          ) : (
                            // Múltiples actividades: compactadas y abreviadas
                            <div className="flex flex-1 flex-col justify-start gap-1 overflow-hidden">
                              {eventos.slice(0, eventos.length > 3 ? 2 : 3).map((ev) => {
                                const fechaIso = ev.preentrevista?.fecha ?? ev.postuladoEl;
                                const hora = formatoHoraAR.format(new Date(fechaIso));
                                const esPendiente = ev.preentrevistaEstado === "pendiente_confirmacion";
                                const postulante = nombreCompleto(ev.postulante) ?? "Postulante";
                                return (
                                  <button
                                    key={ev.id}
                                    type="button"
                                    onClick={() => {
                                      setFechaBase(dia);
                                      setVista("dia");
                                    }}
                                    className={cn(
                                      "group flex h-[21px] w-full items-center gap-1 rounded border px-1 text-left text-[10px] transition-colors hover:border-primary/60",
                                      esPendiente
                                        ? "border-attention-card-border/70 bg-attention-card/50"
                                        : "border-primary/20 bg-secondary/40",
                                    )}
                                    title={`${hora} hs · ${postulante} (${ev.oferta.titulo}) · ${esPendiente ? "Pendiente" : "Agendada"} - Clic para ver día`}
                                  >
                                    <span
                                      aria-hidden="true"
                                      className={cn(
                                        "size-1.5 shrink-0 rounded-full",
                                        esPendiente ? "bg-amber-500" : "bg-primary",
                                      )}
                                    />
                                    <span className="shrink-0 font-bold tabular-nums text-foreground">
                                      {hora}
                                    </span>
                                    <span className="truncate font-medium text-foreground group-hover:text-primary">
                                      {postulante}
                                    </span>
                                  </button>
                                );
                              })}

                              {eventos.length > 3 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFechaBase(dia);
                                    setVista("dia");
                                  }}
                                  className="inline-flex h-[18px] w-full items-center justify-center rounded bg-muted/60 text-[9.5px] font-bold text-primary hover:bg-muted"
                                  title={`Ver los ${eventos.length} turnos del día`}
                                >
                                  +{eventos.length - 2} más
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.section>

      {/* Componente 2: Listado colapsable ubicado ABAJO del calendario */}
      <ListaPreentrevistasColapsable
        preentrevistas={preentrevistasEnPeriodo}
        vista={vista}
        etiquetaPeriodo={etiquetaPeriodo}
      />
    </AnimarEntrada>
  );
}
