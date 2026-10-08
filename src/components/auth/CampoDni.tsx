import { Field, FieldError, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type Props = {
  /** Message to show under the field; the field is marked invalid while it is set. */
  error?: string;
  obligatorio?: boolean;
};

/**
 * DNI field for applicant registration. Uncontrolled (reads from FormData "dni").
 * Uses inputMode="numeric" to open the number pad on mobile.
 */
export function CampoDni({ error, obligatorio = false }: Props) {
  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor="dni" className="text-base">
        DNI
        {obligatorio && <span className="ml-1 text-destructive">*</span>}
      </FieldLabel>
      <FieldDescription id="dni-descripcion">
        7 u 8 números, sin puntos.
      </FieldDescription>
      <Input
        id="dni"
        name="dni"
        type="text"
        inputMode="numeric"
        autoComplete="off"
        required={obligatorio ? true : undefined}
        placeholder="Ej: 38123456"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "dni-error dni-descripcion" : "dni-descripcion"}
      />
      <FieldError id="dni-error">{error}</FieldError>
    </Field>
  );
}
