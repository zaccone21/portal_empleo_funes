import { FileTextIcon } from "lucide-react";

import { formatearDia } from "@/lib/fechas";
import { formatearTamano, type CvPropio } from "@/lib/validation/cv";

/**
 * The CV the applicant already uploaded: name, size and date. There is no
 * "ver" or "descargar" on purpose: only the Office opens CVs, through
 * short-lived signed URLs (RNF1).
 */
export function TarjetaCvActual({ cv }: { cv: CvPropio }) {
  return (
    <section
      aria-labelledby="cv-actual-titulo"
      className="flex items-start gap-4 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card p-5 ring-1 ring-foreground/5"
    >
      <span
        aria-hidden="true"
        className="flex size-12 shrink-0 items-center justify-center rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm bg-secondary text-primary"
      >
        <FileTextIcon className="size-6" />
      </span>
      <div className="flex min-w-0 flex-col gap-1">
        <h2 id="cv-actual-titulo" className="text-xl font-semibold">
          Tu CV
        </h2>
        <p className="truncate text-base">{cv.nombre}</p>
        <p className="text-sm text-muted-foreground">
          PDF de {formatearTamano(cv.tamanoBytes)}. Lo subiste el {formatearDia(cv.subidoEl)}.
        </p>
      </div>
    </section>
  );
}
