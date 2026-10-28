"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon, ChevronRightIcon, CopyIcon } from "lucide-react";
import { toast } from "sonner";

import { BotonDerivar, BotonesEvaluacion } from "@/components/admin/acciones-postulacion";
import { BotonAdmin } from "@/components/admin/boton-admin";
import { Ausente, nombreCompleto } from "@/components/admin/celdas";
import { EnlaceAccion } from "@/components/admin/enlace-accion";
import { EnlaceVolver } from "@/components/admin/ficha";
import { FormularioPreentrevista } from "@/components/admin/formulario-preentrevista";
import { PageHeader } from "@/components/admin/page-header";
import { TarjetaEmpresa } from "@/components/admin/panel-detalle";
import { ResultadoEmpresa } from "@/components/admin/resultado-empresa";
import { BadgePostulacion } from "@/components/admin/status-badge";
import { IconoRubro } from "@/components/ofertas/IconoRubro";
import { fechaLarga } from "@/lib/admin/fechas";
import { conDesde } from "@/lib/admin/url";
import { enlaceLlamada, enlaceWhatsApp, formatearTelefonoAR } from "@/lib/telefonos";
import type { PostulacionAdmin } from "@/lib/validation/oficina";
import { NOMBRE_RUBRO, type Rubro } from "@/lib/validation/rubros";

type Props = {
  postulacion: PostulacionAdmin;
  /** The list or page it was opened from, for the back arrow (D-062). */
  volver: string;
  /** This page's own URL, so the offer and the files it links to can come back here. */
  aqui: string;
  /** Previous and next applications of the queue, keeping where it was opened from. */
  hrefAnterior?: string;
  hrefSiguiente?: string;
  posicionEnCola?: { actual: number; total: number };
  /** Other applications of the same offer referred to the company and still without its answer (D-054). */
  sinRespuestaEnOferta?: number;
  /** How this offer is going, counted on its applications: the context to decide this one. */
  resumenOferta?: { postulaciones: number; derivadas: number; contratadas: number };
  /** How many other applications this person has, to open their file when there are. */
  otrasPostulaciones?: number;
};

/** Plain text with the applicant's data, for the operator to paste where they talk to the company. */
function textoParaEmpresa(postulacion: PostulacionAdmin, nombre: string): string {
  const { telefono, email, rubros } = postulacion.postulante;
  return [
    nombre,
    telefono ? `Teléfono: ${formatearTelefonoAR(telefono)}` : null,
    email ? `Email: ${email}` : null,
    rubros.length > 0 ? `Oficios: ${rubros.map((r) => NOMBRE_RUBRO[r as Rubro] ?? r).join(", ")}` : null,
    `Oferta: ${postulacion.oferta.titulo}`,
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Screen 06: split 1fr 1fr evaluation screen.
 * Left: Offer detail with how it is going (applications, referrals, hires),
 * its requirements, and the company card with one-tap contact and a link to
 * its file.
 * Right: White CV sheet with contact buttons, the pre-interview
 * (RF1.6.1), the result with the company once referred, and the document preview
 * (supports both PDF and PNG CVs).
 */
export function EvaluacionPostulacion({
  postulacion,
  volver,
  aqui,
  hrefAnterior,
  hrefSiguiente,
  posicionEnCola,
  sinRespuestaEnOferta = 0,
  resumenOferta,
  otrasPostulaciones = 0,
}: Props) {
  const router = useRouter();
  const nombre = nombreCompleto(postulacion.postulante) ?? "Sin nombre cargado";
  const whatsapp = enlaceWhatsApp(postulacion.postulante.telefono);
  const destinoSiguiente = hrefSiguiente ?? volver;
  const esCvPng = Boolean(postulacion.postulante.cvNombre?.toLowerCase().endsWith(".png"));

  // Keyboard navigation shortcuts (J = previous, K = next)
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "j" || e.key === "J") {
        if (hrefAnterior) router.push(hrefAnterior);
      } else if (e.key === "k" || e.key === "K") {
        if (hrefSiguiente) router.push(hrefSiguiente);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [hrefAnterior, hrefSiguiente, router]);

  async function copiarDatos() {
    try {
      await navigator.clipboard.writeText(textoParaEmpresa(postulacion, nombre));
      toast.success("Datos copiados. Pegalos en el mensaje a la empresa.");
    } catch {
      toast.error("No pudimos copiar los datos. Copialos a mano desde esta pantalla.");
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <EnlaceVolver href={volver} />
      <PageHeader
        migas={["Tareas pendientes", "Postulaciones nuevas", nombre]}
        titulo="Evaluación de postulación"
        aside={`Postulado el ${fechaLarga(postulacion.postuladoEl)}`}
      />

      <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-2">
        {/* Left column: Offer detail */}
        <section className="flex flex-col gap-4 overflow-y-auto rounded-[10px] border border-border bg-card p-5">
          <div className="flex flex-col gap-1 border-b border-border pb-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                Oferta laboral
              </span>
              <EnlaceAccion href={conDesde(`/admin/ofertas/${postulacion.oferta.id}`, aqui)}>Ver oferta</EnlaceAccion>
            </div>
            <h2 className="text-[20px] leading-snug font-bold text-foreground">{postulacion.oferta.titulo}</h2>
            {resumenOferta && (
              <p className="text-[12.5px] text-muted-foreground tabular-nums">
                {resumenOferta.postulaciones === 1 ? "1 postulación" : `${resumenOferta.postulaciones} postulaciones`}
                {" · "}
                {resumenOferta.derivadas === 1 ? "1 derivada" : `${resumenOferta.derivadas} derivadas`}
                {" · "}
                {resumenOferta.contratadas === 1 ? "1 contratada" : `${resumenOferta.contratadas} contratadas`}
              </p>
            )}
          </div>

          <TarjetaEmpresa
            empresa={postulacion.oferta.empresa}
            hrefFicha={conDesde(`/admin/empresas/${postulacion.oferta.empresaId}`, aqui)}
          />

          <div className="grid grid-cols-2 gap-3 text-[12.5px]">
            <div>
              <span className="block text-[11px] text-muted-foreground">Dirección del trabajo</span>
              <span className="font-medium text-foreground">{postulacion.oferta.lugar || "Funes"}</span>
            </div>
            <div>
              <span className="block text-[11px] text-muted-foreground">Jornada</span>
              <span className="font-medium text-foreground">{postulacion.oferta.jornada || <Ausente />}</span>
            </div>
            {postulacion.oferta.sueldo && (
              <div className="col-span-2">
                <span className="block text-[11px] text-muted-foreground">Remuneración</span>
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
            <div className="text-[13px] leading-relaxed whitespace-pre-line text-foreground">
              {postulacion.oferta.descripcion}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-medium text-muted-foreground uppercase">Requisitos</span>
            <div className="text-[13px] leading-relaxed whitespace-pre-line text-foreground">
              {postulacion.oferta.requisitos}
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
                  {otrasPostulaciones > 0 &&
                    ` · ${otrasPostulaciones === 1 ? "1 postulación más" : `${otrasPostulaciones} postulaciones más`}`}
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-1.5">
                <EnlaceAccion href={conDesde(`/admin/postulantes/${postulacion.postulante.id}`, aqui)}>Ver ficha</EnlaceAccion>
                {postulacion.postulante.cvNombre && (
                  <BotonAdmin
                    variante="primario"
                    render={
                      <a
                        href={`/api/admin/postulantes/${postulacion.postulante.id}/cv?descargar=1`}
                      />
                    }
                  >
                    Descargar CV
                  </BotonAdmin>
                )}
              </div>
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
              <BotonAdmin onClick={copiarDatos}>
                <CopyIcon data-icon="inline-start" aria-hidden="true" />
                Copiar datos para la empresa
              </BotonAdmin>
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

          <FormularioPreentrevista
            postulacionId={postulacion.id}
            preentrevista={postulacion.preentrevista}
            preentrevistaEstado={postulacion.preentrevistaEstado}
            nombrePostulante={nombre}
            tituloOferta={postulacion.oferta.titulo}
          />

          {/* CV Document preview or message */}
          <div className="flex min-h-[350px] flex-1 flex-col gap-2">
            <span className="text-[11px] font-medium text-muted-foreground uppercase">
              Documento adjunto ({esCvPng ? "Imagen PNG" : "PDF"})
            </span>
            {postulacion.postulante.cvNombre ? (
              <>
                {esCvPng ? (
                  <div className="flex min-h-[420px] flex-1 items-center justify-center overflow-auto rounded-[8px] border border-border bg-surface p-3">
                    <Image
                      src={`/api/admin/postulantes/${postulacion.postulante.id}/cv`}
                      alt={`CV de ${nombre}`}
                      width={800}
                      height={1000}
                      unoptimized
                      className="max-h-[640px] w-auto max-w-full rounded-[6px] object-contain"
                    />
                  </div>
                ) : (
                  <iframe
                    src={`/api/admin/postulantes/${postulacion.postulante.id}/cv`}
                    title="Visor de CV"
                    className="min-h-[420px] size-full flex-1 rounded-[8px] border border-border"
                  />
                )}
                <BotonAdmin
                  variante="secundario"
                  className="self-start"
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
              </>
            ) : (
              <div className="flex flex-col items-center justify-center gap-1 rounded-[8px] border border-dashed border-border bg-surface p-8 text-center text-muted-foreground">
                <p className="font-medium text-foreground">Esta persona no subió CV.</p>
                <p className="text-[12px]">Revisá los oficios declarados y los datos de contacto arriba.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Footer bar */}
      <footer className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-border bg-surface px-4 py-2.5">
        <div className="flex items-center gap-3 text-[12.5px] text-muted-foreground">
          {hrefAnterior ? (
            <Link
              href={hrefAnterior}
              className="inline-flex items-center gap-0.5 font-medium text-primary hover:underline"
            >
              <ChevronLeftIcon aria-hidden="true" className="size-3.5" />
              Anterior (J)
            </Link>
          ) : (
            <span className="opacity-40">Anterior</span>
          )}

          {posicionEnCola && (
            <span className="font-medium text-foreground tabular-nums">
              {posicionEnCola.actual} de {posicionEnCola.total} por evaluar
            </span>
          )}

          {hrefSiguiente ? (
            <Link
              href={hrefSiguiente}
              className="inline-flex items-center gap-0.5 font-medium text-primary hover:underline"
            >
              Siguiente (K)
              <ChevronRightIcon aria-hidden="true" className="size-3.5" />
            </Link>
          ) : (
            <span className="opacity-40">Siguiente</span>
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
