import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { BotonCerrarPanel } from "@/components/admin/panel-lateral";
import { BotonAdmin } from "@/components/admin/boton-admin";
import { EnlaceAccion } from "@/components/admin/enlace-accion";
import { cn } from "@/lib/utils";
import { enlaceLlamada, enlaceWhatsApp, formatearTelefonoAR } from "@/lib/telefonos";

/** Frame of the detail panel: header, tabs and a body with its own scroll (D-042). */
export function PanelDetalle({ children }: { children: ReactNode }) {
  return <div className="flex min-h-0 flex-1 flex-col text-[13px]">{children}</div>;
}

type CabeceraProps = {
  /** Status badge(s) on the left of the first row. */
  badges: ReactNode;
  titulo: ReactNode;
  /** 12 px context line under the title. */
  contexto?: ReactNode;
  /** Where "↗ Abrir página completa" goes; omit it on the full page itself. */
  hrefCompleta?: string;
  acciones?: ReactNode;
  /** Hide the close button (full-page use). */
  sinCierre?: boolean;
};

/** Panel header: badge, links, title, context and the action row. */
export function PanelCabecera({ badges, titulo, contexto, hrefCompleta, acciones, sinCierre }: CabeceraProps) {
  return (
    <div className="flex flex-col gap-2 border-b border-border px-5 pt-3.5 pb-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">{badges}</div>
        <div className="flex items-center gap-2.5 text-muted-foreground">
          {hrefCompleta && (
            <Link
              href={hrefCompleta}
              className="inline-flex items-center gap-0.5 text-[13px] hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
            >
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
              Abrir página completa
            </Link>
          )}
          {!sinCierre && <BotonCerrarPanel />}
        </div>
      </div>
      <h2 className="font-heading text-[20px] leading-tight font-bold tracking-[-0.02em] text-foreground">{titulo}</h2>
      {contexto && <p className="text-[12px] text-muted-foreground">{contexto}</p>}
      {acciones && <div className="flex flex-wrap items-center gap-2">{acciones}</div>}
    </div>
  );
}

export type PestanaPanel = { id: string; etiqueta: string; href: string };

/** Tabs of the panel. They are links, so the active tab lives in the URL (?tab=). */
export function PanelPestanas({ pestanas, activa }: { pestanas: PestanaPanel[]; activa: string }) {
  return (
    <nav aria-label="Secciones del detalle" className="flex gap-5 border-b border-border px-5 text-muted-foreground">
      {pestanas.map((p) => (
        <Link
          key={p.id}
          href={p.href}
          scroll={false}
          aria-current={p.id === activa ? "page" : undefined}
          className={cn(
            "py-2.5 text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-primary",
            p.id === activa && "font-bold text-primary shadow-[inset_0_-3px_0_var(--primary)]",
          )}
        >
          {p.etiqueta}
        </Link>
      ))}
    </nav>
  );
}

/** Scrollable body of the panel. */
export function PanelCuerpo({ children }: { children: ReactNode }) {
  return <div className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto px-5 py-4">{children}</div>;
}

/** Label/value list: every datum has a text label (D-042). */
export function DatosLista({ items }: { items: Array<{ rotulo: string; valor: ReactNode }> }) {
  return (
    <dl className="grid grid-cols-[104px_1fr] gap-x-3 gap-y-2">
      {items.map((item) => (
        <div key={item.rotulo} className="contents">
          <dt className="text-muted-foreground">{item.rotulo}</dt>
          <dd className="min-w-0 font-medium break-words text-foreground">{item.valor}</dd>
        </div>
      ))}
    </dl>
  );
}

type EmpresaProps = {
  razonSocial: string | null;
  cuit: string | null;
  /** What the company does, when it loaded it. */
  descripcion?: string | null;
  contactoNombre: string | null;
  contactoTelefono: string | null;
  contactoEmail: string | null;
};

type TarjetaEmpresaProps = {
  empresa: EmpresaProps | null;
  /** The company's file in the Office (/admin/empresas/<id>), to see its other offers. */
  hrefFicha?: string;
};

/** Company card with the three contact buttons. WhatsApp only shows when the number normalizes (RF1.5). */
export function TarjetaEmpresa({ empresa, hrefFicha }: TarjetaEmpresaProps) {
  if (!empresa) {
    return (
      <section className="flex flex-col gap-2 rounded-[10px] border border-border bg-muted p-3 text-muted-foreground">
        La empresa todavía no cargó sus datos de contacto.
        {hrefFicha && (
          <EnlaceAccion href={hrefFicha} className="self-start">
            Ver ficha de la empresa
          </EnlaceAccion>
        )}
      </section>
    );
  }
  const whatsapp = enlaceWhatsApp(empresa.contactoTelefono);

  return (
    <section className="flex flex-col gap-[5px] rounded-[10px] border border-border bg-muted p-3">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] tracking-wide text-muted-foreground uppercase">Empresa</span>
        {hrefFicha && <EnlaceAccion href={hrefFicha}>Ver ficha</EnlaceAccion>}
      </div>
      <strong className="font-bold text-foreground">{empresa.razonSocial ?? "Sin nombre"}</strong>
      {empresa.cuit && <span className="text-muted-foreground tabular-nums">CUIT {empresa.cuit}</span>}
      {empresa.descripcion && (
        <p className="line-clamp-3 leading-[1.5] whitespace-pre-line text-foreground">{empresa.descripcion}</p>
      )}
      {empresa.contactoNombre && <span>Contacto: {empresa.contactoNombre}</span>}
      <div className="mt-1 flex flex-wrap gap-2">
        {empresa.contactoTelefono && (
          <BotonAdmin render={<a href={enlaceLlamada(empresa.contactoTelefono)} />}>
            Llamar · {formatearTelefonoAR(empresa.contactoTelefono)}
          </BotonAdmin>
        )}
        {whatsapp && (
          <BotonAdmin render={<a href={whatsapp} target="_blank" rel="noopener noreferrer" />}>WhatsApp</BotonAdmin>
        )}
        {empresa.contactoEmail && <BotonAdmin render={<a href={`mailto:${empresa.contactoEmail}`} />}>Email</BotonAdmin>}
      </div>
    </section>
  );
}
