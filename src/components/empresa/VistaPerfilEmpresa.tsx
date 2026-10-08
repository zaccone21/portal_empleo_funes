import { BuildingIcon, MailIcon, PhoneIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PerfilEmpresa } from "@/lib/validation/empresa";

type Props = {
  perfil: PerfilEmpresa;
  onEditar: () => void;
};

export function VistaPerfilEmpresa({ perfil, onEditar }: Props) {
  return (
    <div className="flex flex-col gap-8 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card p-5 ring-1 ring-foreground/5 sm:p-7">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-bold">{perfil.razonSocial}</h1>
          <p className="text-muted-foreground">CUIT {perfil.cuit}</p>
        </div>
        <Button onClick={onEditar} variant="outline" className="w-full sm:w-auto">
          Editar datos
        </Button>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-muted-foreground">A qué se dedica</span>
        <p className="whitespace-pre-wrap">{perfil.descripcion || <span className="text-muted-foreground italic">Sin descripción</span>}</p>
      </div>

      <div className="border-t pt-6">
        <h2 className="mb-4 font-heading text-lg font-semibold">Persona de contacto</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <BuildingIcon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">Nombre</span>
              <span className="font-medium">{perfil.contactoNombre}</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <PhoneIcon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">Teléfono</span>
              <span className="font-medium">{perfil.contactoTelefono}</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MailIcon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">Email</span>
              <span className="font-medium">{perfil.contactoEmail}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
