"use client";

import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type Props = {
  id: string;
  /** Name the form reads with FormData. */
  name: string;
  label: string;
  /** "current-password" when logging in, "new-password" when creating one (lets the phone suggest or save it). */
  autoComplete: "current-password" | "new-password";
  descripcion?: string;
  error?: string;
  obligatorio?: boolean;
};

/**
 * Password field with a "Mostrar contraseña" button. Typing a password
 * without seeing it is a common source of mistakes for people with little
 * digital experience, so they can check what they typed (RNF3).
 *
 * The button keeps the same label and reports its state with `aria-pressed`
 * (the accessible toggle pattern), and it is `type="button"` so pressing it
 * never submits the form. The input is uncontrolled; only the visibility is
 * state.
 */
export function CampoContrasena({ id, name, label, autoComplete, descripcion, error, obligatorio = false }: Props) {
  const [visible, setVisible] = useState(false);

  const idDescripcion = `${id}-descripcion`;
  const idError = `${id}-error`;
  const describedBy =
    [descripcion ? idDescripcion : null, error ? idError : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor={id} className="text-base">
        {label}
        {obligatorio && <span className="ml-1 text-destructive">*</span>}
      </FieldLabel>
      <div className="relative">
        <Input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          required={obligatorio ? true : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className="pr-12"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute inset-y-0 right-0"
          aria-label="Mostrar contraseña"
          aria-pressed={visible}
          aria-controls={id}
          onClick={() => setVisible((actual) => !actual)}
        >
          {visible ? <EyeOffIcon aria-hidden="true" /> : <EyeIcon aria-hidden="true" />}
        </Button>
      </div>
      {descripcion && <FieldDescription id={idDescripcion}>{descripcion}</FieldDescription>}
      <FieldError id={idError}>{error}</FieldError>
    </Field>
  );
}
