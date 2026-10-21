import { BotonAdmin } from "@/components/admin/boton-admin";
import { Ausente } from "@/components/admin/celdas";
import { EnlaceAccion } from "@/components/admin/enlace-accion";
import {
  DatosLista,
  PanelCabecera,
  PanelCuerpo,
  PanelDetalle,
  PanelPestanas,
} from "@/components/admin/panel-detalle";
import { BadgeEstadoOferta, StatusBadge } from "@/components/admin/status-badge";
import { fechaCorta, fechaLarga } from "@/lib/admin/fechas";
import { perfilEmpresaIncompleto, type FilaEmpresa } from "@/lib/admin/empresas";
import { enlaceLlamada, enlaceWhatsApp, formatearTelefonoAR } from "@/lib/telefonos";
import type { OfertaOficina } from "@/lib/validation/oficina";

type Props = {
  empresa: FilaEmpresa;
  ofertas: OfertaOficina[];
  tab: "resumen" | "ofertas";
  hrefTab: (tab: "resumen" | "ofertas") => string;
  paginaCompleta?: boolean;
};

/** Detail panel of a company (screen 10): contact buttons, details and offer history. */
export function PanelEmpresa({ empresa, ofertas, tab, hrefTab, paginaCompleta }: Props) {
  const razonSocial = empresa.razonSocial?.trim() || "Sin razón social";
  const cuit = empresa.cuit ? `CUIT ${empresa.cuit}` : "CUIT —";
  const whatsapp = enlaceWhatsApp(empresa.contactoTelefono);
  const activas = ofertas.filter((o) => o.estado === "publicada");

  return (
    <PanelDetalle>
      <PanelCabecera
        badges={
          perfilEmpresaIncompleto(empresa) ? (
            <StatusBadge etiqueta="Perfil incompleto" tono="attention" />
          ) : undefined
        }
        titulo={razonSocial}
        contexto={cuit}
        hrefCompleta={paginaCompleta ? undefined : `/admin/empresas/${empresa.id}`}
        sinCierre={paginaCompleta}
        acciones={
          <div className="flex flex-wrap items-center gap-2">
            {empresa.contactoTelefono && (
              <BotonAdmin render={<a href={enlaceLlamada(empresa.contactoTelefono)} />}>
                Llamar · {formatearTelefonoAR(empresa.contactoTelefono)}
              </BotonAdmin>
            )}
            {whatsapp && (
              <BotonAdmin render={<a href={whatsapp} target="_blank" rel="noopener noreferrer" />}>WhatsApp</BotonAdmin>
            )}
            {empresa.contactoEmail && (
              <BotonAdmin render={<a href={`mailto:${empresa.contactoEmail}`} />}>Email</BotonAdmin>
            )}
          </div>
        }
      />
      <PanelPestanas
        activa={tab}
        pestanas={[
          { id: "resumen", etiqueta: "Resumen", href: hrefTab("resumen") },
          { id: "ofertas", etiqueta: `Ofertas ${ofertas.length}`, href: hrefTab("ofertas") },
        ]}
      />
      <PanelCuerpo>
        {tab === "resumen" ? (
          <>
            <DatosLista
              items={[
                {
                  rotulo: "Contacto",
                  valor:
                    empresa.contactoNombre || empresa.contactoTelefono || empresa.contactoEmail ? (
                      <div className="flex flex-col leading-tight">
                        {empresa.contactoNombre && <span className="font-semibold">{empresa.contactoNombre}</span>}
                        {empresa.contactoTelefono && <span>{formatearTelefonoAR(empresa.contactoTelefono)}</span>}
                        {empresa.contactoEmail && (
                          <span className="text-[12px] text-muted-foreground">{empresa.contactoEmail}</span>
                        )}
                      </div>
                    ) : (
                      <Ausente />
                    ),
                },
                {
                  rotulo: "CUIT",
                  valor: empresa.cuit ? <span className="tabular-nums">{empresa.cuit}</span> : <Ausente />,
                },
                {
                  rotulo: "Registrada el",
                  valor: <span className="tabular-nums">{fechaLarga(empresa.creadaEl)}</span>,
                },
              ]}
            />

            <section className="flex flex-col gap-2 rounded-[10px] border border-border bg-muted p-3">
              <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                Ofertas activas ({activas.length})
              </span>
              {activas.length === 0 ? (
                <p className="text-[12px] text-muted-foreground">No tiene ofertas publicadas en este momento.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {activas.map((o) => (
                    <li key={o.id} className="flex items-center justify-between gap-2 text-[12.5px]">
                      <span className="truncate font-medium text-foreground">{o.titulo}</span>
                      <EnlaceAccion href={`/admin/ofertas/${o.id}`}>Ver</EnlaceAccion>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        ) : (
          <ListaOfertasEmpresa ofertas={ofertas} />
        )}
      </PanelCuerpo>
    </PanelDetalle>
  );
}

function ListaOfertasEmpresa({ ofertas }: { ofertas: OfertaOficina[] }) {
  if (ofertas.length === 0) {
    return <p className="text-muted-foreground">Esta empresa todavía no publicó ninguna oferta.</p>;
  }

  return (
    <ul className="flex flex-col divide-y divide-border rounded-[10px] border border-border">
      {ofertas.map((o) => (
        <li key={o.id} className="flex items-center justify-between gap-3 px-3 py-2">
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate font-bold">{o.titulo}</span>
            <small className="text-[11.5px] text-muted-foreground">
              {fechaCorta(o.creadaEl)} · {o.cantidadPostulaciones} postulación{o.cantidadPostulaciones === 1 ? "" : "es"}
            </small>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <BadgeEstadoOferta estado={o.estado} cierreSolicitado={o.cierreSolicitado} />
            <EnlaceAccion href={`/admin/ofertas/${o.id}`}>Ver</EnlaceAccion>
          </div>
        </li>
      ))}
    </ul>
  );
}
