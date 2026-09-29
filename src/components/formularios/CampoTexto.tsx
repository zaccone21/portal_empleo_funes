import type { HTMLAttributes } from "react";

import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  /** Also the name the form reads with FormData. */
  id: string;
  label: string;
  /** Help under the label, for example an example value. Never a replacement for the label. */
  descripcion?: string;
  /** Message to show under the field; the field is marked invalid while it is set. */
  error?: string;
  /** Several lines (textarea) instead of one. */
  multilinea?: boolean;
  defaultValue?: string;
  autoComplete?: string;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
};

/**
 * Labeled text field for the portal's forms (AGENTS §10): visible label,
 * optional help, and the error under the field linked with aria-describedby
 * and aria-invalid. Uncontrolled: the form reads it with FormData under `id`.
 * Text is 16px also on desktop (the Textarea primitive drops to 14px from
 * `md`), and textareas start tall enough for a paragraph.
 */
export function CampoTexto({
  id,
  label,
  descripcion,
  error,
  multilinea = false,
  defaultValue,
  autoComplete,
  inputMode,
  maxLength,
}: Props) {
  const idDescripcion = `${id}-descripcion`;
  const idError = `${id}-error`;
  const describedBy =
    [descripcion ? idDescripcion : null, error ? idError : null].filter(Boolean).join(" ") || undefined;

  const comunes = {
    id,
    name: id,
    defaultValue,
    maxLength,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
  };

  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor={id} className="text-base">
        {label}
      </FieldLabel>
      {descripcion && <FieldDescription id={idDescripcion}>{descripcion}</FieldDescription>}
      {multilinea ? (
        <Textarea {...comunes} className="min-h-32 px-3 md:text-base" />
      ) : (
        <Input {...comunes} autoComplete={autoComplete} inputMode={inputMode} />
      )}
      <FieldError id={idError}>{error}</FieldError>
    </Field>
  );
}
