import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type Props = {
  error?: string;
  obligatorio?: boolean;
};

export function CampoApellido({ error, obligatorio = false }: Props) {
  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor="apellido" className="text-base">
        Apellido
        {obligatorio && <span className="ml-1 text-destructive">*</span>}
      </FieldLabel>
      <Input
        id="apellido"
        name="apellido"
        type="text"
        autoComplete="family-name"
        required={obligatorio ? true : undefined}
        placeholder="Tu apellido"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "apellido-error" : undefined}
      />
      <FieldError id="apellido-error">{error}</FieldError>
    </Field>
  );
}
