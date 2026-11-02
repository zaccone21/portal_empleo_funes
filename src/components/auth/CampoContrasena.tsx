"use client";

import { useState } from "react";
import { CheckIcon, EyeIcon, EyeOffIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { evaluarFuerzaContrasena, type NivelFuerzaContrasena } from "@/lib/validation/auth";

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
  /** Shows the non-blocking visual strength indicator (Débil / Regular / Segura). */
  mostrarFuerza?: boolean;
};

const COLOR_BARRA: Record<Exclude<NivelFuerzaContrasena, "vacia">, string> = {
  debil: "bg-destructive",
  regular: "bg-amber-500",
  segura: "bg-primary",
};

const COLOR_TEXTO: Record<Exclude<NivelFuerzaContrasena, "vacia">, string> = {
  debil: "text-destructive",
  regular: "text-amber-700",
  segura: "text-primary",
};

/**
 * Password field with a "Mostrar contraseña" button and an optional visual
 * strength indicator (`mostrarFuerza`) for registration and password reset.
 *
 * The button keeps the same label and reports its state with `aria-pressed`
 * (the accessible toggle pattern), and it is `type="button"` so pressing it
 * never submits the form.
 */
export function CampoContrasena({
  id,
  name,
  label,
  autoComplete,
  descripcion,
  error,
  obligatorio = false,
  mostrarFuerza = false,
}: Props) {
  const [visible, setVisible] = useState(false);
  const [valor, setValor] = useState("");

  const idDescripcion = `${id}-descripcion`;
  const idError = `${id}-error`;
  const idFuerza = `${id}-fuerza`;
  const evaluacion = mostrarFuerza ? evaluarFuerzaContrasena(valor) : null;
  const mostrarIndicador = Boolean(evaluacion && evaluacion.nivel !== "vacia");

  const describedBy =
    [
      descripcion ? idDescripcion : null,
      mostrarIndicador ? idFuerza : null,
      error ? idError : null,
    ]
      .filter(Boolean)
      .join(" ") || undefined;

  const requisitos = evaluacion
    ? [
        { clave: "longitud", texto: "8+ caract.", cumplido: evaluacion.requisitos.longitud },
        { clave: "minuscula", texto: "Minúscula", cumplido: evaluacion.requisitos.minuscula },
        { clave: "mayuscula", texto: "Mayúscula", cumplido: evaluacion.requisitos.mayuscula },
        { clave: "numero", texto: "Número", cumplido: evaluacion.requisitos.numero },
        { clave: "simbolo", texto: "Especial (!@#)", cumplido: evaluacion.requisitos.simbolo },
      ]
    : [];

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
          onChange={mostrarFuerza ? (e) => setValor(e.target.value) : undefined}
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
      {mostrarIndicador && evaluacion && evaluacion.nivel !== "vacia" && (
        <div id={idFuerza} className="mt-1.5 flex flex-col gap-1.5" aria-live="polite">
          <div className="flex items-center gap-2">
            <div className="flex flex-1 gap-1.5" aria-hidden="true">
              {[1, 2, 3].map((indice) => (
                <div
                  key={indice}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    indice <= evaluacion.barrasActivas
                      ? COLOR_BARRA[evaluacion.nivel as Exclude<NivelFuerzaContrasena, "vacia">]
                      : "bg-border"
                  }`}
                />
              ))}
            </div>
            <span
              className={`text-xs font-semibold ${
                COLOR_TEXTO[evaluacion.nivel as Exclude<NivelFuerzaContrasena, "vacia">]
              }`}
            >
              {evaluacion.etiqueta}
            </span>
          </div>
          {evaluacion.motivoDebil && (
            <p className="text-xs text-destructive">{evaluacion.motivoDebil}</p>
          )}
          <ul className="flex flex-wrap gap-x-2.5 gap-y-1 text-xs" aria-label="Requisitos de seguridad">
            {requisitos.map((item) => (
              <li
                key={item.clave}
                className={`inline-flex items-center gap-1 transition-colors ${
                  item.cumplido ? "font-medium text-primary" : "text-muted-foreground"
                }`}
              >
                <CheckIcon
                  className={`size-3 shrink-0 ${item.cumplido ? "opacity-100" : "opacity-35"}`}
                  aria-hidden="true"
                />
                <span>{item.texto}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {descripcion && <FieldDescription id={idDescripcion}>{descripcion}</FieldDescription>}
      <FieldError id={idError}>{error}</FieldError>
    </Field>
  );
}
