import Link from "next/link";

import { AsociarOferta } from "@/components/admin/asociar-oferta";
import { BotonAdmin } from "@/components/admin/boton-admin";
import { Ausente, nombreCompleto } from "@/components/admin/celdas";
import { FormularioDerivacionCurso } from "@/components/admin/formulario-derivacion-curso";
import {
  DatosLista,
  PanelCabecera,
  PanelCuerpo,
  PanelDetalle,
  PanelPestanas,
} from "@/components/admin/panel-detalle";
import { ResultadoEmpresa } from "@/components/admin/resultado-empresa";
import { BadgeCv } from "@/components/admin/tabla-postulantes";
import { BadgePostulacion, StatusBadge } from "@/components/admin/status-badge";
import { IconoRubro } from "@/components/ofertas/IconoRubro";
import { fechaCorta, fechaDia, fechaHora, fechaLarga } from "@/lib/admin/fechas";
import { perfilIncompleto, tieneCv, type FilaPostulante, type OfertaParaAsociar } from "@/lib/admin/postulantes";
import { enlaceLlamada, enlaceWhatsApp, formatearTelefonoAR } from "@/lib/telefonos";
import type { DerivacionCurso, PostulacionAdmin, ResumenSeguimiento } from "@/lib/validation/oficina";
import { NOMBRE_RUBRO, type Rubro } from "@/lib/validation/rubros";

export type TabPostulante = "resumen" | "postulaciones" | "cursos";

/** After this many rejections the Office offers a training course (D-046, D-047). It only shows a notice. */
const RECHAZOS_PARA_CURSO = 3;

type Props = {
  postulante: FilaPostulante;
  postulaciones: PostulacionAdmin[];
  tab: TabPostulante;
  hrefTab: (tab: TabPostulante) => string;
  paginaCompleta?: boolean;
  /** The follow-up counts and course referrals; only on the applicant's full page (P18, P19, D-047). */
  seguimiento?: { resumen: ResumenSeguimiento; derivacionesCurso: DerivacionCurso[] };
  /** Published offers to link the person to (P16, RF1.5.8). */
  ofertasParaAsociar?: OfertaParaAsociar[];
};

/**
 * Detail panel of an applicant (screen 09, D-042): contact buttons, trades,
 * work experience, CV viewer links and application history with the
 * pre-interview, the referral and the company's answer. On the full page it
 * also has the follow-up counts with the rejections (P18) and the "Cursos"
 * tab to register and see course referrals (P19).
 */
export function PanelPostulante({
  postulante,
  postulaciones,
  tab,
  hrefTab,
  paginaCompleta,
  seguimiento,
  ofertasParaAsociar,
}: Props) {
  const nombre = nombreCompleto(postulante) ?? "Sin nombre cargado";
  const dni = postulante.dni ? `DNI ${postulante.dni}` : "DNI —";
  const whatsapp = enlaceWhatsApp(postulante.telefono);
  const cvCargado = tieneCv(postulante);
  const pestanas = [
    { id: "resumen", etiqueta: "Resumen", href: hrefTab("resumen") },
    { id: "postulaciones", etiqueta: `Postulaciones ${postulaciones.length}`, href: hrefTab("postulaciones") },
    ...(seguimiento
      ? [{ id: "cursos", etiqueta: `Cursos ${seguimiento.derivacionesCurso.length}`, href: hrefTab("cursos") }]
      : []),
  ];
  const tabActiva = tab === "cursos" && !seguimiento ? "resumen" : tab;

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
      <PanelPestanas activa={tabActiva} pestanas={pestanas} />
      <PanelCuerpo>
        {tabActiva === "cursos" && seguimiento ? (
          <CursosPostulante postulanteId={postulante.id} seguimiento={seguimiento} />
        ) : tabActiva === "resumen" ? (
          <>
            {seguimiento && (
              <ResumenDelSeguimiento resumen={seguimiento.resumen} hrefCursos={hrefTab("cursos")} />
            )}
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
                {
                  rotulo: "Experiencia",
                  valor: postulante.experiencia ? (
                    <span className="font-normal whitespace-pre-line">{postulante.experiencia}</span>
                  ) : (
                    <Ausente />
                  ),
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

            {ofertasParaAsociar && (
              <section className="flex flex-col gap-2 rounded-[10px] border border-border bg-muted p-3">
                <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  Asociar a una oferta
                </span>
                <AsociarOferta postulanteId={postulante.id} ofertas={ofertasParaAsociar} />
              </section>
            )}
          </>
        ) : (
          <ListaPostulacionesPostulante postulaciones={postulaciones} />
        )}
      </PanelCuerpo>
    </PanelDetalle>
  );
}

/** The follow-up counts (P18, D-046): a rejection is the company's "No contrata"; "No apto" is the Office's. */
function ResumenDelSeguimiento({ resumen, hrefCursos }: { resumen: ResumenSeguimiento; hrefCursos: string }) {
  const cifras = [
    { etiqueta: "Postulaciones", valor: resumen.postulaciones },
    { etiqueta: "Preseleccionadas", valor: resumen.preseleccionadas },
    { etiqueta: "Derivadas", valor: resumen.derivadas },
    { etiqueta: "Contrataciones", valor: resumen.contrataciones },
    { etiqueta: "Rechazos de empresas", valor: resumen.rechazos },
    { etiqueta: "No apto (Oficina)", valor: resumen.noApto },
    { etiqueta: "Cursos", valor: resumen.derivacionesCurso },
  ];

  return (
    <section aria-label="Seguimiento" className="flex flex-col gap-2.5 rounded-[10px] border border-border bg-card p-3">
      <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">Seguimiento</span>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-4">
        {cifras.map((c) => (
          <div key={c.etiqueta} className="flex flex-col">
            <dt className="text-[11.5px] text-muted-foreground">{c.etiqueta}</dt>
            <dd className="text-[18px] leading-tight font-bold tabular-nums">{c.valor}</dd>
          </div>
        ))}
      </dl>
      {resumen.rechazos >= RECHAZOS_PARA_CURSO && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-[8px] border border-attention-card-border bg-attention-card px-3 py-2 text-attention-foreground">
          <span className="text-[12.5px] font-medium">
            Tiene {resumen.rechazos} rechazos de empresas. Podés ofrecerle un curso de capacitación.
          </span>
          <Link href={hrefCursos} scroll={false} className="text-[12.5px] font-semibold text-primary hover:underline">
            Derivar a un curso
          </Link>
        </div>
      )}
    </section>
  );
}

/** "Cursos" tab (P19, D-047): the form to register a referral and its history, newest first. */
function CursosPostulante({
  postulanteId,
  seguimiento,
}: {
  postulanteId: string;
  seguimiento: { resumen: ResumenSeguimiento; derivacionesCurso: DerivacionCurso[] };
}) {
  return (
    <>
      {seguimiento.resumen.rechazos > 0 && (
        <p className="text-[12.5px] text-muted-foreground">
          {seguimiento.resumen.rechazos === 1
            ? "Tiene 1 rechazo de una empresa."
            : `Tiene ${seguimiento.resumen.rechazos} rechazos de empresas.`}
        </p>
      )}
      <FormularioDerivacionCurso postulanteId={postulanteId} />
      <section className="flex flex-col gap-2">
        <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">Historial</span>
        {seguimiento.derivacionesCurso.length === 0 ? (
          <p className="text-[12.5px] text-muted-foreground">Todavía no se la derivó a ningún curso.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border rounded-[10px] border border-border">
            {seguimiento.derivacionesCurso.map((d) => (
              <li key={d.id} className="flex flex-col gap-0.5 px-3 py-2">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-bold">{d.curso}</span>
                  <span className="shrink-0 text-[11.5px] text-muted-foreground">{fechaDia(d.fecha)}</span>
                </div>
                {d.notas && <p className="text-[12.5px] whitespace-pre-line text-muted-foreground">{d.notas}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

/** Every application with its pre-interview, referral and the company's answer (P18, D-046). */
function ListaPostulacionesPostulante({ postulaciones }: { postulaciones: PostulacionAdmin[] }) {
  if (postulaciones.length === 0) {
    return <p className="text-muted-foreground">Todavía no tiene postulaciones registradas.</p>;
  }
  return (
    <ul className="flex flex-col divide-y divide-border rounded-[10px] border border-border">
      {postulaciones.map((p) => (
        <li key={p.id} className="flex flex-col gap-1.5 px-3 py-2">
          <div className="flex items-center justify-between gap-3">
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
          </div>
          {p.preentrevista && (
            <p className="text-[12px] text-muted-foreground">
              Preentrevista: {fechaHora(p.preentrevista.fecha)}
              {p.preentrevista.notas && ` · ${p.preentrevista.notas}`}
            </p>
          )}
          <ResultadoEmpresa postulacion={p} />
        </li>
      ))}
    </ul>
  );
}
