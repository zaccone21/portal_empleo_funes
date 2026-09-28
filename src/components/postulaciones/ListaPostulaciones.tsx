import { BriefcaseBusinessIcon } from "lucide-react";

import { formatearDia } from "@/lib/fechas";
import type { PostulacionPropia } from "@/lib/validation/postulaciones";

/**
 * The applicant's application history (P07, RF1.2.4): which offer and when,
 * newest first as the server sends them. It shows no status on purpose: the
 * Office's evaluation is internal. The small mint tile echoes the trade
 * mosaic (D-022).
 */
export function ListaPostulaciones({ postulaciones }: { postulaciones: PostulacionPropia[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {postulaciones.map((postulacion) => (
        <li
          key={postulacion.id}
          className="flex items-start gap-4 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card p-5 ring-1 ring-foreground/5"
        >
          <span
            aria-hidden="true"
            className="flex size-12 shrink-0 items-center justify-center rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm bg-secondary text-primary"
          >
            <BriefcaseBusinessIcon className="size-6" />
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <h2 className="font-heading text-lg leading-snug font-semibold">{postulacion.oferta.titulo}</h2>
            <p className="text-base text-muted-foreground">{postulacion.oferta.lugar}</p>
            <p className="text-sm text-muted-foreground">
              Te postulaste el {formatearDia(postulacion.postuladoEl)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
