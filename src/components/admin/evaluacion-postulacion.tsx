"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { BotonDerivar, BotonesEvaluacion } from "@/components/admin/acciones-postulacion";
import { BotonAdmin } from "@/components/admin/boton-admin";
import { Ausente, nombreCompleto } from "@/components/admin/celdas";
import { FormularioPreentrevista } from "@/components/admin/formulario-preentrevista";
import { PageHeader } from "@/components/admin/page-header";
import { ResultadoEmpresa } from "@/components/admin/resultado-empresa";
import { BadgePostulacion } from "@/components/admin/status-badge";
import { IconoRubro } from "@/components/ofertas/IconoRubro";
import { fechaLarga } from "@/lib/admin/fechas";
import { enlaceLlamada, enlaceWhatsApp, formatearTelefonoAR } from "@/lib/telefonos";
import type { PostulacionAdmin } from "@/lib/validation/oficina";
import { NOMBRE_RUBRO, type Rubro } from "@/lib/validation/rubros";

type Props = {
  postulacion: PostulacionAdmin;
  urlCv?: string;
  anteriorId?: string;
  siguienteId?: string;
  posicionEnCola?: { actual: number; total: number };
  /** Other applications of the same offer referred to the company and still without its answer (D-054). */
  sinRespuestaEnOferta?: number;
};

/**
 * Screen 06: split 1fr 1fr evaluation screen.
 * Left: Offer detail with company data and one-tap contact.
 * Right: White CV sheet with contact buttons, the optional pre-interview
 * (RF1.6.1), the result with the company once referred, and the document preview.
 * Footer: Keyboard shortcuts (J/K/P/N) and evaluation actions; a pre-selected
 * application is referred from here (RF1.6.2), with a warning that does not
 * block when the company has not answered for others of the same offer (D-054).
 */
export function EvaluacionPostulacion({
  postulacion,
  urlCv,
  anteriorId,
  siguienteId,
  posicionEnCola,
  sinRespuestaEnOferta = 0,
}: Props) {
  const router = useRouter();
  const nombre = nombreCompleto(postulacion.postulante) ?? "Sin nombre cargado";
  const whatsapp = enlaceWhatsApp(postulacion.postulante.telefono);
  const empresa = postulacion.oferta.empresa;
  const whatsappEmpresa = enlaceWhatsApp(empresa?.contactoTelefono);
  const destinoSiguiente = siguienteId
    ? `/admin/postulaciones/${siguienteId}`
    : "/admin/postulaciones/por-evaluar";

  // Keyboard navigation shortcuts (J = previous, K = next)
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "j" || e.key === "J") {
        if (anteriorId) router.push(`/admin/postulaciones/${anteriorId}`);
      } else if (e.key === "k" || e.key === "K") {
        if (siguienteId) router.push(`/admin/postulaciones/${siguienteId}`);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [anteriorId, siguienteId, router]);

  return (
    <div className="flex flex-1 flex-col gap-3 min-h-0">
      <PageHeader
        migas={["Tareas pendientes", "Postulaciones nuevas", nombre]}
        titulo="Evaluación de postulación"
        aside={`Postulado el ${fechaLarga(postulacion.postuladoEl)}`}
      />

      <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-2">
        {/* Left column: Offer detail */}
        <section className="flex flex-col gap-4 overflow-y-auto rounded-[10px] border border-border bg-card p-5">
          <div className="flex flex-col gap-1 border-b border-border pb-3">
            <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Oferta laboral
            </span>
            <h2 className="text-[20px] font-bold text-foreground leading-snug">{postulacion.oferta.titulo}</h2>
            <div className="text-[13px] text-muted-foreground">
              {postulacion.oferta.empresa?.razonSocial ?? "Empresa confidencial"}
              {postulacion.oferta.empresa?.cuit && ` · CUIT ${postulacion.oferta.empresa.cuit}`}
            </div>
            {empresa && (empresa.contactoTelefono || empresa.contactoEmail) && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {empresa.contactoNombre && (
                  <span className="text-[12px] text-muted-foreground">Contacto: {empresa.contactoNombre}</span>
                )}
                {empresa.contactoTelefono && (
                  <BotonAdmin render={<a href={enlaceLlamada(empresa.contactoTelefono)} />}>
                    Llamar · {formatearTelefonoAR(empresa.contactoTelefono)}
                  </BotonAdmin>
                )}
                {whatsappEmpresa && (
                  <BotonAdmin render={<a href={whatsappEmpresa} target="_blank" rel="noopener noreferrer" />}>
                    WhatsApp
                  </BotonAdmin>
                )}
                {empresa.contactoEmail && (
                  <BotonAdmin render={<a href={`mailto:${empresa.contactoEmail}`} />}>Email</BotonAdmin>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 text-[12.5px]">
            <div>
              <span className="text-muted-foreground block text-[11px]">Ubicación</span>
              <span className="font-medium text-foreground">{postulacion.oferta.lugar || "Funes"}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Jornada</span>
              <span className="font-medium text-foreground">{postulacion.oferta.jornada || <Ausente />}</span>
            </div>
            {postulacion.oferta.sueldo && (
              <div className="col-span-2">
                <span className="text-muted-foreground block text-[11px]">Remuneración</span>
                <span className="font-medium text-foreground">{postulacion.oferta.sueldo}</span>
              </div>
            )}
          </div>

          {postulacion.oferta.rubros.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-medium text-muted-foreground uppercase">Rubros requeridos</span>
              <div className="flex flex-wrap gap-1.5">
                {postulacion.oferta.rubros.map((r) => (
                  <span
                    key={r}
                    className="inline-flex items-center gap-1.5 rounded-[99px] border border-border bg-surface px-2.5 py-1 text-[12px] font-medium text-foreground"
                  >
                    <IconoRubro rubro={r as Rubro} className="size-3.5 text-muted-foreground" />
                    {NOMBRE_RUBRO[r as Rubro] ?? r}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-medium text-muted-foreground uppercase">Descripción del puesto</span>
            <div className="whitespace-pre-line text-[13px] leading-relaxed text-foreground">
              {postulacion.oferta.descripcion}
            </div>
          </div>
        </section>

        {/* Right column: White CV sheet */}
        <section className="flex flex-col gap-4 overflow-y-auto rounded-[10px] border border-border bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2 border-b border-border pb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                  Datos del postulante
                </span>
                <h2 className="text-[20px] font-bold text-foreground">{nombre}</h2>
                <span className="text-[12.5px] text-muted-foreground">
                  {postulacion.postulante.dni ? `DNI ${postulacion.postulante.dni}` : "Sin DNI registrado"}
                </span>
              </div>
              {postulacion.postulante.cvNombre && (
                <div className="flex items-center gap-1.5">
                  <BotonAdmin
                    variante="primario"
                    render={
                      <a
                        href={`/api/admin/postulantes/${postulacion.postulante.id}/cv?descargar=1`}
                      />
                    }
                  >
                    Descargar PDF
                  </BotonAdmin>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {postulacion.postulante.telefono && (
                <BotonAdmin render={<a href={enlaceLlamada(postulacion.postulante.telefono)} />}>
                  Llamar · {formatearTelefonoAR(postulacion.postulante.telefono)}
                </BotonAdmin>
              )}
              {whatsapp && (
                <BotonAdmin render={<a href={whatsapp} target="_blank" rel="noopener noreferrer" />}>
                  WhatsApp
                </BotonAdmin>
              )}
              {postulacion.postulante.email && (
                <BotonAdmin render={<a href={`mailto:${postulacion.postulante.email}`} />}>
                  Email
                </BotonAdmin>
              )}
            </div>
          </div>

          {postulacion.postulante.rubros.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-medium text-muted-foreground uppercase">Oficios declarados</span>
              <div className="flex flex-wrap gap-1.5">
                {postulacion.postulante.rubros.map((r) => (
                  <span
                    key={r}
                    className="inline-flex items-center gap-1.5 rounded-[99px] border border-border bg-surface px-2.5 py-1 text-[12px] font-medium text-foreground"
                  >
                    <IconoRubro rubro={r as Rubro} className="size-3.5 text-muted-foreground" />
                    {NOMBRE_RUBRO[r as Rubro] ?? r}
                  </span>
                ))}
              </div>
            </div>
          )}

          {postulacion.derivadaEl && (
            <section className="flex flex-col gap-2 rounded-[10px] border border-border bg-surface p-3">
              <span className="text-[11px] font-medium text-muted-foreground uppercase">Resultado con la empresa</span>
              <ResultadoEmpresa postulacion={postulacion} />
            </section>
          )}

          <FormularioPreentrevista postulacionId={postulacion.id} preentrevista={postulacion.preentrevista} />

          {/* CV Document preview or message */}
          <div className="flex flex-1 flex-col gap-2 min-h-[350px]">
            <span className="text-[11px] font-medium text-muted-foreground uppercase">Documento adjunto</span>
            {urlCv ? (
              <iframe
                src={urlCv}
                title="Visor de CV"
                className="size-full flex-1 rounded-[8px] border border-border min-h-[420px]"
              />
            ) : postulacion.postulante.cvNombre ? (
              <div className="flex flex-col items-center justify-center gap-2 rounded-[8px] border border-border bg-surface p-8 text-center">
                <p className="font-semibold text-foreground">CV: {postulacion.postulante.cvNombre}</p>
                <BotonAdmin
                  variante="primario"
                  render={
                    <a
                      href={`/api/admin/postulantes/${postulacion.postulante.id}/cv`}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                >
                  Abrir CV en pestaña nueva
                </BotonAdmin>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-1 rounded-[8px] border border-dashed border-border bg-surface p-8 text-center text-muted-foreground">
                <p className="font-medium text-foreground">Esta persona no subió CV en PDF.</p>
                <p className="text-[12px]">Revisá los oficios declarados y los datos de contacto arriba.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Footer bar */}
      <footer className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-border bg-surface px-4 py-2.5">
        <div className="flex items-center gap-3 text-[12.5px] text-muted-foreground">
          {anteriorId ? (
            <Link
              href={`/admin/postulaciones/${anteriorId}`}
              className="font-medium text-primary hover:underline"
            >
              ← Anterior (J)
            </Link>
          ) : (
            <span className="opacity-40">← Anterior</span>
          )}

          {posicionEnCola && (
            <span className="font-medium text-foreground tabular-nums">
              {posicionEnCola.actual} de {posicionEnCola.total} por evaluar
            </span>
          )}

          {siguienteId ? (
            <Link
              href={`/admin/postulaciones/${siguienteId}`}
              className="font-medium text-primary hover:underline"
            >
              Siguiente (K) →
            </Link>
          ) : (
            <span className="opacity-40">Siguiente →</span>
          )}
        </div>

        <div>
          {postulacion.estado === "postulado" ? (
            <BotonesEvaluacion id={postulacion.id} destinoSiguiente={destinoSiguiente} />
          ) : (
            <div className="flex flex-wrap items-center justify-end gap-3">
              <span className="text-[12px] text-muted-foreground">Estado actual:</span>
              <BadgePostulacion estado={postulacion.estado} />
              {postulacion.estado === "preseleccionado" && (
                <>
                  {sinRespuestaEnOferta > 0 && (
                    <span className="text-[12px] font-medium text-attention-foreground">
                      {sinRespuestaEnOferta === 1
                        ? "La empresa todavía no respondió por 1 persona de esta oferta."
                        : `La empresa todavía no respondió por ${sinRespuestaEnOferta} personas de esta oferta.`}
                    </span>
                  )}
                  <BotonDerivar id={postulacion.id} />
                </>
              )}
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
