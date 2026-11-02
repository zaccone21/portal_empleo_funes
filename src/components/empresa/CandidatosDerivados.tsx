"use client";

import { UsersIcon } from "lucide-react";

import { ErrorAlCargar } from "@/components/estados/ErrorAlCargar";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { useCandidatosDerivados } from "@/hooks/useCandidatosDerivados";

import { TarjetaCandidato } from "./TarjetaCandidato";

/**
 * "Candidatos que te propuso la Oficina" (P17, RF1.6.3, D-044), inside the
 * detail of one of the company's offers. Only the applicants the Office
 * referred: never other applications nor the pool.
 *
 * States: loading, error with "Probar de nuevo", empty (what will happen) and
 * the list, with how many answers are still missing (D-054: there are no caps,
 * so the screen asks for the feedback instead).
 */
export function CandidatosDerivados({ ofertaId }: { ofertaId: string }) {
  const { candidatos, loading, error, sinAcceso, recargar, reemplazar } = useCandidatosDerivados(ofertaId);
  const sinRespuesta = candidatos?.filter((c) => c.decision === null).length ?? 0;

  let contenido;
  if (loading) {
    contenido = (
      <div aria-busy="true">
        <span className="sr-only" role="status">
          Cargando los candidatos…
        </span>
        <Skeleton className="h-48 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card" />
      </div>
    );
  } else if (error || sinAcceso) {
    contenido = (
      <ErrorAlCargar
        que="los candidatos"
        mensaje={error ?? "Ingresá de nuevo con la cuenta de tu empresa."}
        onReintentar={recargar}
      />
    );
  } else if (!candidatos || candidatos.length === 0) {
    contenido = (
      <Empty className="rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-muted/40 p-6">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <UsersIcon aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>Todavía no hay candidatos</EmptyTitle>
          <EmptyDescription className="text-base">
            Cuando la Oficina de Empleo encuentre personas para esta oferta, te las propone acá, con su contacto y su CV.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  } else {
    contenido = (
      <>
        <p className="text-base" aria-live="polite">
          {sinRespuesta === 0
            ? "Ya respondiste por todas las personas. ¡Gracias!"
            : sinRespuesta === 1
              ? "Te falta contarnos si contrataste a 1 persona. Así la Oficina sabe cómo siguió la búsqueda."
              : `Te falta contarnos si contrataste a ${sinRespuesta} personas. Así la Oficina sabe cómo siguió la búsqueda.`}
        </p>
        <ul className="flex flex-col gap-3">
          {candidatos.map((candidato) => (
            <li key={candidato.postulacionId}>
              <TarjetaCandidato candidato={candidato} onDecidido={reemplazar} />
            </li>
          ))}
        </ul>
      </>
    );
  }

  return (
    <section aria-labelledby={`candidatos-${ofertaId}`} className="flex flex-col gap-3">
      <h3 id={`candidatos-${ofertaId}`} className="text-lg font-semibold">
        Candidatos que te propuso la Oficina
      </h3>
      {contenido}
    </section>
  );
}
