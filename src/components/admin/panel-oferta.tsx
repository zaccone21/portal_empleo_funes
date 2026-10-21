import { AccionesOferta } from "@/components/admin/acciones-oferta";
import { Ausente, nombreCompleto } from "@/components/admin/celdas";
import { EnlaceAccion } from "@/components/admin/enlace-accion";
import {
  DatosLista,
  PanelCabecera,
  PanelCuerpo,
  PanelDetalle,
  PanelPestanas,
  TarjetaEmpresa,
} from "@/components/admin/panel-detalle";
import { BadgeOferta, BadgePostulacion, StatusBadge } from "@/components/admin/status-badge";
import { IconoRubro } from "@/components/ofertas/IconoRubro";
import { fechaCorta, fechaLarga } from "@/lib/admin/fechas";
import type { OfertaOficina, PostulacionAdmin } from "@/lib/validation/oficina";
import { NOMBRE_RUBRO } from "@/lib/validation/rubros";

type Props = {
  oferta: OfertaOficina;
  /** Applications to this offer; only loaded when the "Postulaciones" tab is open. */
  postulaciones?: PostulacionAdmin[];
  tab: "resumen" | "postulaciones";
  hrefTab: (tab: "resumen" | "postulaciones") => string;
  /** Next row to select after a decision (queues only). */
  siguienteId?: string;
  avanzar?: boolean;
  /** Show the "the company asked to close" notice (queue 04). */
  conAvisoCierre?: boolean;
  /** Full-page use: no close button and no "open full page" link. */
  paginaCompleta?: boolean;
};

/**
 * Detail of an offer for the Office (RF1.5.2-RF1.5.6; D-042): status, actions
 * by status, "Resumen" and "Postulaciones" tabs, and the company card with its
 * contact buttons. Used in the side panel and on the full page.
 */
export function PanelOferta({
  oferta,
  postulaciones,
  tab,
  hrefTab,
  siguienteId,
  avanzar,
  conAvisoCierre,
  paginaCompleta,
}: Props) {
  const contexto = [
    oferta.empresa?.razonSocial,
    `Enviada el ${fechaLarga(oferta.creadaEl)}`,
    oferta.publicadaEl ? `Publicada el ${fechaLarga(oferta.publicadaEl)}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <PanelDetalle>
      <PanelCabecera
        badges={
          <>
            <BadgeOferta estado={oferta.estado} />
            {oferta.cierreSolicitado && <StatusBadge etiqueta="Cierre solicitado" tono="attention" />}
          </>
        }
        titulo={oferta.titulo}
        contexto={contexto}
        hrefCompleta={paginaCompleta ? undefined : `/admin/ofertas/${oferta.id}`}
        sinCierre={paginaCompleta}
        acciones={
          <AccionesOferta
            id={oferta.id}
            estado={oferta.estado}
            cierreSolicitado={oferta.cierreSolicitado}
            siguienteId={siguienteId}
            avanzar={avanzar}
          />
        }
      />
      <PanelPestanas
        activa={tab}
        pestanas={[
          { id: "resumen", etiqueta: "Resumen", href: hrefTab("resumen") },
          { id: "postulaciones", etiqueta: `Postulaciones ${oferta.cantidadPostulaciones}`, href: hrefTab("postulaciones") },
        ]}
      />
      <PanelCuerpo>
        {tab === "resumen" ? (
          <>
            {conAvisoCierre && oferta.cierreSolicitado && (
              <div className="rounded-[10px] border border-attention-card-border bg-attention-card p-3 text-[13px] text-foreground">
                <strong className="font-bold">La empresa pidió cerrar esta oferta.</strong> Si ya no hay que seguir buscando, cerrala:
                deja de verse en el portal.
              </div>
            )}
            <DatosLista
              items={[
                {
                  rotulo: "Rubro",
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
                { rotulo: "Ubicación", valor: oferta.lugar },
                { rotulo: "Horario", valor: oferta.jornada },
                { rotulo: "Remuneración", valor: oferta.sueldo ?? <Ausente /> },
                ...(oferta.estado === "rechazada" && oferta.motivoRechazo
                  ? [{ rotulo: "Motivo del rechazo", valor: oferta.motivoRechazo }]
                  : []),
              ]}
            />
            <section>
              <h3 className="text-[14px] font-bold">Descripción del puesto</h3>
              <p className="mt-1 leading-[1.55] whitespace-pre-line">{oferta.descripcion}</p>
            </section>
            <section>
              <h3 className="text-[14px] font-bold">Requisitos</h3>
              <p className="mt-1 leading-[1.55] whitespace-pre-line">{oferta.requisitos}</p>
            </section>
            <TarjetaEmpresa empresa={oferta.empresa} hrefFicha={`/admin/empresas/${oferta.empresaId}`} />
          </>
        ) : (
          <ListaPostulaciones postulaciones={postulaciones ?? []} />
        )}
      </PanelCuerpo>
    </PanelDetalle>
  );
}

function ListaPostulaciones({ postulaciones }: { postulaciones: PostulacionAdmin[] }) {
  if (postulaciones.length === 0) {
    return <p className="text-muted-foreground">Todavía nadie se postuló a esta oferta.</p>;
  }
  return (
    <ul className="flex flex-col divide-y divide-border rounded-[10px] border border-border">
      {postulaciones.map((p) => (
        <li key={p.id} className="flex items-center justify-between gap-3 px-3 py-2">
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate font-bold">{nombreCompleto(p.postulante) ?? "Sin nombre cargado"}</span>
            <small className="text-[11.5px] text-muted-foreground tabular-nums">
              {p.postulante.dni ? `DNI ${p.postulante.dni} · ` : ""}postulada el {fechaCorta(p.postuladoEl)}
            </small>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <BadgePostulacion estado={p.estado} />
            <EnlaceAccion href={`/admin/postulaciones/${p.id}`}>Ver</EnlaceAccion>
          </div>
        </li>
      ))}
    </ul>
  );
}
