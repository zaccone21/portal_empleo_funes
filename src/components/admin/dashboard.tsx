import Link from "next/link";
import { ArrowUpRight, Building2, Briefcase, Users, FileText } from "lucide-react";

import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { diasDesde } from "@/lib/admin/fechas";
import { cn } from "@/lib/utils";
import type { IndicadoresOficina } from "@/lib/validation/oficina";

export type TareaPendiente = {
  id: string;
  tipo: "oferta_pendiente" | "cierre_solicitado" | "postulacion_nueva" | "por_comunicar" | "sin_respuesta";
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
  /** Null when they could not be counted; the panel still shows the tasks. */
  indicadores: IndicadoresOficina | null;
  tareasPendientes: TareaPendiente[];
  emailOperador?: string;
};

/**
 * Screen 01: Dashboard of the Employment Office. One card per task queue,
 * including the referrals the company has not answered (D-054); the
 * indicators of the brief counted on the real data (D-051), as plain numbers;
 * the oldest tasks first; and shortcuts to the registers.
 */
export function Dashboard({ conteos, indicadores, tareasPendientes, emailOperador }: Props) {
  const tarjetas = [
    {
      titulo: "OFERTAS POR REVISAR",
      cantidad: conteos.ofertasPendientes,
      descripcion: "ofertas esperando revisión",
      href: "/admin/ofertas/por-revisar",
      pendiente: conteos.ofertasPendientes > 0,
    },
    {
      titulo: "POSTULACIONES NUEVAS",
      cantidad: conteos.postulacionesNuevas,
      descripcion: "postulaciones por evaluar",
      href: "/admin/postulaciones/por-evaluar",
      pendiente: conteos.postulacionesNuevas > 0,
    },
    {
      titulo: "CIERRES SOLICITADOS",
      cantidad: conteos.cierresSolicitados,
      descripcion: "solicitudes de empresas",
      href: "/admin/ofertas/cierres-solicitados",
      pendiente: conteos.cierresSolicitados > 0,
    },
    {
      titulo: "POR COMUNICAR / DERIVAR",
      cantidad: conteos.porDerivar,
      descripcion: "postulantes preseleccionados",
      href: "/admin/por-comunicar",
      pendiente: conteos.porDerivar > 0,
    },
    {
      titulo: "SIN RESPUESTA DE LA EMPRESA",
      cantidad: indicadores?.sinRespuesta ?? 0,
      descripcion: "derivados esperando la decisión",
      href: "/admin/postulaciones?estado=derivado",
      pendiente: (indicadores?.sinRespuesta ?? 0) > 0,
    },
  ];

  const cifras = indicadores
    ? [
        { etiqueta: "Postulantes", valor: indicadores.postulantes },
        { etiqueta: "Ofertas activas", valor: indicadores.ofertasActivas },
        { etiqueta: "Postulaciones", valor: indicadores.postulaciones },
        { etiqueta: "Derivaciones a empresas", valor: indicadores.derivaciones },
        { etiqueta: "Contrataciones", valor: indicadores.contrataciones },
        { etiqueta: "Rechazos de empresas", valor: indicadores.rechazos },
        { etiqueta: "Derivaciones a cursos", valor: indicadores.derivacionesCurso },
      ]
    : null;

  return (
    <div className="flex flex-1 flex-col gap-4 min-h-0">
      <PageHeader
        migas={["Resumen", "Dashboard"]}
        titulo="Dashboard"
        aside={emailOperador ? `Operador: ${emailOperador}` : undefined}
      />

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {tarjetas.map((t) => (
          <Link
            key={t.titulo}
            href={t.href}
            className={cn(
              "flex flex-col gap-1 rounded-[10px] border p-4 transition-colors hover:shadow-sm",
              t.pendiente
                ? "border-attention-card-border bg-attention-card text-attention-foreground"
                : "border-border bg-surface text-foreground",
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                {t.titulo}
              </span>
              <ArrowUpRight className="size-4 opacity-50" />
            </div>
            <span className="text-[28px] font-bold tracking-tight tabular-nums leading-none">
              {t.cantidad}
            </span>
            <span className="text-[12px] text-muted-foreground">{t.descripcion}</span>
          </Link>
        ))}
      </div>

      {/* Indicators of the brief (D-051): plain numbers, no charts */}
      <section aria-labelledby="indicadores-titulo" className="flex flex-col gap-2.5 rounded-[10px] border border-border bg-card p-4">
        <h2 id="indicadores-titulo" className="text-[14px] font-bold text-foreground">
          Indicadores
        </h2>
        {cifras ? (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4 lg:grid-cols-7">
            {cifras.map((c) => (
              <div key={c.etiqueta} className="flex flex-col gap-0.5">
                <dt className="text-[12px] text-muted-foreground">{c.etiqueta}</dt>
                <dd className="text-[22px] leading-none font-bold tracking-tight tabular-nums">{c.valor}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="text-[12.5px] text-muted-foreground">No pudimos contar los indicadores. Recargá la página para probar de nuevo.</p>
        )}
      </section>

      {/* Main Grid: Pending Tasks Table + Quick Access */}
      <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-3">
        {/* Left: Urgent tasks */}
        <section className="flex flex-col gap-3 overflow-hidden rounded-[10px] border border-border bg-card p-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border pb-2.5">
            <div>
              <h2 className="text-[14px] font-bold text-foreground">Para resolver hoy</h2>
              <p className="text-[12px] text-muted-foreground">
                Tareas pendientes de la Oficina ordenadas por mayor antigüedad
              </p>
            </div>
            <span className="text-[12px] font-semibold text-muted-foreground tabular-nums">
              {tareasPendientes.length} pendientes
            </span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {tareasPendientes.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center gap-1 text-center text-muted-foreground">
                <p className="font-semibold text-foreground">Todo al día</p>
                <p className="text-[12.5px]">No hay ofertas ni postulaciones pendientes de revisión.</p>
              </div>
            ) : (
              <table className="w-full text-left text-[12.5px] border-collapse">
                <thead>
                  <tr className="border-b border-border text-[10.5px] uppercase tracking-wider text-muted-foreground">
                    <th className="py-2 pr-3 font-semibold">Tipo</th>
                    <th className="py-2 pr-3 font-semibold">Detalle</th>
                    <th className="py-2 pr-3 font-semibold text-right">Espera</th>
                    <th className="py-2 pl-3 font-semibold text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {tareasPendientes.map((item) => {
                    const dias = diasDesde(item.fecha);
                    return (
                      <tr key={item.id + item.tipo} className="hover:bg-row-hover">
                        <td className="py-2.5 pr-3 align-middle">
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
                        </td>
                        <td className="py-2.5 pr-3 align-middle">
                          <div className="flex flex-col leading-tight max-w-[280px]">
                            <span className="truncate font-bold text-foreground">{item.titulo}</span>
                            <span className="truncate text-[11.5px] text-muted-foreground">
                              {item.subtitulo}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 pr-3 text-right align-middle text-[12px] text-muted-foreground tabular-nums">
                          {dias === 0 ? "Hoy" : `${dias} d`}
                        </td>
                        <td className="py-2.5 pl-3 text-right align-middle">
                          <Link
                            href={item.enlace}
                            className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                          >
                            Resolver →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Right: Quick Access & Institutional Info */}
        <section className="flex flex-col gap-3 rounded-[10px] border border-border bg-surface p-4">
          <h2 className="text-[13px] font-bold text-foreground">Accesos de gestión</h2>
          <div className="flex flex-col gap-1.5">
            <Link
              href="/admin/ofertas"
              className="flex items-center justify-between rounded-[8px] border border-border bg-card px-3 py-2 text-[12.5px] font-medium text-foreground transition-colors hover:border-primary/50"
            >
              <div className="flex items-center gap-2">
                <Briefcase className="size-4 text-muted-foreground" />
                <span>Registro de Ofertas</span>
              </div>
              <ArrowUpRight className="size-3.5 text-muted-foreground" />
            </Link>
            <Link
              href="/admin/postulaciones"
              className="flex items-center justify-between rounded-[8px] border border-border bg-card px-3 py-2 text-[12.5px] font-medium text-foreground transition-colors hover:border-primary/50"
            >
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-muted-foreground" />
                <span>Registro de Postulaciones</span>
              </div>
              <ArrowUpRight className="size-3.5 text-muted-foreground" />
            </Link>
            <Link
              href="/admin/postulantes"
              className="flex items-center justify-between rounded-[8px] border border-border bg-card px-3 py-2 text-[12.5px] font-medium text-foreground transition-colors hover:border-primary/50"
            >
              <div className="flex items-center gap-2">
                <Users className="size-4 text-muted-foreground" />
                <span>Padrón de Postulantes</span>
              </div>
              <ArrowUpRight className="size-3.5 text-muted-foreground" />
            </Link>
            <Link
              href="/admin/empresas"
              className="flex items-center justify-between rounded-[8px] border border-border bg-card px-3 py-2 text-[12.5px] font-medium text-foreground transition-colors hover:border-primary/50"
            >
              <div className="flex items-center gap-2">
                <Building2 className="size-4 text-muted-foreground" />
                <span>Directorio de Empresas</span>
              </div>
              <ArrowUpRight className="size-3.5 text-muted-foreground" />
            </Link>
          </div>

          <div className="mt-auto border-t border-border pt-3 text-[11.5px] text-muted-foreground">
            <p className="font-semibold text-foreground">Oficina de Empleo</p>
            <p>Municipalidad de Funes, Santa Fe</p>
            <p className="mt-1">Atención de Lunes a Viernes de 7:00 a 13:00 hs.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
