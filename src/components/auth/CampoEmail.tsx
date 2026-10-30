import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type Props = {
  /** Message to show under the field; the field is marked invalid while it is set. */
  error?: string;
  obligatorio?: boolean;
  /** Optional custom label (e.g. "Email o DNI", "Email o CUIT"). Defaults to "Email". */
  label?: string;
  /** Optional placeholder example. */
  placeholder?: string;
  /** When true, uses `type="text"` so the user can enter either an email or a DNI/CUIT. */
  permitirDocumento?: boolean;
};

/**
 * Email (or document) field of the access forms. It is uncontrolled (the form
 * reads it with FormData under the name "email").
 * The error is linked with aria-describedby so screen readers read it with
 * the field.
 */
export function CampoEmail({
  error,
  obligatorio = false,
  label = "Email",
  placeholder,
  permitirDocumento = false,
}: Props) {
  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor="email" className="text-base">
        {label}
        {obligatorio && <span className="ml-1 text-destructive">*</span>}
      </FieldLabel>
      <Input
        id="email"
        name="email"
        type={permitirDocumento ? "text" : "email"}
        inputMode={permitirDocumento ? "text" : "email"}
        autoComplete="username"
        autoCapitalize="none"
        spellCheck={false}
        placeholder={placeholder}
        required={obligatorio ? true : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "email-error" : undefined}
      />
      <FieldError id="email-error">{error}</FieldError>
    </Field>
  );
}
