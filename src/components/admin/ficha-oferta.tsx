import { AccionesOferta } from "@/components/admin/acciones-oferta";
import { Ausente, nombreCompleto } from "@/components/admin/celdas";
import { EnlaceAccion } from "@/components/admin/enlace-accion";
import { FichaAdmin, FichaSeccion } from "@/components/admin/ficha";
import { DatosLista, TarjetaEmpresa } from "@/components/admin/panel-detalle";
import { BadgeOferta, BadgePostulacion, StatusBadge } from "@/components/admin/status-badge";
import { IconoRubro } from "@/components/ofertas/IconoRubro";
import { fechaCorta, fechaLarga } from "@/lib/admin/fechas";
import { conDesde } from "@/lib/admin/url";
import type { OfertaOficina, PostulacionAdmin } from "@/lib/validation/oficina";
import { NOMBRE_RUBRO } from "@/lib/validation/rubros";

type Props = {
  oferta: OfertaOficina;
  /** Every application to this offer. */
  postulaciones: PostulacionAdmin[];
  volver: string;
  /** This page's own URL, so the pages it links to can come back here. */
  aqui: string;
  /** In a queue: the next offer to decide on, or the queue itself when none is left. */
  destinoTrasDecidir?: string;
};

/**
 * Full page of an offer for the Office (RF1.5.2-RF1.5.6; D-062): status and the
 * decisions next to the title; data, description, requirements and the
 * applications in the main column; the company with its contact on the side.
 */
export function FichaOferta({ oferta, postulaciones, volver, aqui, destinoTrasDecidir }: Props) {
  const contexto = [
    oferta.empresa?.razonSocial,
    `Enviada el ${fechaLarga(oferta.creadaEl)}`,
    oferta.publicadaEl ? `Publicada el ${fechaLarga(oferta.publicadaEl)}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  const derivadas = postulaciones.filter((p) => p.estado === "derivado").length;
  const contratadas = postulaciones.filter((p) => p.decisionEmpresa === "contratado").length;

  return (
    <FichaAdmin
      volver={volver}
      badges={
        <>
          <BadgeOferta estado={oferta.estado} />
          {oferta.cierreSolicitado && <StatusBadge etiqueta="Cierre solicitado" tono="attention" />}
        </>
      }
      titulo={oferta.titulo}
      contexto={contexto}
      acciones={
        <AccionesOferta
          id={oferta.id}
          estado={oferta.estado}
          cierreSolicitado={oferta.cierreSolicitado}
          destino={destinoTrasDecidir}
        />
      }
      lateral={
        <>
          <TarjetaEmpresa empresa={oferta.empresa} hrefFicha={conDesde(`/admin/empresas/${oferta.empresaId}`, aqui)} />
          <FichaSeccion titulo="Cómo viene">
            <dl className="grid grid-cols-3 gap-3">
              {[
                { etiqueta: "Postulaciones", valor: postulaciones.length },
                { etiqueta: "Derivadas", valor: derivadas },
                { etiqueta: "Contratadas", valor: contratadas },
              ].map((c) => (
                <div key={c.etiqueta} className="flex flex-col">
                  <dt className="text-[12.5px] text-muted-foreground">{c.etiqueta}</dt>
                  <dd className="font-heading text-[22px] leading-tight font-semibold tabular-nums">{c.valor}</dd>
                </div>
              ))}
            </dl>
          </FichaSeccion>
        </>
      }
    >
      {oferta.cierreSolicitado && oferta.estado === "publicada" && (
        <div className="rounded-[10px] border border-attention-card-border bg-attention-card p-4 text-foreground">
          <strong className="font-bold">La empresa pidió cerrar esta oferta.</strong> Si ya no hay que seguir buscando,
          cerrala: deja de verse en el portal.
        </div>
      )}

      <FichaSeccion titulo="Datos de la oferta">
        <DatosLista
          items={[
            {
              rotulo: oferta.rubros.length > 1 ? "Rubros" : "Rubro",
              valor:
                oferta.rubros.length > 0 ? (
                  <ul className="flex flex-col gap-1">
                    {oferta.rubros.map((r) => (
                      <li key={r} className="flex items-center gap-1.5">
                        <IconoRubro rubro={r} className="size-4 shrink-0" />
                        {NOMBRE_RUBRO[r]}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Ausente />
                ),
            },
            { rotulo: "Dirección del trabajo", valor: oferta.lugar },
            { rotulo: "Horario", valor: oferta.jornada },
            { rotulo: "Remuneración", valor: oferta.sueldo ?? <Ausente /> },
            ...(oferta.estado === "rechazada" && oferta.motivoRechazo
              ? [{ rotulo: "Motivo del rechazo", valor: oferta.motivoRechazo }]
              : []),
          ]}
        />
      </FichaSeccion>

      <FichaSeccion titulo="Descripción del puesto">
        <p className="leading-[1.6] whitespace-pre-line">{oferta.descripcion}</p>
      </FichaSeccion>

      <FichaSeccion titulo="Requisitos">
        <p className="leading-[1.6] whitespace-pre-line">{oferta.requisitos}</p>
      </FichaSeccion>

      <FichaSeccion titulo={`Postulaciones (${postulaciones.length})`}>
        <ListaPostulaciones postulaciones={postulaciones} aqui={aqui} />
      </FichaSeccion>
    </FichaAdmin>
  );
}

function ListaPostulaciones({ postulaciones, aqui }: { postulaciones: PostulacionAdmin[]; aqui: string }) {
  if (postulaciones.length === 0) {
    return <p className="text-muted-foreground">Todavía nadie se postuló a esta oferta.</p>;
  }
  return (
    <ul className="flex flex-col divide-y divide-border rounded-[10px] border border-border">
      {postulaciones.map((p) => (
        <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-3 py-3">
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="font-bold">{nombreCompleto(p.postulante) ?? "Sin nombre cargado"}</span>
            <small className="text-[12.5px] text-muted-foreground tabular-nums">
              {p.postulante.dni ? `DNI ${p.postulante.dni} · ` : ""}postulada el {fechaCorta(p.postuladoEl)}
            </small>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <BadgePostulacion estado={p.estado} />
            <EnlaceAccion href={conDesde(`/admin/postulaciones/${p.id}`, aqui)}>Ver</EnlaceAccion>
          </div>
        </li>
      ))}
    </ul>
  );
}
