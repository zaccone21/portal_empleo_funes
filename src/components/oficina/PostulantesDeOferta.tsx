"use client";

import { FileTextIcon, MailIcon } from "lucide-react";
import { toast } from "sonner";

import { ErrorDelServidor } from "@/components/auth/ErrorDelServidor";
import { ErrorAlCargar } from "@/components/estados/ErrorAlCargar";
import { SelectorNativo } from "@/components/formularios/SelectorNativo";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePostulacionesOficina } from "@/hooks/useOficina";
import { formatearDia } from "@/lib/fechas";
import { estadoPostulacionSchema } from "@/lib/validation/postulaciones";

import { EstadoPostulacion, NOMBRE_ESTADO_POSTULACION } from "./EstadoPostulacion";

const ESTADOS = estadoPostulacionSchema.options;

/**
 * Who applied to an offer (RF1.5.5) and their status (RF1.5.6), inside the
 * offer's detail, in the order they arrived.
 *
 * For each person, the Office has at hand:
 * - their email as a mailto: link (to contact them for an interview);
 * - "Ver CV": a plain link that opens the PDF in a new tab (it goes through
 *   the server, which gives a short-lived signed URL, RNF1), so it is never
 *   blocked as a popup;
 * - the status, with the phone's own picker. Changing it saves at once and a
 *   toast confirms it. The applicant never sees it (RF1.2.4).
 * The person is shown by email until the profile fields are decided (DT-006).
 */
export function PostulantesDeOferta({ ofertaId }: { ofertaId: string }) {
  const { postulaciones, loading, error, recargar, cambiarEstado, errorCambio } = usePostulacionesOficina(ofertaId);

  async function cambiar(id: string, valor: string) {
    const estado = estadoPostulacionSchema.safeParse(valor);
    if (estado.success && (await cambiarEstado(id, estado.data))) {
      toast.success(`Guardado: ${NOMBRE_ESTADO_POSTULACION[estado.data]}.`);
    }
  }

  return (
    <section aria-labelledby="postulantes-titulo" className="flex flex-col gap-3">
      <h3 id="postulantes-titulo" className="text-lg font-semibold">
        Postulantes
      </h3>

      {loading && <Skeleton className="h-24 rounded-xl bg-muted" />}
      {error && <ErrorAlCargar que="los postulantes" mensaje={error} onReintentar={recargar} />}
      {postulaciones && postulaciones.length === 0 && (
        <p className="text-base text-muted-foreground">Todavía nadie se postuló a esta oferta.</p>
      )}
      <ErrorDelServidor error={errorCambio} />

      {postulaciones && postulaciones.length > 0 && (
        <ul className="flex flex-col divide-y rounded-xl ring-1 ring-foreground/10">
          {postulaciones.map((postulacion) => (
            <li key={postulacion.id} className="flex flex-col gap-3 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex min-w-0 flex-col gap-1">
                  <a
                    href={`mailto:${postulacion.postulante.email}`}
                    className="flex items-center gap-2 text-base font-medium break-all underline-offset-4 hover:underline"
                  >
                    <MailIcon aria-hidden="true" className="size-4 shrink-0 text-primary" />
                    {postulacion.postulante.email}
                  </a>
                  <p className="text-sm text-muted-foreground">Se postuló el {formatearDia(postulacion.postuladoEl)}</p>
                </div>
                <EstadoPostulacion estado={postulacion.estado} />
              </div>
              <div className="flex flex-wrap items-end gap-3">
                {postulacion.postulante.cv ? (
                  <a
                    href={`/api/admin/postulaciones/${encodeURIComponent(postulacion.id)}/cv`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonVariants({ variant: "outline" })}
                  >
                    <FileTextIcon data-icon="inline-start" aria-hidden="true" />
                    Ver CV
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">No subió CV</p>
                )}
                <div className="flex flex-col gap-1">
                  <label htmlFor={`estado-${postulacion.id}`} className="text-sm text-muted-foreground">
                    Estado
                  </label>
                  <SelectorNativo
                    id={`estado-${postulacion.id}`}
                    value={postulacion.estado}
                    onChange={(event) => void cambiar(postulacion.id, event.target.value)}
                    className="w-52"
                  >
                    {ESTADOS.map((estado) => (
                      <option key={estado} value={estado}>
                        {NOMBRE_ESTADO_POSTULACION[estado]}
                      </option>
                    ))}
                  </SelectorNativo>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
