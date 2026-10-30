import { AsociarOferta } from "@/components/admin/asociar-oferta";
import { BotonAdmin } from "@/components/admin/boton-admin";
import { Ausente, nombreCompleto } from "@/components/admin/celdas";
import { EnlaceAccion } from "@/components/admin/enlace-accion";
import { FichaAdmin, FichaSeccion } from "@/components/admin/ficha";
import { FormularioDerivacionCurso } from "@/components/admin/formulario-derivacion-curso";
import { DatosLista } from "@/components/admin/panel-detalle";
import { ResultadoEmpresa } from "@/components/admin/resultado-empresa";
import { BadgePostulacion, StatusBadge } from "@/components/admin/status-badge";
import { BadgeCv } from "@/components/admin/tabla-postulantes";
import { IconoRubro } from "@/components/ofertas/IconoRubro";
import { fechaCorta, fechaDia, fechaHora, fechaLarga } from "@/lib/admin/fechas";
import { perfilIncompleto, tieneCv, type FilaPostulante, type OfertaParaAsociar } from "@/lib/admin/postulantes";
import { conDesde } from "@/lib/admin/url";
import { enlaceLlamada, enlaceWhatsApp, formatearTelefonoAR } from "@/lib/telefonos";
import type { CursoOficina, DerivacionCurso, PostulacionAdmin, ResumenSeguimiento } from "@/lib/validation/oficina";
import { NOMBRE_RUBRO, type Rubro } from "@/lib/validation/rubros";

/** After this many rejections the Office offers a training course (D-046, D-047). */
const RECHAZOS_PARA_CURSO = 3;

type Props = {
  postulante: FilaPostulante;
  postulaciones: PostulacionAdmin[];
  /** The follow-up counts and course referrals (P18, P19, D-047). */
  seguimiento: { resumen: ResumenSeguimiento; derivacionesCurso: DerivacionCurso[] };
  /** Published offers to link the person to (P16, RF1.5.8). */
  ofertasParaAsociar: OfertaParaAsociar[];
  /** Courses from the Office catalog so the operator can assign one in two clicks. */
  cursosDisponibles?: CursoOficina[];
  volver: string;
  /** This page's own URL, so the evaluation it links to can come back here. */
  aqui: string;
};

/**
 * Full page of an applicant (P16, P18, P19; D-062): contact and CV next to the
 * name; follow-up counts, personal data and every application with its
 * pre-interview and the company's answer in the main column; linking to an
 * offer and the course referrals on the side.
 */
export function FichaPostulante({
  postulante,
  postulaciones,
  seguimiento,
  ofertasParaAsociar,
  cursosDisponibles = [],
  volver,
  aqui,
}: Props) {
  const nombre = nombreCompleto(postulante) ?? "Sin nombre cargado";
  const whatsapp = enlaceWhatsApp(postulante.telefono);
  const cvCargado = tieneCv(postulante);

  return (
    <FichaAdmin
      volver={volver}
      badges={
        <>
          <BadgeCv cargado={cvCargado} />
          {perfilIncompleto(postulante) && <StatusBadge etiqueta="Perfil incompleto" tono="attention" />}
        </>
      }
      titulo={nombre}
      contexto={postulante.dni ? `DNI ${postulante.dni}` : "Sin DNI cargado"}
      acciones={
        <>
          {postulante.telefono && (
            <BotonAdmin render={<a href={enlaceLlamada(postulante.telefono)} />}>
              Llamar · {formatearTelefonoAR(postulante.telefono)}
            </BotonAdmin>
          )}
          {whatsapp && (
            <BotonAdmin render={<a href={whatsapp} target="_blank" rel="noopener noreferrer" />}>WhatsApp</BotonAdmin>
          )}
          {postulante.email && <BotonAdmin render={<a href={`mailto:${postulante.email}`} />}>Email</BotonAdmin>}
          {cvCargado && (
            <>
              <BotonAdmin
                variante="primario"
                render={<a href={`/api/admin/postulantes/${postulante.id}/cv`} target="_blank" rel="noopener noreferrer" />}
              >
                Ver CV
              </BotonAdmin>
              <BotonAdmin render={<a href={`/api/admin/postulantes/${postulante.id}/cv?descargar=1`} />}>
                Descargar CV
              </BotonAdmin>
            </>
          )}
        </>
      }
      lateral={
        <>
          <FichaSeccion titulo="Asociar a una oferta">
            <AsociarOferta postulanteId={postulante.id} ofertas={ofertasParaAsociar} />
          </FichaSeccion>
          <CursosPostulante
            postulanteId={postulante.id}
            seguimiento={seguimiento}
            cursosDisponibles={cursosDisponibles}
          />
        </>
      }
    >
      <Seguimiento resumen={seguimiento.resumen} />

      <FichaSeccion titulo="Datos personales">
        <DatosLista
          items={[
            { rotulo: "Teléfono", valor: postulante.telefono ? formatearTelefonoAR(postulante.telefono) : <Ausente /> },
            { rotulo: "Dirección", valor: postulante.direccion ?? <Ausente /> },
            { rotulo: "Email", valor: postulante.email ?? <Ausente /> },
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
            { rotulo: "CV", valor: postulante.cvSubidoEl ? `Subido el ${fechaLarga(postulante.cvSubidoEl)}` : <Ausente /> },
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
      </FichaSeccion>

      <FichaSeccion titulo={`Postulaciones (${postulaciones.length})`}>
        <ListaPostulaciones postulaciones={postulaciones} aqui={aqui} />
      </FichaSeccion>
    </FichaAdmin>
  );
}

/** The follow-up counts (P18, D-046): a rejection is the company's "No contrata"; "No apto" is the Office's. */
function Seguimiento({ resumen }: { resumen: ResumenSeguimiento }) {
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
    <FichaSeccion titulo="Seguimiento">
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
        {cifras.map((c) => (
          <div key={c.etiqueta} className="flex flex-col">
            <dt className="text-[12.5px] text-muted-foreground">{c.etiqueta}</dt>
            <dd className="font-heading text-[22px] leading-tight font-semibold tabular-nums">{c.valor}</dd>
          </div>
        ))}
      </dl>
      {resumen.rechazos >= RECHAZOS_PARA_CURSO && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-[8px] border border-attention-card-border bg-attention-card px-3 py-2 text-attention-foreground">
          <span className="font-medium">
            Tiene {resumen.rechazos} rechazos de empresas. Podés ofrecerle un curso de capacitación.
          </span>
          <a href="#cursos" className="font-semibold text-primary hover:underline">
            Derivar a un curso
          </a>
        </div>
      )}
    </FichaSeccion>
  );
}

/** Course referrals (P19, D-047): the form to register one and the history, newest first. */
function CursosPostulante({
  postulanteId,
  seguimiento,
  cursosDisponibles,
}: {
  postulanteId: string;
  seguimiento: { resumen: ResumenSeguimiento; derivacionesCurso: DerivacionCurso[] };
  cursosDisponibles: CursoOficina[];
}) {
  return (
    <section id="cursos" className="flex scroll-mt-4 flex-col gap-3 rounded-[10px] border border-border bg-card p-4">
      <h2 className="text-[15px] font-semibold text-foreground">Cursos ({seguimiento.derivacionesCurso.length})</h2>
      {seguimiento.resumen.rechazos > 0 && (
        <p className="text-muted-foreground">
          {seguimiento.resumen.rechazos === 1
            ? "Tiene 1 rechazo de una empresa."
            : `Tiene ${seguimiento.resumen.rechazos} rechazos de empresas.`}
        </p>
      )}
      <FormularioDerivacionCurso postulanteId={postulanteId} cursosDisponibles={cursosDisponibles} />
      {seguimiento.derivacionesCurso.length === 0 ? (
        <p className="text-muted-foreground">Todavía no se derivó a ningún curso.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border rounded-[10px] border border-border">
          {seguimiento.derivacionesCurso.map((d) => (
            <li key={d.id} className="flex flex-col gap-0.5 px-3 py-2.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-bold">{d.curso}</span>
                <span className="shrink-0 text-[12.5px] text-muted-foreground">{fechaDia(d.fecha)}</span>
              </div>
              {d.notas && <p className="whitespace-pre-line text-muted-foreground">{d.notas}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** Every application with its pre-interview, referral and the company's answer (P18, D-046). */
function ListaPostulaciones({ postulaciones, aqui }: { postulaciones: PostulacionAdmin[]; aqui: string }) {
  if (postulaciones.length === 0) {
    return <p className="text-muted-foreground">Todavía no tiene postulaciones.</p>;
  }
  return (
    <ul className="flex flex-col divide-y divide-border rounded-[10px] border border-border">
      {postulaciones.map((p) => (
        <li key={p.id} className="flex flex-col gap-1.5 px-3 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 flex-col leading-tight">
              <span className="font-bold">{p.oferta.titulo}</span>
              <small className="text-[12.5px] text-muted-foreground">
                {p.oferta.empresa?.razonSocial ?? "Sin empresa"} · Postulado el {fechaCorta(p.postuladoEl)}
              </small>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <BadgePostulacion estado={p.estado} />
              <EnlaceAccion href={conDesde(`/admin/postulaciones/${p.id}`, aqui)}>Ver</EnlaceAccion>
            </div>
          </div>
          {p.preentrevista && (
            <p className="text-[13px] text-muted-foreground">
              Preentrevista ({p.preentrevistaEstado === "pendiente_confirmacion" ? "Pendiente de confirmación" : "Agendada"}):{" "}
              {fechaHora(p.preentrevista.fecha)}
              {p.preentrevista.notas && ` · ${p.preentrevista.notas}`}
            </p>
          )}
          <ResultadoEmpresa postulacion={p} />
        </li>
      ))}
    </ul>
  );
}
