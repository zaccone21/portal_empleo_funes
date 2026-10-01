import { TarjetaSeleccionable } from "@/components/marca/TarjetaSeleccionable";
import { formatearDia } from "@/lib/fechas";
import type { PostulacionPropia } from "@/lib/validation/postulaciones";

/**
 * The applicant's application history (P07, RF1.2.4): which offer and when,
 * newest first as the server sends them. It shows no status on purpose: the
 * Office's evaluation is internal.
 *
 * Each application is a link to its offer (/ofertas?oferta=<id>), so the
 * person can read it again in one tap. If the offer was closed meanwhile,
 * the offers screen says so.
 */
export function ListaPostulaciones({ postulaciones }: { postulaciones: PostulacionPropia[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {postulaciones.map((postulacion) => (
        <li key={postulacion.id}>
          <TarjetaSeleccionable
            href={`/ofertas?oferta=${encodeURIComponent(postulacion.oferta.id)}`}
            seleccionada={false}
            soloEnEscritorio={false}
          >
            <h2 className="font-heading text-lg leading-snug font-semibold">{postulacion.oferta.titulo}</h2>
            <p className="-mt-2 text-base text-muted-foreground">{postulacion.oferta.lugar}</p>
            <p className="text-sm text-muted-foreground">
              Te postulaste el {formatearDia(postulacion.postuladoEl)}
            </p>
          </TarjetaSeleccionable>
        </li>
      ))}
    </ul>
  );
}
