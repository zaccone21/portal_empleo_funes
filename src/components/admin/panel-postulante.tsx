import Link from "next/link";

import { BotonAdmin } from "@/components/admin/boton-admin";
import { Ausente, nombreCompleto } from "@/components/admin/celdas";
import {
  DatosLista,
  PanelCabecera,
  PanelCuerpo,
  PanelDetalle,
  PanelPestanas,
} from "@/components/admin/panel-detalle";
import { BadgeCv } from "@/components/admin/tabla-postulantes";
import { BadgePostulacion, StatusBadge } from "@/components/admin/status-badge";
import { IconoRubro } from "@/components/ofertas/IconoRubro";
import { fechaCorta, fechaLarga } from "@/lib/admin/fechas";
import { perfilIncompleto, tieneCv, type FilaPostulante } from "@/lib/admin/postulantes";
import { enlaceLlamada, enlaceWhatsApp, formatearTelefonoAR } from "@/lib/telefonos";
import type { PostulacionAdmin } from "@/lib/validation/oficina";
import { NOMBRE_RUBRO, type Rubro } from "@/lib/validation/rubros";

type Props = {
  postulante: FilaPostulante;
  postulaciones: PostulacionAdmin[];
  tab: "resumen" | "postulaciones";
  hrefTab: (tab: "resumen" | "postulaciones") => string;
  paginaCompleta?: boolean;
};

/**
 * Detail panel of an applicant (screen 09, D-037): contact buttons, trades,
 * CV viewer links and application history.
 */
export function PanelPostulante({ postulante, postulaciones, tab, hrefTab, paginaCompleta }: Props) {
  const nombre = nombreCompleto(postulante) ?? "Sin nombre cargado";
  const dni = postulante.dni ? `DNI ${postulante.dni}` : "DNI —";
  const whatsapp = enlaceWhatsApp(postulante.telefono);
  const cvCargado = tieneCv(postulante);

  return (
    <PanelDetalle>
      <PanelCabecera
        badges={
          <>
            <BadgeCv cargado={cvCargado} />
            {perfilIncompleto(postulante) && <StatusBadge etiqueta="Perfil incompleto" tono="attention" />}
          </>
        }
        titulo={nombre}
        contexto={dni}
        hrefCompleta={paginaCompleta ? undefined : `/admin/postulantes/${postulante.id}`}
        sinCierre={paginaCompleta}
        acciones={
          <div className="flex flex-wrap items-center gap-2">
            {postulante.telefono && (
              <BotonAdmin render={<a href={enlaceLlamada(postulante.telefono)} />}>
                Llamar · {formatearTelefonoAR(postulante.telefono)}
              </BotonAdmin>
            )}
            {whatsapp && (
              <BotonAdmin render={<a href={whatsapp} target="_blank" rel="noopener noreferrer" />}>WhatsApp</BotonAdmin>
            )}
            {postulante.email && <BotonAdmin render={<a href={`mailto:${postulante.email}`} />}>Email</BotonAdmin>}
          </div>
        }
      />
      <PanelPestanas
        activa={tab}
        pestanas={[
          { id: "resumen", etiqueta: "Resumen", href: hrefTab("resumen") },
          { id: "postulaciones", etiqueta: `Postulaciones ${postulaciones.length}`, href: hrefTab("postulaciones") },
        ]}
      />
      <PanelCuerpo>
        {tab === "resumen" ? (
          <>
            <DatosLista
              items={[
                {
                  rotulo: "Contacto",
                  valor: (
                    <div className="flex flex-col leading-tight">
                      <span>{formatearTelefonoAR(postulante.telefono)}</span>
                      <span className="text-[12px] text-muted-foreground">{postulante.email ?? "Sin email"}</span>
                    </div>
                  ),
                },
                {
                  rotulo: "Rubros",
                  valor:
                    postulante.rubros.length > 0 ? (
                      <ul className="flex flex-col gap-1">
                        {postulante.rubros.map((r) => (
                          <li key={r} className="flex items-center gap-1.5">
                            <IconoRubro rubro={r as Rubro} className="size-4 shrink-0" />
                            {NOMBRE_RUBRO[r as Rubro] ?? r}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <Ausente />
                    ),
                },
                {
                  rotulo: "CV",
                  valor: postulante.cvSubidoEl ? `Subido el ${fechaLarga(postulante.cvSubidoEl)}` : <Ausente />,
                },
              ]}
            />

            {cvCargado && (
              <div className="flex items-center gap-2">
                <BotonAdmin
                  variante="primario"
                  render={<a href={`/api/admin/postulantes/${postulante.id}/cv`} target="_blank" rel="noopener noreferrer" />}
                >
                  Ver CV
                </BotonAdmin>
                <BotonAdmin render={<a href={`/api/admin/postulantes/${postulante.id}/cv?descargar=1`} />}>
                  Descargar
                </BotonAdmin>
              </div>
            )}

            <section className="flex flex-col gap-2 rounded-[10px] border border-border bg-muted p-3">
              <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">Postulaciones</span>
              {postulaciones.length === 0 ? (
                <p className="text-[12px] text-muted-foreground">Todavía no tiene postulaciones.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {postulaciones.map((p) => (
                    <li key={p.id} className="flex items-center justify-between gap-2 text-[12.5px]">
                      <span className="truncate font-medium text-foreground">
                        {p.oferta.titulo} · <span className="text-muted-foreground">{p.oferta.empresa?.razonSocial ?? "Empresa"}</span>
                      </span>
                      <BadgePostulacion estado={p.estado} />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        ) : (
          <ListaPostulacionesPostulante postulaciones={postulaciones} />
        )}
      </PanelCuerpo>
    </PanelDetalle>
  );
}

function ListaPostulacionesPostulante({ postulaciones }: { postulaciones: PostulacionAdmin[] }) {
  if (postulaciones.length === 0) {
    return <p className="text-muted-foreground">Todavía no tiene postulaciones registradas.</p>;
  }
  return (
    <ul className="flex flex-col divide-y divide-border rounded-[10px] border border-border">
      {postulaciones.map((p) => (
        <li key={p.id} className="flex items-center justify-between gap-3 px-3 py-2">
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate font-bold">{p.oferta.titulo}</span>
            <small className="text-[11.5px] text-muted-foreground">
              {p.oferta.empresa?.razonSocial ?? "Sin empresa"} · {fechaCorta(p.postuladoEl)}
            </small>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <BadgePostulacion estado={p.estado} />
            <Link href={`/admin/postulaciones/${p.id}`} className="font-semibold text-primary hover:underline">
              Ver
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}
