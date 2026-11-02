import { CircleXIcon, FileTextIcon, InfoIcon, UsersIcon } from "lucide-react";
import Link from "next/link";

import { PanelDetalle } from "@/components/marca/PanelDetalle";
import { DatosOferta } from "@/components/ofertas/DatosOferta";
import { EstadoOferta } from "@/components/ofertas/EstadoOferta";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatearDia } from "@/lib/fechas";
import type { EstadoOferta as Estado, OfertaEmpresa } from "@/lib/validation/ofertas";

import { BotonSolicitarCierre } from "./BotonSolicitarCierre";
import { CandidatosDerivados } from "./CandidatosDerivados";

/** What each status means for the company, in its words. */
const EXPLICACION: Record<Estado, string> = {
  pendiente: "La Oficina de Empleo la está revisando. Cuando la publique, la van a ver quienes buscan trabajo.",
  publicada: "Está publicada: la ven quienes buscan trabajo en el portal.",
  rechazada: "La Oficina de Empleo no la publicó.",
  cerrada: "Está cerrada: ya no se muestra ni recibe postulaciones.",
};

type Props = {
  oferta: OfertaEmpresa;
  /** The company picked this offer; see PanelDetalle. */
  elegida: boolean;
  /** Receives the offer after asking to close it, to update the list. */
  onActualizada: (oferta: OfertaEmpresa) => void;
};

/**
 * Detail of one of the company's offers (P12), on the same page as the list.
 *
 * Uses dedicated tabs for Candidatos vs Detalle del Puesto to provide
 * a clean, comfortable review experience (P17, RF1.6.3, D-044).
 */
export function DetalleOfertaEmpresa({ oferta, elegida, onActualizada }: Props) {
  const puedePedirCierre = oferta.estado === "publicada" && !oferta.cierreSolicitado;
  const tieneCandidatos = oferta.estado === "publicada" || oferta.estado === "cerrada";
  const hrefDuplicar = `/empresa/ofertas/nueva?duplicar=${encodeURIComponent(oferta.id)}`;

  const pie = puedePedirCierre ? (
    <BotonSolicitarCierre ofertaId={oferta.id} onSolicitado={onActualizada} />
  ) : oferta.estado === "rechazada" ? (
    <Button nativeButton={false} render={<Link href={hrefDuplicar} />}>Modificar y volver a enviar</Button>
  ) : oferta.estado === "cerrada" ? (
    <Link href={hrefDuplicar} className={buttonVariants({ variant: "outline" })}>
      Duplicar para buscar de nuevo
    </Link>
  ) : undefined;

  return (
    <PanelDetalle
      elegida={elegida}
      clave={oferta.id}
      volverHref="/empresa/ofertas"
      volverTexto="Volver a mis ofertas"
      titulo={oferta.titulo}
      subtitulo={`Enviada el ${formatearDia(oferta.creadaEl)}`}
      pie={pie}
    >
      <section className="flex flex-col items-start gap-2">
        <h3 className="sr-only">Estado</h3>
        <EstadoOferta estado={oferta.estado} />
        <p className="text-base text-muted-foreground">{EXPLICACION[oferta.estado]}</p>
      </section>

      {oferta.estado === "rechazada" && oferta.motivoRechazo && (
        <Alert variant="destructive">
          <CircleXIcon aria-hidden="true" />
          <AlertTitle className="text-base">Motivo del rechazo</AlertTitle>
          <AlertDescription className="text-base">{oferta.motivoRechazo}</AlertDescription>
        </Alert>
      )}

      {oferta.cierreSolicitado && oferta.estado === "publicada" && (
        <Alert>
          <InfoIcon aria-hidden="true" />
          <AlertTitle className="text-base">Pediste el cierre</AlertTitle>
          <AlertDescription className="text-base">
            La Oficina de Empleo la va a cerrar. Mientras tanto sigue publicada.
          </AlertDescription>
        </Alert>
      )}

      {tieneCandidatos ? (
        <Tabs defaultValue="candidatos" className="flex flex-col gap-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="candidatos" className="gap-2">
              <UsersIcon className="size-4" aria-hidden="true" />
              <span>Candidatos propuestos</span>
            </TabsTrigger>
            <TabsTrigger value="puesto" className="gap-2">
              <FileTextIcon className="size-4" aria-hidden="true" />
              <span>Detalle del puesto</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="candidatos" className="pt-2">
            <CandidatosDerivados ofertaId={oferta.id} />
          </TabsContent>

          <TabsContent value="puesto" className="flex flex-col gap-6 pt-2">
            <DatosOferta rubros={oferta.rubros} lugar={oferta.lugar} jornada={oferta.jornada} sueldo={oferta.sueldo} />
            <section className="flex flex-col gap-2">
              <h3 className="text-lg font-semibold text-foreground">Descripción del puesto</h3>
              <p className="text-base text-muted-foreground whitespace-pre-line">{oferta.descripcion}</p>
            </section>
            <section className="flex flex-col gap-2">
              <h3 className="text-lg font-semibold text-foreground">Requisitos</h3>
              <p className="text-base text-muted-foreground whitespace-pre-line">{oferta.requisitos}</p>
            </section>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="flex flex-col gap-6 pt-2">
          <DatosOferta rubros={oferta.rubros} lugar={oferta.lugar} jornada={oferta.jornada} sueldo={oferta.sueldo} />
          <section className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold text-foreground">Descripción del puesto</h3>
            <p className="text-base text-muted-foreground whitespace-pre-line">{oferta.descripcion}</p>
          </section>
          <section className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold text-foreground">Requisitos</h3>
            <p className="text-base text-muted-foreground whitespace-pre-line">{oferta.requisitos}</p>
          </section>
        </div>
      )}
    </PanelDetalle>
  );
}
