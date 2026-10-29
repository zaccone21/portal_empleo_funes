"use client";

import { useMemo, useState } from "react";
import {
  ActivityIcon,
  AwardIcon,
  BarChart3Icon,
  BriefcaseIcon,
  CalendarIcon,
  CalendarRangeIcon,
  FileDownIcon,
  GraduationCapIcon,
  ListChecksIcon,
  SendIcon,
  TableIcon,
  TrendingUpIcon,
  UserCheckIcon,
  UserXIcon,
} from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import { AnimatePresence, motion } from "motion/react";
import { es } from "date-fns/locale";

import { AnimarColapsable, AnimarElemento, AnimarEntrada, AnimarGrupo } from "@/components/marca/animaciones";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fechaCorta, hoyArgentino } from "@/lib/admin/fechas";
import type { DatosMetricasPortal } from "@/lib/use-cases/oficina";
import { esRubro, NOMBRE_RUBRO } from "@/lib/validation/rubros";
import { cn } from "cn";

import { PageHeader } from "./page-header";

type ModoPeriodo = "dia" | "semana" | "mes" | "personalizado" | "historico";

const ETIQUETAS_PERIODO: Record<ModoPeriodo, string> = {
  dia: "Hoy",
  semana: "Últimos 7 días",
  mes: "Últimos 30 días",
  personalizado: "Elegir fechas",
  historico: "Todo el historial",
};

/** Most recent rows shown in "Últimos resultados" (the table is a summary, not an export). */
const FILAS_RESULTADOS = 30;

/** Longest range (in days) for which days without activity are still drawn in the charts. */
const MAX_DIAS_COMPLETOS = 62;

function aIso(fecha: Date): string {
  const mm = String(fecha.getMonth() + 1).padStart(2, "0");
  const dd = String(fecha.getDate()).padStart(2, "0");
  return `${fecha.getFullYear()}-${mm}-${dd}`;
}

function aFecha(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function restarDias(iso: string, dias: number): string {
  const fecha = aFecha(iso);
  fecha.setDate(fecha.getDate() - dias);
  return aIso(fecha);
}

function listarDiasEntre(desde: string, hasta: string): string[] {
  const resultado: string[] = [];
  const actual = aFecha(desde);
  const fin = aFecha(hasta);
  while (actual <= fin && resultado.length <= MAX_DIAS_COMPLETOS) {
    resultado.push(aIso(actual));
    actual.setDate(actual.getDate() + 1);
  }
  return resultado;
}

const configVisitas = {
  visitas: { label: "Visitas", color: "var(--brand-leaf)" },
} satisfies ChartConfig;

const configActividad = {
  postulaciones: { label: "Postulaciones", color: "var(--brand-deep)" },
  contratados: { label: "Contratados", color: "var(--brand-sun)" },
} satisfies ChartConfig;

const configResultados = {
  cantidad: { label: "Personas", color: "var(--brand-deep)" },
} satisfies ChartConfig;

const configRubros = {
  ofertas: { label: "Ofertas", color: "var(--brand-leaf)" },
  postulaciones: { label: "Postulaciones", color: "var(--brand-deep)" },
} satisfies ChartConfig;

/** Hides the Office shell and lifts the scroll limits so "Exportar .PDF" prints the whole report. */
const ESTILOS_IMPRESION = `
@media print {
  [data-slot="sidebar"], [data-slot="sidebar-gap"], [data-slot="sidebar-container"] { display: none !important; }
  html, body, [data-slot="sidebar-wrapper"], main { height: auto !important; min-height: 0 !important; overflow: visible !important; }
  body { background: #fff !important; }
  section, article { break-inside: avoid; }
}`;

type Props = {
  datos: DatosMetricasPortal;
};

type Tono = "exito" | "alerta" | "peligro" | "neutro";

/**
 * Metrics and reports of the Office (`/admin/metricas`). One period filter
 * (today, 7 days, 30 days, custom dates, all) drives everything on the page:
 * the summary cards, the charts, the three summary tables and the printed
 * report ("Exportar resumen en .PDF" uses the browser's print dialog, which
 * saves a PDF). Only real counts are shown; where there is no data the screen
 * says so instead of estimating.
 */
export function PanelMetricas({ datos }: Props) {
  const hoy = useMemo(() => hoyArgentino(), []);
  const hace7Dias = useMemo(() => restarDias(hoy, 6), [hoy]);
  const hace30Dias = useMemo(() => restarDias(hoy, 29), [hoy]);

  const [modoPeriodo, setModoPeriodo] = useState<ModoPeriodo>("mes");
  const [desdeCustom, setDesdeCustom] = useState<string>(hace30Dias);
  const [hastaCustom, setHastaCustom] = useState<string>(hoy);

  const rango = useMemo(() => {
    if (modoPeriodo === "dia") return { desde: hoy, hasta: hoy, etiqueta: `Hoy, ${fechaCorta(hoy)}` };
    if (modoPeriodo === "semana") {
      return { desde: hace7Dias, hasta: hoy, etiqueta: `Del ${fechaCorta(hace7Dias)} al ${fechaCorta(hoy)}` };
    }
    if (modoPeriodo === "mes") {
      return { desde: hace30Dias, hasta: hoy, etiqueta: `Del ${fechaCorta(hace30Dias)} al ${fechaCorta(hoy)}` };
    }
    if (modoPeriodo === "personalizado") {
      const d = desdeCustom || hace30Dias;
      const h = hastaCustom || hoy;
      const desde = d <= h ? d : h;
      const hasta = d <= h ? h : d;
      return { desde, hasta, etiqueta: `Del ${fechaCorta(desde)} al ${fechaCorta(hasta)}` };
    }
    return { desde: "2000-01-01", hasta: "2999-12-31", etiqueta: "Todo el historial" };
  }, [modoPeriodo, hoy, hace7Dias, hace30Dias, desdeCustom, hastaCustom]);

  const analisis = useMemo(() => {
    const enRango = (iso: string | null | undefined) => {
      if (!iso) return false;
      const dia = iso.slice(0, 10);
      return dia >= rango.desde && dia <= rango.hasta;
    };
    const fechaResultado = (p: DatosMetricasPortal["postulaciones"][number]) =>
      (p.actualizadaEl ?? p.derivadaEl ?? p.postuladoEl).slice(0, 10);

    const visitas = datos.visitasDiarias.filter((v) => enRango(v.fecha));
    const ofertas = datos.ofertas.filter((o) => enRango(o.creadaEl));
    const recibidas = datos.postulaciones.filter((p) => enRango(p.postuladoEl));
    const presentadas = datos.postulaciones.filter((p) => enRango(p.derivadaEl));
    const contratadas = datos.postulaciones.filter(
      (p) => p.decisionEmpresa === "contratado" && enRango(fechaResultado(p)),
    );
    const noContratadas = datos.postulaciones.filter(
      (p) => p.decisionEmpresa === "no_contratado" && enRango(fechaResultado(p)),
    );
    const noAptas = datos.postulaciones.filter((p) => p.estado === "no_apto" && enRango(fechaResultado(p)));
    const sinRespuesta = presentadas.filter((p) => p.decisionEmpresa === null);
    const cursos = datos.derivacionesCurso.filter((c) => enRango(c.fecha));

    const totalVisitas = visitas.reduce((acc, v) => acc + v.cantidad, 0);
    const primerDiaConVisitas = datos.visitasDiarias[0]?.fecha ?? null;

    // Day by day: every day of short ranges (so the charts have no holes), only active days otherwise.
    const dias = new Set<string>();
    const cantidadDias = rango.hasta >= "2999" ? Infinity : listarDiasEntre(rango.desde, rango.hasta).length;
    if (cantidadDias <= MAX_DIAS_COMPLETOS) {
      for (const d of listarDiasEntre(rango.desde, rango.hasta)) dias.add(d);
    } else {
      for (const v of visitas) dias.add(v.fecha.slice(0, 10));
      for (const o of ofertas) dias.add(o.creadaEl.slice(0, 10));
      for (const p of recibidas) dias.add(p.postuladoEl.slice(0, 10));
      for (const p of [...contratadas, ...noContratadas, ...noAptas]) dias.add(fechaResultado(p));
      for (const c of cursos) dias.add(c.fecha.slice(0, 10));
    }
    const visitasPorDia = new Map(datos.visitasDiarias.map((v) => [v.fecha.slice(0, 10), v.cantidad]));
    const cuenta = <T,>(lista: T[], fecha: string, dia: (x: T) => string) =>
      lista.filter((x) => dia(x) === fecha).length;

    const porDia = [...dias]
      .sort((a, b) => a.localeCompare(b))
      .map((fecha) => ({
        fecha,
        etiqueta: fechaCorta(fecha),
        visitas: visitasPorDia.get(fecha) ?? 0,
        ofertas: cuenta(ofertas, fecha, (o) => o.creadaEl.slice(0, 10)),
        postulaciones: cuenta(recibidas, fecha, (p) => p.postuladoEl.slice(0, 10)),
        presentadas: cuenta(presentadas, fecha, (p) => (p.derivadaEl ?? "").slice(0, 10)),
        contratados: cuenta(contratadas, fecha, fechaResultado),
        noContratados: cuenta([...noContratadas, ...noAptas], fecha, fechaResultado),
        cursos: cuenta(cursos, fecha, (c) => c.fecha.slice(0, 10)),
      }));

    const mapaRubros = new Map<
      string,
      { rubro: string; etiqueta: string; ofertas: number; postulaciones: number; contratados: number }
    >();
    const rubro = (slug: string) => {
      const existente = mapaRubros.get(slug);
      if (existente) return existente;
      const nuevo = {
        rubro: slug,
        etiqueta: esRubro(slug) ? NOMBRE_RUBRO[slug] : slug,
        ofertas: 0,
        postulaciones: 0,
        contratados: 0,
      };
      mapaRubros.set(slug, nuevo);
      return nuevo;
    };
    for (const o of ofertas) for (const r of o.rubros) rubro(r).ofertas += 1;
    for (const p of recibidas) for (const r of p.oferta.rubros) rubro(r).postulaciones += 1;
    for (const p of contratadas) for (const r of p.oferta.rubros) rubro(r).contratados += 1;
    const porRubro = [...mapaRubros.values()].sort(
      (a, b) => b.postulaciones + b.ofertas - (a.postulaciones + a.ofertas),
    );

    // Latest results: hires, rejections and course referrals, with the person's name (no ID numbers).
    const resultados: {
      id: string;
      fecha: string;
      persona: string;
      queOcurrio: string;
      tono: Tono;
      detalle: string;
      entidad: string;
    }[] = [];
    const nombre = (p: DatosMetricasPortal["postulaciones"][number]) =>
      [p.postulante.nombre, p.postulante.apellido].filter(Boolean).join(" ") || "Postulante";
    const empresa = (p: DatosMetricasPortal["postulaciones"][number]) => p.oferta.empresa?.razonSocial ?? "Empresa";
    for (const p of contratadas) {
      resultados.push({
        id: `c-${p.id}`,
        fecha: fechaResultado(p),
        persona: nombre(p),
        queOcurrio: "Consiguió trabajo",
        tono: "exito",
        detalle: p.oferta.titulo,
        entidad: empresa(p),
      });
    }
    for (const p of noContratadas) {
      resultados.push({
        id: `n-${p.id}`,
        fecha: fechaResultado(p),
        persona: nombre(p),
        queOcurrio: "No fue elegido por la empresa",
        tono: "peligro",
        detalle: p.oferta.titulo,
        entidad: empresa(p),
      });
    }
    for (const p of noAptas) {
      resultados.push({
        id: `a-${p.id}`,
        fecha: fechaResultado(p),
        persona: nombre(p),
        queOcurrio: "No pasó la pre-entrevista",
        tono: "peligro",
        detalle: p.oferta.titulo,
        entidad: empresa(p),
      });
    }
    cursos.forEach((c, i) => {
      resultados.push({
        id: `k-${c.postulanteId}-${i}`,
        fecha: c.fecha.slice(0, 10),
        persona: c.postulanteNombre,
        queOcurrio: "Se le asignó un curso",
        tono: "alerta",
        detalle: c.curso,
        entidad: "Oficina de Empleo",
      });
    });
    resultados.sort((a, b) => b.fecha.localeCompare(a.fecha));

    const totalRechazados = noContratadas.length + noAptas.length;
    const tasaContratacion =
      presentadas.length > 0 ? Math.round((contratadas.length / presentadas.length) * 100) : null;

    return {
      totalVisitas,
      hayVisitas: visitas.length > 0,
      primerDiaConVisitas,
      promedioVisitas: visitas.length > 0 ? Math.round(totalVisitas / visitas.length) : 0,
      ofertasNuevas: ofertas.length,
      recibidas: recibidas.length,
      presentadas: presentadas.length,
      contratadas: contratadas.length,
      noContratadas: noContratadas.length,
      noAptas: noAptas.length,
      totalRechazados,
      sinRespuesta: sinRespuesta.length,
      personasEnCursos: new Set(cursos.map((c) => c.postulanteId)).size,
      cursosAsignados: cursos.length,
      tasaContratacion,
      porDia,
      diasConActividad: porDia.filter(
        (d) => d.visitas + d.ofertas + d.postulaciones + d.presentadas + d.contratados + d.noContratados + d.cursos > 0,
      ),
      porRubro,
      resultados,
    };
  }, [datos, rango]);

  const ofertasActivasHoy = useMemo(() => datos.ofertas.filter((o) => o.estado === "publicada").length, [datos.ofertas]);

  const datosResultados = [
    { etapa: "Consiguieron trabajo", cantidad: analisis.contratadas, fill: "var(--brand-leaf)" },
    { etapa: "Sin respuesta de la empresa", cantidad: analisis.sinRespuesta, fill: "var(--brand-sun)" },
    { etapa: "No elegidos por la empresa", cantidad: analisis.noContratadas, fill: "var(--brand-deep)" },
    { etapa: "No pasaron la pre-entrevista", cantidad: analisis.noAptas, fill: "var(--muted-foreground)" },
  ];

  return (
    <div className="flex flex-col gap-6 pb-10 print:gap-4 print:pb-0">
      <style>{ESTILOS_IMPRESION}</style>

      <div className="hidden rounded-xl border border-border bg-white p-5 print:block">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <p className="text-xs font-bold tracking-widest text-brand-leaf uppercase">
              Municipalidad de Funes · Oficina de Empleo
            </p>
            <h1 className="mt-1 font-heading text-2xl font-bold text-foreground">Resumen de métricas del portal</h1>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">{rango.etiqueta}</p>
            <p>Emitido el {fechaCorta(hoy)}</p>
          </div>
        </div>
      </div>

      <div className="print:hidden">
        <PageHeader
          migas={["Resumen", "Métricas"]}
          titulo="Métricas"
          descripcion="Cuánta gente visita el portal, consigue trabajo, hace cursos o queda afuera. Todo se filtra por período."
          accion={
            <Button type="button" onClick={() => window.print()} className="h-10 gap-2 px-4 font-semibold">
              <FileDownIcon className="size-4" aria-hidden="true" />
              Exportar resumen en .pdf
            </Button>
          }
        />
      </div>

      <AnimarEntrada>
        <section
          aria-label="Período"
          className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card p-4 shadow-xs sm:p-5 print:hidden"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-brand-mint/45 text-brand-deep">
                <CalendarRangeIcon className="size-4.5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-heading text-base font-bold text-foreground">Período</h2>
                <p className="text-xs text-muted-foreground">Cambia las cifras, los gráficos, las tablas y el PDF.</p>
              </div>
            </div>
            <div className="overflow-hidden">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={rango.etiqueta}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.18 }}
                >
                  <Badge variant="outline" className="border-brand-leaf/30 bg-brand-mint/25 px-3 py-1 text-xs font-semibold text-brand-deep">
                    {rango.etiqueta}
                  </Badge>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div role="group" aria-label="Elegir período" className="relative flex flex-wrap items-center gap-2">
            {(Object.keys(ETIQUETAS_PERIODO) as ModoPeriodo[]).map((modo) => {
              const activo = modoPeriodo === modo;
              return (
                <button
                  key={modo}
                  type="button"
                  aria-pressed={activo}
                  onClick={() => setModoPeriodo(modo)}
                  className={cn(
                    "relative z-10 inline-flex min-h-10 items-center rounded-xl px-3.5 text-sm font-semibold transition-colors duration-200 outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    activo
                      ? "text-primary-foreground"
                      : "border border-border bg-background text-foreground hover:border-brand-leaf/50 hover:bg-brand-mint/20",
                  )}
                >
                  {activo && (
                    <motion.span
                      layoutId="indicador-periodo-metricas"
                      className="absolute inset-0 -z-10 rounded-xl bg-brand-deep shadow-2xs"
                      transition={{ type: "spring", stiffness: 450, damping: 32 }}
                    />
                  )}
                  {ETIQUETAS_PERIODO[modo]}
                </button>
              );
            })}
          </div>

          <AnimarColapsable abierto={modoPeriodo === "personalizado"}>
            <div className="mt-1 grid gap-3 rounded-xl border border-brand-leaf/25 bg-brand-mint/10 p-3.5 sm:grid-cols-2 md:max-w-lg">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-foreground">Desde</span>
                <Popover>
                  <PopoverTrigger
                    render={
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 w-full justify-start gap-2 bg-background text-left text-sm font-normal"
                      >
                        <CalendarIcon className="size-4 text-primary" aria-hidden="true" />
                        <span>{fechaCorta(desdeCustom)}</span>
                      </Button>
                    }
                  />
                  <PopoverContent align="start" className="w-auto p-3">
                    <Calendar
                      mode="single"
                      selected={aFecha(desdeCustom)}
                      onSelect={(d) => d && setDesdeCustom(aIso(d))}
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-foreground">Hasta</span>
                <Popover>
                  <PopoverTrigger
                    render={
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 w-full justify-start gap-2 bg-background text-left text-sm font-normal"
                      >
                        <CalendarIcon className="size-4 text-primary" aria-hidden="true" />
                        <span>{fechaCorta(hastaCustom)}</span>
                      </Button>
                    }
                  />
                  <PopoverContent align="start" className="w-auto p-3">
                    <Calendar
                      mode="single"
                      selected={aFecha(hastaCustom)}
                      onSelect={(d) => d && setHastaCustom(aIso(d))}
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </AnimarColapsable>
        </section>
      </AnimarEntrada>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${rango.desde}-${rango.hasta}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-6"
        >
          <AnimarGrupo className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 print:grid-cols-3">
        <TarjetaCifra
          tono="emerald"
          Icono={ActivityIcon}
          titulo="Visitas al sitio"
          valor={analisis.hayVisitas ? analisis.totalVisitas.toLocaleString("es-AR") : "Sin datos"}
          detalle={
            analisis.hayVisitas
              ? `${analisis.promedioVisitas} por día en promedio`
              : analisis.primerDiaConVisitas
                ? "No hay visitas en este período"
                : "El conteo empieza al aplicar la migración"
          }
        />
        <TarjetaCifra
          tono="amber"
          Icono={AwardIcon}
          titulo="Consiguieron trabajo"
          valor={analisis.contratadas.toLocaleString("es-AR")}
          detalle={
            analisis.tasaContratacion === null
              ? "Contrataciones confirmadas por empresas"
              : `${analisis.tasaContratacion} de cada 100 presentados a empresas`
          }
        />
        <TarjetaCifra
          tono="violet"
          Icono={GraduationCapIcon}
          titulo="Tomando cursos"
          valor={analisis.personasEnCursos.toLocaleString("es-AR")}
          detalle={`${analisis.cursosAsignados} ${analisis.cursosAsignados === 1 ? "curso asignado" : "cursos asignados"}`}
        />
        <TarjetaCifra
          tono="rose"
          Icono={UserXIcon}
          titulo="No consiguieron"
          valor={analisis.totalRechazados.toLocaleString("es-AR")}
          detalle={`${analisis.noContratadas} por empresas · ${analisis.noAptas} en pre-entrevista`}
        />
        <TarjetaCifra
          tono="sky"
          Icono={SendIcon}
          titulo="Postulaciones"
          valor={analisis.recibidas.toLocaleString("es-AR")}
          detalle={`${analisis.presentadas} presentadas a empresas`}
        />
        <TarjetaCifra
          tono="teal"
          Icono={BriefcaseIcon}
          titulo="Ofertas nuevas"
          valor={analisis.ofertasNuevas.toLocaleString("es-AR")}
          detalle={`${ofertasActivasHoy} publicadas hoy · ${datos.totalPostulantesPadron} personas registradas`}
        />
      </AnimarGrupo>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 print:grid-cols-1">
        <TarjetaGrafico
          Icono={TrendingUpIcon}
          titulo="Visitas por día"
          descripcion="Cuántas personas entraron al portal cada día."
        >
          {analisis.hayVisitas ? (
            <ChartContainer config={configVisitas} className="aspect-auto h-[240px] w-full">
              <AreaChart data={analisis.porDia} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="etiqueta" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={34} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="visitas"
                  stroke="var(--color-visitas)"
                  fill="var(--color-visitas)"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          ) : (
            <SinDatos texto="Todavía no hay visitas registradas en este período." />
          )}
        </TarjetaGrafico>

        <TarjetaGrafico
          Icono={UserCheckIcon}
          titulo="Postulaciones y contrataciones por día"
          descripcion="Cuántas personas se postularon y cuántas consiguieron trabajo."
        >
          {analisis.recibidas + analisis.contratadas > 0 ? (
            <ChartContainer config={configActividad} className="aspect-auto h-[240px] w-full">
              <BarChart data={analisis.porDia} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="etiqueta" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={34} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="postulaciones" fill="var(--color-postulaciones)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="contratados" fill="var(--color-contratados)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          ) : (
            <SinDatos texto="No hubo postulaciones ni contrataciones en este período." />
          )}
        </TarjetaGrafico>

        <TarjetaGrafico
          Icono={ListChecksIcon}
          titulo="Cómo terminaron las personas presentadas"
          descripcion="De quienes la Oficina presentó a una empresa: cuántos consiguieron trabajo y cuántos no."
        >
          {datosResultados.some((d) => d.cantidad > 0) ? (
            <ChartContainer config={configResultados} className="aspect-auto h-[240px] w-full">
              <BarChart data={datosResultados} layout="vertical" margin={{ top: 6, right: 18, left: 8, bottom: 6 }}>
                <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="etapa" tickLine={false} axisLine={false} width={150} />
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="cantidad" radius={[0, 6, 6, 0]}>
                  {datosResultados.map((d) => (
                    <Cell key={d.etapa} fill={d.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          ) : (
            <SinDatos texto="Todavía no hay resultados en este período." />
          )}
        </TarjetaGrafico>

        <TarjetaGrafico
          Icono={BarChart3Icon}
          titulo="Ofertas y postulaciones por rubro"
          descripcion="Dónde hay más trabajo y dónde hay más gente buscando."
        >
          {analisis.porRubro.length > 0 ? (
            <ChartContainer config={configRubros} className="aspect-auto h-[240px] w-full">
              <BarChart data={analisis.porRubro.slice(0, 8)} margin={{ top: 10, right: 12, left: 0, bottom: 8 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="etiqueta" tickLine={false} axisLine={false} tickMargin={8} interval={0} fontSize={11} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={34} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="ofertas" fill="var(--color-ofertas)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="postulaciones" fill="var(--color-postulaciones)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          ) : (
            <SinDatos texto="No hubo ofertas ni postulaciones por rubro en este período." />
          )}
        </TarjetaGrafico>
      </div>

      <TarjetaGrafico
        Icono={TableIcon}
        titulo="Actividad día por día"
        descripcion="Solo se listan los días con movimiento, del más reciente al más antiguo."
        insignia={`${analisis.diasConActividad.length} ${analisis.diasConActividad.length === 1 ? "día" : "días"}`}
      >
        {analisis.diasConActividad.length === 0 ? (
          <SinDatos texto="No hubo actividad en este período." />
        ) : (
          <div className="max-h-[380px] overflow-auto rounded-xl border border-border/70 print:max-h-none">
            <Table>
              <TableHeader className="sticky top-0 bg-muted">
                <TableRow>
                  <TableHead className="font-bold text-foreground">Día</TableHead>
                  <TableHead className="text-right font-bold text-foreground">Visitas</TableHead>
                  <TableHead className="text-right font-bold text-foreground">Ofertas nuevas</TableHead>
                  <TableHead className="text-right font-bold text-foreground">Postulaciones</TableHead>
                  <TableHead className="text-right font-bold text-foreground">Presentados</TableHead>
                  <TableHead className="text-right font-bold text-emerald-800">Contratados</TableHead>
                  <TableHead className="text-right font-bold text-rose-800">No consiguieron</TableHead>
                  <TableHead className="text-right font-bold text-violet-800">Cursos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...analisis.diasConActividad].reverse().map((fila) => (
                  <TableRow key={fila.fecha}>
                    <TableCell className="font-medium text-foreground">{fila.etiqueta}</TableCell>
                    <TableCell className="text-right tabular-nums">{fila.visitas || "—"}</TableCell>
                    <TableCell className="text-right tabular-nums">{fila.ofertas || "—"}</TableCell>
                    <TableCell className="text-right tabular-nums">{fila.postulaciones || "—"}</TableCell>
                    <TableCell className="text-right tabular-nums">{fila.presentadas || "—"}</TableCell>
                    <TableCell className="text-right font-semibold text-emerald-800 tabular-nums">{fila.contratados || "—"}</TableCell>
                    <TableCell className="text-right font-semibold text-rose-800 tabular-nums">{fila.noContratados || "—"}</TableCell>
                    <TableCell className="text-right font-semibold text-violet-800 tabular-nums">{fila.cursos || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter className="bg-muted/70 font-bold">
                <TableRow>
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right tabular-nums">{analisis.hayVisitas ? analisis.totalVisitas : "—"}</TableCell>
                  <TableCell className="text-right tabular-nums">{analisis.ofertasNuevas}</TableCell>
                  <TableCell className="text-right tabular-nums">{analisis.recibidas}</TableCell>
                  <TableCell className="text-right tabular-nums">{analisis.presentadas}</TableCell>
                  <TableCell className="text-right text-emerald-900 tabular-nums">{analisis.contratadas}</TableCell>
                  <TableCell className="text-right text-rose-900 tabular-nums">{analisis.totalRechazados}</TableCell>
                  <TableCell className="text-right text-violet-900 tabular-nums">{analisis.cursosAsignados}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        )}
      </TarjetaGrafico>

      <TarjetaGrafico
        Icono={TableIcon}
        titulo="Rendimiento por rubro"
        descripcion="Cuánto se publica, cuánta gente se postula y cuántos consiguen trabajo en cada rubro."
        insignia={`${analisis.porRubro.length} ${analisis.porRubro.length === 1 ? "rubro" : "rubros"}`}
      >
        {analisis.porRubro.length === 0 ? (
          <SinDatos texto="No hubo ofertas ni postulaciones por rubro en este período." />
        ) : (
          <div className="overflow-auto rounded-xl border border-border/70">
            <Table>
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead className="font-bold text-foreground">Rubro</TableHead>
                  <TableHead className="text-right font-bold text-foreground">Ofertas</TableHead>
                  <TableHead className="text-right font-bold text-foreground">Postulaciones</TableHead>
                  <TableHead className="text-right font-bold text-emerald-800">Contratados</TableHead>
                  <TableHead className="text-right font-bold text-foreground">Cada 100 postulaciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analisis.porRubro.map((r) => (
                  <TableRow key={r.rubro}>
                    <TableCell className="font-semibold text-foreground">{r.etiqueta}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.ofertas}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.postulaciones}</TableCell>
                    <TableCell className="text-right font-semibold text-emerald-800 tabular-nums">{r.contratados}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {r.postulaciones > 0 ? `${Math.round((r.contratados / r.postulaciones) * 100)} contratados` : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </TarjetaGrafico>

      <TarjetaGrafico
        Icono={ListChecksIcon}
        titulo="Últimos resultados"
        descripcion="Quién consiguió trabajo, quién no fue elegido y a quién se le asignó un curso."
        insignia={
          analisis.resultados.length > FILAS_RESULTADOS
            ? `${FILAS_RESULTADOS} de ${analisis.resultados.length}`
            : `${analisis.resultados.length}`
        }
      >
        {analisis.resultados.length === 0 ? (
          <SinDatos texto="No hubo resultados en este período." />
        ) : (
          <div className="max-h-[420px] overflow-auto rounded-xl border border-border/70 print:max-h-none">
            <Table>
              <TableHeader className="sticky top-0 bg-muted">
                <TableRow>
                  <TableHead className="font-bold text-foreground">Día</TableHead>
                  <TableHead className="font-bold text-foreground">Persona</TableHead>
                  <TableHead className="font-bold text-foreground">Qué pasó</TableHead>
                  <TableHead className="font-bold text-foreground">Oferta o curso</TableHead>
                  <TableHead className="font-bold text-foreground">Empresa</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analisis.resultados.slice(0, FILAS_RESULTADOS).map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{fechaCorta(r.fecha)}</TableCell>
                    <TableCell className="font-semibold text-foreground">{r.persona}</TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold",
                          r.tono === "exito" && "bg-emerald-500/15 text-emerald-900",
                          r.tono === "peligro" && "bg-rose-500/15 text-rose-900",
                          r.tono === "alerta" && "bg-violet-500/15 text-violet-900",
                          r.tono === "neutro" && "bg-muted text-foreground",
                        )}
                      >
                        {r.queOcurrio}
                      </span>
                    </TableCell>
                    <TableCell className="text-foreground">{r.detalle}</TableCell>
                    <TableCell className="text-muted-foreground">{r.entidad}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </TarjetaGrafico>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

const TONOS_TARJETA = {
  emerald: { caja: "border-emerald-500/25 bg-emerald-50/55", icono: "bg-emerald-500/15 text-emerald-800", texto: "text-emerald-950", suave: "text-emerald-900/75" },
  amber: { caja: "border-amber-500/35 bg-amber-50/70", icono: "bg-amber-500/20 text-amber-900", texto: "text-amber-950", suave: "text-amber-900/80" },
  violet: { caja: "border-violet-500/25 bg-violet-50/60", icono: "bg-violet-500/15 text-violet-800", texto: "text-violet-950", suave: "text-violet-900/75" },
  rose: { caja: "border-rose-500/25 bg-rose-50/60", icono: "bg-rose-500/15 text-rose-800", texto: "text-rose-950", suave: "text-rose-900/75" },
  sky: { caja: "border-sky-500/25 bg-sky-50/60", icono: "bg-sky-500/15 text-sky-800", texto: "text-sky-950", suave: "text-sky-900/75" },
  teal: { caja: "border-teal-500/25 bg-teal-50/60", icono: "bg-teal-500/15 text-teal-800", texto: "text-teal-950", suave: "text-teal-900/75" },
} as const;

type PropsTarjetaCifra = {
  tono: keyof typeof TONOS_TARJETA;
  Icono: typeof ActivityIcon;
  titulo: string;
  valor: string;
  detalle: string;
};

/** One summary figure: title, big number and a one-line explanation, colored by family. */
function TarjetaCifra({ tono, Icono, titulo, valor, detalle }: PropsTarjetaCifra) {
  const c = TONOS_TARJETA[tono];
  return (
    <AnimarElemento>
      <article className={cn("flex h-full flex-col justify-between gap-3 rounded-2xl border p-4 shadow-xs", c.caja)}>
        <div className="flex items-start justify-between gap-2">
          <span className={cn("text-xs font-semibold tracking-wide uppercase", c.texto, "opacity-80")}>{titulo}</span>
          <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", c.icono)}>
            <Icono className="size-4" aria-hidden="true" />
          </span>
        </div>
        <div>
          <p className={cn("font-heading text-3xl font-bold tabular-nums", c.texto)}>{valor}</p>
          <p className={cn("mt-1 text-xs font-medium", c.suave)}>{detalle}</p>
        </div>
      </article>
    </AnimarElemento>
  );
}

type PropsTarjetaGrafico = {
  Icono: typeof ActivityIcon;
  titulo: string;
  descripcion: string;
  insignia?: string;
  children: React.ReactNode;
};

/** Card with an icon, a title and a one-line description, shared by every chart and table of the page. */
function TarjetaGrafico({ Icono, titulo, descripcion, insignia, children }: PropsTarjetaGrafico) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
            <Icono className="size-4.5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-heading text-base font-bold text-foreground">{titulo}</h2>
            <p className="text-xs text-muted-foreground">{descripcion}</p>
          </div>
        </div>
        {insignia && (
          <Badge variant="outline" className="text-xs font-semibold">
            {insignia}
          </Badge>
        )}
      </div>
      {children}
    </section>
  );
}

/** Empty state of a chart or table: says why there is nothing, instead of drawing an empty frame. */
function SinDatos({ texto }: { texto: string }) {
  return (
    <p className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
      {texto}
    </p>
  );
}
