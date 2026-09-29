"use client";

import { Building2Icon, CircleXIcon, InfoIcon, MailIcon, PhoneIcon } from "lucide-react";

import { PanelDetalle } from "@/components/marca/PanelDetalle";
import { DatosOferta } from "@/components/ofertas/DatosOferta";
import { EstadoOferta } from "@/components/ofertas/EstadoOferta";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatearDia } from "@/lib/fechas";
import type { EstadoOferta as Estado } from "@/lib/validation/ofertas";
import type { OfertaOficina } from "@/lib/validation/oficina";

import { AccionesOferta, hayDecisionPendiente } from "./AccionesOferta";
import { PostulantesDeOferta } from "./PostulantesDeOferta";

/** What each status means for the Office, and what is left to do. */
const EXPLICACION: Record<Estado, string> = {
  pending: "Revisala y decidí si se publica. Si la rechazás, escribí el motivo para la empresa.",
  published: "Está en el catálogo y recibe postulaciones.",
  rejected: "No se publicó. La empresa ve el motivo.",
  closed: "Ya no se muestra ni recibe postulaciones.",
};

type Props = {
  oferta: OfertaOficina;
  elegida: boolean;
  volverHref: string;
  onActualizada: (oferta: OfertaOficina) => void;
};

/**
 * One offer as the Office works on it (P15), on the same page as the list:
 * 1. Status and what to do with it; the rejection reason if rejected; a notice
 *    if the company asked to close it.
 * 2. The company and how to reach it: phone (tel:) and email (mailto:) are
 *    links, so calling or writing is one tap.
 * 3. The offer as the company wrote it.
 * 4. For published and closed offers, the applicants with their CV and status
 *    (RF1.5.5, RF1.5.6).
 * The decisions (publish, reject, close) are pinned at the bottom
 * (AccionesOferta).
 */
export function DetalleOfertaOficina({ oferta, elegida, volverHref, onActualizada }: Props) {
  const conPostulantes = oferta.estado === "published" || oferta.estado === "closed";

  return (
    <PanelDetalle
      elegida={elegida}
      clave={oferta.id}
      volverHref={volverHref}
      volverTexto="Volver a la lista"
      titulo={oferta.titulo}
      subtitulo={`Enviada el ${formatearDia(oferta.creadaEl)}.${oferta.publicadaEl ? ` Publicada el ${formatearDia(oferta.publicadaEl)}.` : ""}`}
      pie={
        hayDecisionPendiente(oferta) ? (
          <AccionesOferta key={`${oferta.id}-${oferta.estado}`} oferta={oferta} onActualizada={onActualizada} />
        ) : undefined
      }
    >
      <section className="flex flex-col items-start gap-2">
        <h3 className="sr-only">Estado</h3>
        <EstadoOferta estado={oferta.estado} />
        <p className="text-base">{EXPLICACION[oferta.estado]}</p>
      </section>

      {oferta.estado === "rejected" && oferta.motivoRechazo && (
        <Alert variant="destructive">
          <CircleXIcon aria-hidden="true" />
          <AlertTitle className="text-base">Motivo del rechazo</AlertTitle>
          <AlertDescription className="text-base">{oferta.motivoRechazo}</AlertDescription>
        </Alert>
      )}

      {oferta.estado === "published" && oferta.cierreSolicitado && (
        <Alert>
          <InfoIcon aria-hidden="true" />
          <AlertTitle className="text-base">La empresa pidió cerrar esta oferta</AlertTitle>
          <AlertDescription className="text-base">Cerrala cuando corresponda con el botón de abajo.</AlertDescription>
        </Alert>
      )}

      <section aria-labelledby="empresa-titulo" className="flex flex-col gap-2 rounded-xl bg-muted p-4">
        <h3 id="empresa-titulo" className="flex items-center gap-2 text-lg font-semibold">
          <Building2Icon aria-hidden="true" className="size-5 text-primary" />
          {oferta.empresa?.razonSocial ?? "Empresa sin datos cargados"}
        </h3>
        {oferta.empresa ? (
          <ul className="flex flex-col gap-1.5 text-base">
            <li className="text-muted-foreground">CUIT {oferta.empresa.cuit}</li>
            <li>Contacto: {oferta.empresa.contactoNombre}</li>
            <li>
              <a
                href={`tel:${oferta.empresa.contactoTelefono.replace(/[^\d+]/g, "")}`}
                className="inline-flex min-h-11 items-center gap-2 underline-offset-4 hover:underline"
              >
                <PhoneIcon aria-hidden="true" className="size-4 text-primary" />
                {oferta.empresa.contactoTelefono}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${oferta.empresa.contactoEmail}`}
                className="inline-flex min-h-11 items-center gap-2 break-all underline-offset-4 hover:underline"
              >
                <MailIcon aria-hidden="true" className="size-4 shrink-0 text-primary" />
                {oferta.empresa.contactoEmail}
              </a>
            </li>
          </ul>
        ) : (
          <p className="text-base text-muted-foreground">
            Cuenta:{" "}
            <a href={`mailto:${oferta.emailEmpresa}`} className="underline underline-offset-4">
              {oferta.emailEmpresa}
            </a>
          </p>
        )}
      </section>

      <DatosOferta rubro={oferta.rubro} lugar={oferta.lugar} jornada={oferta.jornada} />
      <section className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold">Descripción del puesto</h3>
        <p className="text-base whitespace-pre-line">{oferta.descripcion}</p>
      </section>
      <section className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold">Requisitos</h3>
        <p className="text-base whitespace-pre-line">{oferta.requisitos}</p>
      </section>

      {conPostulantes && <PostulantesDeOferta key={oferta.id} ofertaId={oferta.id} />}
    </PanelDetalle>
  );
}
