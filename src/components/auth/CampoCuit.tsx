import { Field, FieldError, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type Props = {
  /** Message to show under the field; the field is marked invalid while it is set. */
  error?: string;
};

/**
 * CUIT field for company registration. Uncontrolled (reads from FormData "cuit").
 * Uses inputMode="numeric" to open the number pad on mobile.
 */
export function CampoCuit({ error }: Props) {
  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor="cuit" className="text-base">
        CUIT de la empresa
      </FieldLabel>
      <FieldDescription id="cuit-descripcion">
        11 números, con o sin guiones.
      </FieldDescription>
      <Input
        id="cuit"
        name="cuit"
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder="Ej: 30-12345678-9"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "cuit-error cuit-descripcion" : "cuit-descripcion"}
      />
      <FieldError id="cuit-error">{error}</FieldError>
    </Field>
  );
}
