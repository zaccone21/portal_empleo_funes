"use client";

import Link from "next/link";
import { SearchXIcon, UsersIcon } from "lucide-react";

import { ErrorAlCargar } from "@/components/estados/ErrorAlCargar";
import { PedirIngreso } from "@/components/estados/PedirIngreso";
import { buttonVariants } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { useBusquedaPostulantes } from "@/hooks/useBusquedaPostulantes";
import {
  describirPostulantes,
  hayFiltrosPostulantes,
  rutaPostulantes,
  type FiltrosPostulantes as Filtros,
} from "@/lib/busqueda-postulantes";
import { cn } from "@/lib/utils";

import { FiltrosPostulantes } from "./FiltrosPostulantes";
import { ListaPostulantes } from "./ListaPostulantes";
import { ResumenPostulantes } from "./ResumenPostulantes";

type Props = {
  /** Filters from the URL (?q=&rubro=). */
  filtros: Filtros;
};

/**
 * "Búsqueda de postulantes" (P16, RF1.5.7): the Office searches the register
 * by name, surname, DNI or trades. Shows the filters, three numbers about the
 * results, a sentence that says what is being shown, and the list (a table on
 * desktop, cards on phones).
 *
 * It loads with useBusquedaPostulantes whenever the URL's filters change, and
 * handles every state: loading, no access (401/403: asks to log in as the
 * Office), error (with "Probar de nuevo"), nothing found (with a way out) and
 * the results. Associating a person with an offer (RF1.5.8) is not here yet.
 */
export function BusquedaPostulantes({ filtros }: Props) {
  const { datos, loading, error, sinAcceso, recargar } = useBusquedaPostulantes(filtros.q, filtros.rubros);

  if (sinAcceso) {
    return (
      <PedirIngreso
        rol="admin"
        titulo="Ingresá con tu cuenta de la Oficina"
        descripcion="Esta sección es para el personal de la Oficina de Empleo."
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <FiltrosPostulantes filtros={filtros} />

      {error ? (
        <ErrorAlCargar que="los postulantes" mensaje={error} onReintentar={recargar} />
      ) : loading || !datos ? (
        <Cargando />
      ) : datos.length === 0 ? (
        <SinResultados filtrado={hayFiltrosPostulantes(filtros)} />
      ) : (
        <div className="flex flex-col gap-5">
          <ResumenPostulantes total={datos.length} conCv={datos.filter((postulante) => postulante.cvSubidoEl).length} />
          <p className="text-base text-muted-foreground">{describirPostulantes(datos.length, filtros)}</p>
          <ListaPostulantes postulantes={datos} descripcion={describirPostulantes(datos.length, filtros)} />
        </div>
      )}
    </div>
  );
}

function Cargando() {
  return (
    <div aria-busy="true" className="flex flex-col gap-5">
      <span className="sr-only" role="status">
        Buscando postulantes…
      </span>
      <Skeleton className="h-20 rounded-tl-2xl rounded-br-2xl bg-card" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-28 rounded-tl-2xl rounded-br-2xl bg-card" />
        ))}
      </div>
    </div>
  );
}

/** Nothing found: says so and, if filters are on, offers the whole register (never a dead end). */
function SinResultados({ filtrado }: { filtrado: boolean }) {
  const Icono = filtrado ? SearchXIcon : UsersIcon;

  return (
    <Empty className="rounded-tl-2xl rounded-br-2xl bg-card">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icono aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>{filtrado ? "No encontramos postulantes con esa búsqueda" : "Todavía no hay postulantes"}</EmptyTitle>
        <EmptyDescription className="text-base">
          {filtrado
            ? "Probá con menos palabras o sacá algún rubro."
            : "Cuando alguien cree su cuenta de postulante, va a aparecer acá."}
        </EmptyDescription>
      </EmptyHeader>
      {filtrado && (
        <EmptyContent>
          <Link
            href={rutaPostulantes({ q: "", rubros: [] })}
            scroll={false}
            className={cn(buttonVariants({ size: "lg" }), "w-full")}
          >
            Ver todos los postulantes
          </Link>
        </EmptyContent>
      )}
    </Empty>
  );
}
