import { BuildingIcon, MailIcon, PhoneIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PerfilEmpresa } from "@/lib/validation/empresa";

type Props = {
  perfil: PerfilEmpresa;
  onEditar: () => void;
};

/**
 * Ficha de datos de la empresa (P10, RF1.3.2).
 * Muestra la razón social, CUIT registrado, descripción de actividad
 * y las tarjetas de contacto principal con contención estricta para pantallas móviles.
 */
export function VistaPerfilEmpresa({ perfil, onEditar }: Props) {
  return (
    <div className="flex w-full max-w-full min-w-0 flex-col gap-6 overflow-hidden rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card p-4 shadow-sm ring-1 ring-foreground/10 sm:gap-8 sm:p-8">
      {/* Cabecera con Nombre y CUIT */}
      <div className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground break-words sm:text-3xl">
            {perfil.razonSocial}
          </h1>
          <div className="inline-flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
              CUIT registrado
            </span>
            <span className="text-sm font-semibold text-muted-foreground tabular-nums">{perfil.cuit}</span>
          </div>
        </div>
        <Button onClick={onEditar} size="lg" className="w-full shrink-0 font-bold shadow-sm sm:w-auto">
          Editar datos
        </Button>
      </div>

      {/* Sección Descripción */}
      <div className="flex flex-col gap-2 rounded-xl bg-muted/60 p-4 ring-1 ring-foreground/10 sm:p-5">
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          A qué se dedica la empresa
        </span>
        <p className="whitespace-pre-wrap text-base font-normal leading-relaxed text-foreground/90 break-words">
          {perfil.descripcion || <span className="italic text-muted-foreground">Sin descripción cargada</span>}
        </p>
      </div>

      {/* Sección Contacto */}
      <div className="flex flex-col gap-4">
        <h2 className="font-heading text-lg font-bold tracking-tight sm:text-xl">Persona de contacto</h2>
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          <div className="flex min-w-0 items-center gap-3.5 rounded-xl bg-background p-3.5 shadow-xs ring-1 ring-foreground/10 sm:p-4">
            <div className="rounded-lg bg-primary/10 p-2 text-primary shrink-0 sm:p-2.5">
              <BuildingIcon aria-hidden="true" className="size-5" />
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="text-xs font-semibold text-muted-foreground">Nombre y apellido</span>
              <span className="truncate text-base font-bold text-foreground">{perfil.contactoNombre}</span>
            </div>
          </div>

          <div className="flex min-w-0 items-center gap-3.5 rounded-xl bg-background p-3.5 shadow-xs ring-1 ring-foreground/10 sm:p-4">
            <div className="rounded-lg bg-primary/10 p-2 text-primary shrink-0 sm:p-2.5">
              <PhoneIcon aria-hidden="true" className="size-5" />
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="text-xs font-semibold text-muted-foreground">Teléfono</span>
              <span className="truncate text-base font-bold text-foreground tabular-nums">{perfil.contactoTelefono}</span>
            </div>
          </div>

          <div className="flex min-w-0 items-center gap-3.5 rounded-xl bg-background p-3.5 shadow-xs ring-1 ring-foreground/10 sm:col-span-2 sm:p-4">
            <div className="rounded-lg bg-primary/10 p-2 text-primary shrink-0 sm:p-2.5">
              <MailIcon aria-hidden="true" className="size-5" />
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="text-xs font-semibold text-muted-foreground">Correo electrónico</span>
              <span className="truncate text-base font-bold text-foreground break-all">{perfil.contactoEmail}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
