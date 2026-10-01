import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type Props = {
  /** Message to show under the field; the field is marked invalid while it is set. */
  error?: string;
};

/**
 * Email field of the access forms. It is uncontrolled (the form reads it with
 * FormData under the name "email"). The attributes help on cheap phones:
 * `type="email"` and `inputMode` open the keyboard with "@", and
 * `autoCapitalize="none"` stops the first letter from becoming uppercase.
 * The error is linked with aria-describedby so screen readers read it with
 * the field.
 */
export function CampoEmail({ error }: Props) {
  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor="email" className="text-base">
        Email
      </FieldLabel>
      <Input
        id="email"
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        spellCheck={false}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "email-error" : undefined}
      />
      <FieldError id="email-error">{error}</FieldError>
    </Field>
  );
}
