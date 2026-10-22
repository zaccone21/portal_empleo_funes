import { BotonAdmin } from "@/components/admin/boton-admin";
import { Ausente } from "@/components/admin/celdas";
import { EnlaceAccion } from "@/components/admin/enlace-accion";
import { FichaAdmin, FichaSeccion } from "@/components/admin/ficha";
import { DatosLista } from "@/components/admin/panel-detalle";
import { BadgeEstadoOferta, StatusBadge } from "@/components/admin/status-badge";
import { fechaCorta, fechaLarga } from "@/lib/admin/fechas";
import { perfilEmpresaIncompleto, type FilaEmpresa } from "@/lib/admin/empresas";
import { conDesde } from "@/lib/admin/url";
import { enlaceLlamada, enlaceWhatsApp, formatearTelefonoAR } from "@/lib/telefonos";
import type { OfertaOficina } from "@/lib/validation/oficina";

type Props = {
  empresa: FilaEmpresa;
  /** Every offer of the company, newest first. */
  ofertas: OfertaOficina[];
  volver: string;
  /** This page's own URL, so the offers it links to can come back here. */
  aqui: string;
};

/**
 * Full page of a company (D-062): contact next to the name, every offer with
 * its status in the main column and the company's data on the side.
 */
export function FichaEmpresa({ empresa, ofertas, volver, aqui }: Props) {
  const whatsapp = enlaceWhatsApp(empresa.contactoTelefono);

  return (
    <FichaAdmin
      volver={volver}
      badges={perfilEmpresaIncompleto(empresa) ? <StatusBadge etiqueta="Perfil incompleto" tono="attention" /> : undefined}
      titulo={empresa.razonSocial?.trim() || "Sin razón social"}
      contexto={`${empresa.cuit ? `CUIT ${empresa.cuit}` : "Sin CUIT cargado"} · Registrada el ${fechaLarga(empresa.creadaEl)}`}
      acciones={
        <>
          {empresa.contactoTelefono && (
            <BotonAdmin render={<a href={enlaceLlamada(empresa.contactoTelefono)} />}>
              Llamar · {formatearTelefonoAR(empresa.contactoTelefono)}
            </BotonAdmin>
          )}
          {whatsapp && (
            <BotonAdmin render={<a href={whatsapp} target="_blank" rel="noopener noreferrer" />}>WhatsApp</BotonAdmin>
          )}
          {empresa.contactoEmail && <BotonAdmin render={<a href={`mailto:${empresa.contactoEmail}`} />}>Email</BotonAdmin>}
        </>
      }
      lateral={
        <FichaSeccion titulo="Datos de la empresa">
          <DatosLista
            items={[
              { rotulo: "Contacto", valor: empresa.contactoNombre ?? <Ausente /> },
              {
                rotulo: "Teléfono",
                valor: empresa.contactoTelefono ? formatearTelefonoAR(empresa.contactoTelefono) : <Ausente />,
              },
              { rotulo: "Email", valor: empresa.contactoEmail ?? <Ausente /> },
              { rotulo: "CUIT", valor: empresa.cuit ? <span className="tabular-nums">{empresa.cuit}</span> : <Ausente /> },
              { rotulo: "Ofertas activas", valor: <span className="tabular-nums">{empresa.ofertasActivas}</span> },
            ]}
          />
        </FichaSeccion>
      }
    >
      <FichaSeccion titulo={`Ofertas (${ofertas.length})`}>
        {ofertas.length === 0 ? (
          <p className="text-muted-foreground">Esta empresa todavía no envió ninguna oferta.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border rounded-[10px] border border-border">
            {ofertas.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 px-3 py-3">
                <div className="flex min-w-0 flex-col leading-tight">
                  <span className="font-bold">{o.titulo}</span>
                  <small className="text-[12.5px] text-muted-foreground tabular-nums">
                    Enviada el {fechaCorta(o.creadaEl)} · {o.cantidadPostulaciones}{" "}
                    {o.cantidadPostulaciones === 1 ? "postulación" : "postulaciones"}
                  </small>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <BadgeEstadoOferta estado={o.estado} cierreSolicitado={o.cierreSolicitado} />
                  <EnlaceAccion href={conDesde(`/admin/ofertas/${o.id}`, aqui)}>Ver</EnlaceAccion>
                </div>
              </li>
            ))}
          </ul>
        )}
      </FichaSeccion>
    </FichaAdmin>
  );
}
