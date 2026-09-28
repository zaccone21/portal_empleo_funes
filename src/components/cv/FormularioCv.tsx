"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { UploadIcon } from "lucide-react";

import { ErrorDelServidor } from "@/components/auth/ErrorDelServidor";
import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { CV_TAMANO_MAXIMO_BYTES, formatearTamano, validarArchivoCv } from "@/lib/validation/cv";

type Props = {
  /** There is a CV already: the texts talk about replacing it. */
  tieneCv: boolean;
  /** Uploads the file; resolves to true when it worked. */
  onSubir: (archivo: File) => Promise<boolean>;
  subiendo: boolean;
  /** Server message of the last failed upload. */
  error: string | null;
};

/**
 * Picks and uploads the CV (P04, RF1.2.3).
 *
 * Flow:
 * 1. The big dashed box is the <label> of a visually hidden file input, so
 *    tapping anywhere on it opens the phone's file picker, and keyboards
 *    reach the input itself (its focus ring is drawn on the box).
 * 2. When a file is chosen it is checked at once with validarArchivoCv
 *    (PDF, size, "%PDF-" bytes). A bad file is rejected before uploading, with
 *    the reason under the box; the server checks again anyway.
 * 3. "Subir CV" sends it. While it uploads the button is disabled. On success
 *    the form clears, ready for a future replacement.
 */
export function FormularioCv({ tieneCv, onSubir, subiendo, error }: Props) {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [errorArchivo, setErrorArchivo] = useState<string | null>(null);
  const [validando, setValidando] = useState(false);

  async function handleCambio(event: ChangeEvent<HTMLInputElement>) {
    const elegido = event.target.files?.[0] ?? null;
    setArchivo(null);
    setErrorArchivo(null);
    if (!elegido) return;

    setValidando(true);
    const problema = await validarArchivoCv(elegido);
    setValidando(false);
    if (problema) {
      setErrorArchivo(problema);
    } else {
      setArchivo(elegido);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formulario = event.currentTarget;
    if (!archivo) {
      setErrorArchivo("Elegí un archivo PDF.");
      return;
    }
    if (await onSubir(archivo)) {
      setArchivo(null);
      formulario.reset();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-5 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card p-5 ring-1 ring-foreground/5 sm:p-6"
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold">{tieneCv ? "Reemplazar tu CV" : "Subí tu CV"}</h2>
        <p className="text-base text-muted-foreground">
          {tieneCv
            ? "El archivo nuevo reemplaza al anterior."
            : "Lo necesitás para postularte a las ofertas."}
        </p>
      </div>
      <Field data-invalid={errorArchivo ? true : undefined}>
        <input
          id="archivo-cv"
          name="archivo"
          type="file"
          accept="application/pdf,.pdf"
          onChange={handleCambio}
          aria-invalid={errorArchivo ? true : undefined}
          aria-describedby={errorArchivo ? "archivo-cv-error" : undefined}
          className="peer sr-only"
        />
        <label
          htmlFor="archivo-cv"
          className={cn(
            "flex cursor-pointer flex-col items-center gap-3 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md border-2 border-dashed border-input bg-muted px-4 py-8 text-center",
            "hover:border-primary peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50",
            errorArchivo && "border-destructive",
          )}
        >
          <span
            aria-hidden="true"
            className="flex size-14 items-center justify-center rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm bg-secondary text-primary"
          >
            <UploadIcon className="size-7" />
          </span>
          <span className="max-w-full truncate font-heading text-lg font-semibold">
            {archivo ? archivo.name : "Elegí tu CV en PDF"}
          </span>
          <span className="text-base text-muted-foreground">
            {archivo
              ? `${formatearTamano(archivo.size)}. Tocá acá para elegir otro.`
              : `Solo PDF, hasta ${formatearTamano(CV_TAMANO_MAXIMO_BYTES)}.`}
          </span>
        </label>
        <FieldError id="archivo-cv-error" className="text-base">
          {errorArchivo}
        </FieldError>
      </Field>
      <ErrorDelServidor error={error} />
      <Button type="submit" size="lg" className="w-full sm:w-auto sm:self-start" disabled={subiendo || validando}>
        {subiendo && <Spinner data-icon="inline-start" aria-hidden="true" />}
        {subiendo ? "Subiendo…" : tieneCv ? "Reemplazar CV" : "Subir CV"}
      </Button>
    </form>
  );
}
