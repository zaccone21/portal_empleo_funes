import Link from "next/link";
import {
  ArrowUpRight,
  Briefcase,
  CheckCircle2,
  CircleAlert,
  ClipboardCheck,
  ClipboardList,
  Clock,
  FileText,
  GraduationCap,
  Send,
  Users,
  UserX,
  type LucideIcon,
} from "lucide-react";

import { EnlaceAccion } from "@/components/admin/enlace-accion";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { AnimarElemento, AnimarEntrada, AnimarGrupo } from "@/components/marca/animaciones";
import { fechaCorta, haceCuanto } from "@/lib/admin/fechas";
import { cn } from "@/lib/utils";
import type { IndicadoresOficina } from "@/lib/validation/oficina";

export type TareaPendiente = {
  id: string;
  tipo:
    | "oferta_pendiente"
    | "cierre_solicitado"
    | "postulacion_nueva"
    | "por_comunicar"
    | "sin_respuesta"
    | "tres_rechazos";
  titulo: string;
  subtitulo: string;
  fecha: string;
  enlace: string;
};

type Props = {
  conteos: {
    ofertasPendientes: number;
    postulacionesNuevas: number;
    cierresSolicitados: number;
    porDerivar: number;
  };
  postulantesTresRechazos?: number;
  /** Null when they could not be counted; the panel still shows the tasks. */
  indicadores: IndicadoresOficina | null;
  tareasPendientes: TareaPendiente[];
  emailOperador?: string;
};

type FamiliaColor = "ambar" | "esmeralda" | "capacitacion";

/**
 * Screen 01: Dashboard of the Employment Office.
 * - Distinct visual hierarchy for section titles vs. inner content.
 * - Queue cards differentiated by semantic color family and icon.
 * - Redesigned KPI Indicator cards with individual icons and link to `/admin/metricas`.
 * - Full-width "Acciones y tareas más recientes" table (without "Accesos de gestión").
 */
export function Dashboard({
  conteos,
  postulantesTresRechazos = 0,
  indicadores,
  tareasPendientes,
  emailOperador,
}: Props) {
  const tarjetas: {
    titulo: string;
    cantidad: number;
    descripcion: string;
    href: string;
    pendiente: boolean;
    icono: LucideIcon;
    familia: FamiliaColor;
  }[] = [
    {
      titulo: "Ofertas por revisar",
      cantidad: conteos.ofertasPendientes,
      descripcion: "Ofertas esperando aprobación",
      href: "/admin/ofertas/por-revisar",
      pendiente: conteos.ofertasPendientes > 0,
      icono: ClipboardCheck,
      familia: "ambar",
    },
    {
      titulo: "Postulaciones nuevas",
      cantidad: conteos.postulacionesNuevas,
      descripcion: "Candidatos por evaluar",
      href: "/admin/postulaciones/por-evaluar",
      pendiente: conteos.postulacionesNuevas > 0,
      icono: ClipboardList,
      familia: "ambar",
    },
    {
      titulo: "Cierres solicitados",
      cantidad: conteos.cierresSolicitados,
      descripcion: "Pedidos de cierre de empresas",
      href: "/admin/ofertas/cierres-solicitados",
      pendiente: conteos.cierresSolicitados > 0,
      icono: CircleAlert,
      familia: "ambar",
    },
    {
      titulo: "Por comunicar / derivar",
      cantidad: conteos.porDerivar,
      descripcion: "Preseleccionados para enviar",
      href: "/admin/por-comunicar",
      pendiente: conteos.porDerivar > 0,
      icono: Send,
      familia: "esmeralda",
    },
    {
      titulo: "Sin respuesta de empresa",
      cantidad: indicadores?.sinRespuesta ?? 0,
      descripcion: "Derivados esperando decisión",
      href: "/admin/postulaciones?estado=derivado",
      pendiente: (indicadores?.sinRespuesta ?? 0) > 0,
      icono: Clock,
      familia: "esmeralda",
    },
    {
      titulo: "Con 3+ rechazos",
      cantidad: postulantesTresRechazos,
      descripcion: "Para ofrecer capacitación",
      href: "/admin/cursos",
      pendiente: postulantesTresRechazos > 0,
      icono: GraduationCap,
      familia: "capacitacion",
    },
  ];

  const cifras: {
    etiqueta: string;
    valor: number;
    icono: LucideIcon;
    tono: string;
    borde: string;
  }[] | null = indicadores
    ? [
        {
          etiqueta: "Postulantes registrados",
          valor: indicadores.postulantes,
          icono: Users,
          tono: "bg-secondary text-primary",
          borde: "border-t-primary",
        },
        {
          etiqueta: "Ofertas activas",
          valor: indicadores.ofertasActivas,
          icono: Briefcase,
          tono: "bg-secondary text-primary",
          borde: "border-t-primary",
        },
        {
          etiqueta: "Postulaciones totales",
          valor: indicadores.postulaciones,
          icono: FileText,
          tono: "bg-muted text-foreground",
          borde: "border-t-foreground/40",
        },
        {
          etiqueta: "Derivados a empresas",
          valor: indicadores.derivaciones,
          icono: Send,
          tono: "bg-secondary text-primary",
          borde: "border-t-primary",
        },
        {
          etiqueta: "Personas contratadas",
          valor: indicadores.contrataciones,
          icono: CheckCircle2,
          tono: "bg-brand-mint/70 text-brand-deep",
          borde: "border-t-brand-leaf",
        },
        {
          etiqueta: "No contratados",
          valor: indicadores.rechazos,
          icono: UserX,
          tono: "bg-attention-card text-attention-foreground",
          borde: "border-t-amber-500",
        },
        {
          etiqueta: "Derivaciones a cursos",
          valor: indicadores.derivacionesCurso,
          icono: GraduationCap,
          tono: "bg-secondary text-primary",
          borde: "border-t-brand-deep",
        },
      ]
    : null;

  return (
    <AnimarEntrada className="flex w-full flex-col gap-6 pb-8">
      <PageHeader
        migas={["Resumen", "Dashboard"]}
        titulo="Mesa de Trabajo · Oficina de Empleo"
        descripcion="Estado general de las colas operativas, indicadores clave del portal y actividad más reciente."
        aside={emailOperador ? `Operador: ${emailOperador}` : undefined}
      />

      {/* Sección 1: Colas de atención operativa con colores e íconos diferenciados */}
      <section aria-labelledby="colas-atencion-titulo" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 id="colas-atencion-titulo" className="font-heading text-lg font-bold tracking-tight text-foreground">
              Colas de atención operativa
            </h2>
            <p className="text-xs text-muted-foreground">
              Diferenciadas por tipo: revisión entrante (ámbar), derivación a empresas (esmeralda) y capacitación (institucional).
            </p>
          </div>
        </div>

        <AnimarGrupo className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {tarjetas.map((t) => {
            const Icono = t.icono;
            const estilosFamilia =
              t.familia === "ambar"
                ? t.pendiente
                  ? "border-amber-500/45 bg-attention-card text-foreground shadow-2xs"
                  : "border-border bg-card text-foreground"
                : t.familia === "esmeralda"
                  ? t.pendiente
                    ? "border-primary/40 bg-secondary/65 text-foreground shadow-2xs"
                    : "border-border bg-card text-foreground"
                  : t.pendiente
                    ? "border-brand-deep/35 bg-brand-mint/35 text-foreground shadow-2xs"
                    : "border-border bg-card text-foreground";

            const estilosIcono =
              t.familia === "ambar"
                ? t.pendiente
                  ? "bg-amber-500/20 text-amber-900"
                  : "bg-muted text-muted-foreground"
                : t.familia === "esmeralda"
                  ? t.pendiente
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                  : t.pendiente
                    ? "bg-brand-deep text-brand-mint"
                    : "bg-muted text-muted-foreground";

            return (
              <AnimarElemento key={t.titulo} elevarAlPasar>
                <Link
                  href={t.href}
                  className={cn(
                    "group flex h-full flex-col justify-between gap-3 rounded-xl border p-4 transition-all hover:shadow-md",
                    estilosFamilia,
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-105",
                        estilosIcono,
                      )}
                    >
                      <Icono className="size-4.5" />
                    </span>
                    <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="font-heading text-3xl leading-none font-bold tracking-tight tabular-nums">
                      {t.cantidad}
                    </span>
                    <span className="mt-1 font-heading text-[13px] leading-snug font-bold text-foreground">
                      {t.titulo}
                    </span>
                    <span className="text-[11.5px] text-muted-foreground">{t.descripcion}</span>
                  </div>
                </Link>
              </AnimarElemento>
            );
          })}
        </AnimarGrupo>
      </section>

      {/* Sección 2: Indicadores clave del portal rediseñados */}
      <section
        aria-labelledby="indicadores-titulo"
        className="flex flex-col gap-3.5 rounded-xl border border-border bg-card p-5 shadow-2xs"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
          <div>
            <h2 id="indicadores-titulo" className="font-heading text-lg font-bold tracking-tight text-foreground">
              Indicadores generales acumulados
            </h2>
            <p className="text-xs text-muted-foreground">
              Totales históricos de actividad e impacto laboral en la ciudad de Funes.
            </p>
          </div>
        </div>

        {cifras ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
            {cifras.map((c) => {
              const Icono = c.icono;
              return (
                <div
                  key={c.etiqueta}
                  className={cn(
                    "flex flex-col justify-between gap-2.5 rounded-lg border border-border border-t-4 bg-surface/60 p-3.5",
                    c.borde,
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11.5px] font-semibold leading-tight text-muted-foreground">
                      {c.etiqueta}
                    </span>
                    <span
                      aria-hidden="true"
                      className={cn("flex size-7 shrink-0 items-center justify-center rounded-md", c.tono)}
                    >
                      <Icono className="size-3.5" />
                    </span>
                  </div>
                  <span className="font-heading text-2xl leading-none font-bold tracking-tight text-foreground tabular-nums">
                    {c.valor}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-[12.5px] text-muted-foreground">
            No pudimos contar los indicadores. Recargá la página para probar de nuevo.
          </p>
        )}
      </section>

      {/* Sección 3: Acciones y tareas más recientes (100% Full-Width, sin Accesos de Gestión) */}
      <section
        aria-labelledby="acciones-recientes-titulo"
        className="flex w-full flex-col gap-3.5 rounded-xl border border-border bg-card p-5 shadow-2xs"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
          <div>
            <h2 id="acciones-recientes-titulo" className="font-heading text-lg font-bold tracking-tight text-foreground">
              Acciones y tareas más recientes
            </h2>
            <p className="text-xs text-muted-foreground">
              Ordenadas cronológicamente de la más reciente a la más antigua para resolver primero lo último que ingresó.
            </p>
          </div>
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-primary tabular-nums">
            {tareasPendientes.length} pendientes
          </span>
        </div>

        <div className="w-full overflow-x-auto">
          {tareasPendientes.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center gap-1 text-center text-muted-foreground">
              <p className="font-heading text-base font-bold text-foreground">Todo al día</p>
              <p className="text-[13px]">No hay ofertas ni postulaciones pendientes de revisión.</p>
            </div>
          ) : (
            <table className="w-full border-collapse text-left text-[13px]">
              <thead>
                <tr className="border-b border-border text-[11px] tracking-wider text-muted-foreground uppercase">
                  <th className="py-2.5 pr-4 font-bold">Tipo de tarea</th>
                  <th className="py-2.5 pr-4 font-bold">Detalle principal</th>
                  <th className="py-2.5 pr-4 font-bold">Contexto / Empresa o Rubro</th>
                  <th className="py-2.5 pr-4 text-right font-bold">Último movimiento</th>
                  <th className="py-2.5 pl-4 text-right font-bold">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tareasPendientes.map((item) => (
                  <tr key={item.id + item.tipo} className="transition-colors hover:bg-row-hover">
                    <td className="py-3 pr-4 align-middle whitespace-nowrap">
                      {item.tipo === "oferta_pendiente" && (
                        <StatusBadge etiqueta="Oferta nueva" tono="attention" />
                      )}
                      {item.tipo === "cierre_solicitado" && (
                        <StatusBadge etiqueta="Cierre solicitado" tono="danger" />
                      )}
                      {item.tipo === "postulacion_nueva" && (
                        <StatusBadge etiqueta="Postulación" tono="attention" />
                      )}
                      {item.tipo === "por_comunicar" && (
                        <StatusBadge etiqueta="Por derivar" tono="success" />
                      )}
                      {item.tipo === "sin_respuesta" && (
                        <StatusBadge etiqueta="Sin respuesta" tono="attention" />
                      )}
                      {item.tipo === "tres_rechazos" && (
                        <StatusBadge etiqueta="3+ rechazos" tono="attention" />
                      )}
                    </td>
                    <td className="py-3 pr-4 align-middle">
                      <span className="font-heading text-[13.5px] font-bold text-foreground">
                        {item.titulo}
                      </span>
                    </td>
                    <td className="py-3 pr-4 align-middle text-[12.5px] text-muted-foreground">
                      {item.subtitulo}
                    </td>
                    <td className="py-3 pr-4 text-right align-middle text-[12px] text-muted-foreground tabular-nums whitespace-nowrap">
                      <div className="flex flex-col items-end leading-tight">
                        <span className="font-semibold text-foreground">{haceCuanto(item.fecha)}</span>
                        <span className="text-[11px] text-muted-foreground">{fechaCorta(item.fecha)}</span>
                      </div>
                    </td>
                    <td className="py-3 pl-4 text-right align-middle whitespace-nowrap">
                      <EnlaceAccion href={item.enlace} variante="primario">
                        Resolver
                      </EnlaceAccion>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </AnimarEntrada>
  );
}
