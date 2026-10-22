import type { ReactNode } from "react";

import { BotonAdmin } from "@/components/admin/boton-admin";
import { EnlaceAccion } from "@/components/admin/enlace-accion";
import { enlaceLlamada, enlaceWhatsApp, formatearTelefonoAR } from "@/lib/telefonos";

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
