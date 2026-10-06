import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type Props = {
  error?: string;
  obligatorio?: boolean;
};

export function CampoNombre({ error, obligatorio = false }: Props) {
  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor="nombre" className="text-base">
        Nombre
        {obligatorio && <span className="ml-1 text-destructive">*</span>}
      </FieldLabel>
      <Input
        id="nombre"
        name="nombre"
        type="text"
        autoComplete="given-name"
        required={obligatorio ? true : undefined}
        placeholder="Tu nombre"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "nombre-error" : undefined}
      />
      <FieldError id="nombre-error">{error}</FieldError>
    </Field>
  );
}
