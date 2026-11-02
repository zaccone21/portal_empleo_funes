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
 * y las tarjetas de contacto principal (nombre, teléfono y correo).
 */
export function VistaPerfilEmpresa({ perfil, onEditar }: Props) {
  return (
    <div className="flex flex-col gap-8 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card p-6 shadow-sm ring-1 ring-foreground/10 sm:p-8">
      {/* Cabecera con Nombre y CUIT */}
      <div className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground">
            {perfil.razonSocial}
          </h1>
          <div className="inline-flex items-center gap-2">
            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
              CUIT registrado
            </span>
            <span className="text-sm font-semibold text-muted-foreground tabular-nums">{perfil.cuit}</span>
          </div>
        </div>
        <Button onClick={onEditar} size="lg" className="w-full font-bold shadow-sm sm:w-auto">
          Editar datos
        </Button>
      </div>

      {/* Sección Descripción */}
      <div className="flex flex-col gap-2 rounded-xl bg-muted/60 p-5 ring-1 ring-foreground/10">
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          A qué se dedica la empresa
        </span>
        <p className="whitespace-pre-wrap text-base font-normal leading-relaxed text-foreground/90">
          {perfil.descripcion || <span className="italic text-muted-foreground">Sin descripción cargada</span>}
        </p>
      </div>

      {/* Sección Contacto */}
      <div className="flex flex-col gap-4">
        <h2 className="font-heading text-xl font-bold tracking-tight">Persona de contacto</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-4 rounded-xl bg-background p-4 shadow-xs ring-1 ring-foreground/10">
            <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
              <BuildingIcon aria-hidden="true" className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-muted-foreground">Nombre y apellido</span>
              <span className="text-base font-bold text-foreground">{perfil.contactoNombre}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl bg-background p-4 shadow-xs ring-1 ring-foreground/10">
            <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
              <PhoneIcon aria-hidden="true" className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-muted-foreground">Teléfono</span>
              <span className="text-base font-bold text-foreground tabular-nums">{perfil.contactoTelefono}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl bg-background p-4 shadow-xs ring-1 ring-foreground/10 sm:col-span-2">
            <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
              <MailIcon aria-hidden="true" className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-muted-foreground">Correo electrónico</span>
              <span className="text-base font-bold text-foreground">{perfil.contactoEmail}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
