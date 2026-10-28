import Link from "next/link";
import { ShieldCheckIcon } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError } from "@/components/ui/field";

type Props = {
  /** Message under the field; the box is marked invalid while it is set. */
  error?: string;
  marcado: boolean;
  onCambio: (marcado: boolean) => void;
};

/**
 * Required consent box of the registration forms. The form keeps
 * its state.
 * The text says in one sentence what the data is for and links to the full
 * notice (`/privacidad`) in a new tab, so the person does not lose the form.
 */
export function CampoConsentimiento({ error, marcado, onCambio }: Props) {
  return (
    <Field data-invalid={error ? true : undefined}>
      <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-3.5">
        <Checkbox
          id="aceptaPrivacidad"
          checked={marcado}
          onCheckedChange={onCambio}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "aceptaPrivacidad-error" : undefined}
          className="mt-0.5 size-6 rounded-md"
        />
        <label htmlFor="aceptaPrivacidad" className="flex flex-col gap-1 text-base leading-snug text-foreground">
          <span className="inline-flex items-center gap-1.5 font-semibold">
            <ShieldCheckIcon aria-hidden="true" className="size-4 text-primary" />
            Acepto el uso de mis datos
          </span>
          <span className="text-sm text-muted-foreground">
            La Oficina de Empleo usa tus datos solo para ayudarte a conseguir trabajo.{" "}
            <Link
              href="/privacidad"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline underline-offset-2"
            >
              Leer cómo los cuidamos
            </Link>
            .
          </span>
        </label>
      </div>
      <FieldError id="aceptaPrivacidad-error">{error}</FieldError>
    </Field>
  );
}
