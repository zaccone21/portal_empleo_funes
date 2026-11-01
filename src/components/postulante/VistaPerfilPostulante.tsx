"use client";

import { PencilIcon } from "lucide-react";
import { IconoRubro } from "@/components/ofertas/IconoRubro";
import { Button } from "@/components/ui/button";
import { NOMBRE_RUBRO, type Rubro } from "@/lib/validation/rubros";

type PerfilVistaProps = {
  perfil: {
    nombre: string;
    apellido: string;
    dni?: string;
    telefono: string;
    direccion: string;
    email?: string;
    rubros: Rubro[];
    experiencia?: string;
    fotoUrl?: string;
  };
  onEditar: () => void;
};

export function VistaPerfilPostulante({ perfil, onEditar }: PerfilVistaProps) {
  return (
    <div className="flex flex-col gap-6 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card p-5 ring-1 ring-foreground/5 sm:p-7">
      <div className="flex items-center justify-between border-b pb-4">
        {/* --- FOTO Y CABECERA DEL PERFIL --- */}
        <div className="flex items-center gap-4">
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted">
            {perfil.fotoUrl ? (
              <img src={perfil.fotoUrl} alt="Foto de perfil" className="h-full w-full object-cover" />
            ) : (
              <span className="text-2xl text-muted-foreground">👤</span>
            )}
          </div>
          <div>
            <h2 className="font-heading text-xl font-bold text-foreground">
              {perfil.nombre} {perfil.apellido}
            </h2>
            {perfil.email && <p className="text-sm text-muted-foreground">{perfil.email}</p>}
          </div>
        </div>

        <Button type="button" variant="outline" size="sm" onClick={onEditar}>
          <PencilIcon className="mr-2 size-4" />
          Editar perfil
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <span className="text-xs font-medium text-muted-foreground">Teléfono</span>
          <p className="text-base text-foreground">{perfil.telefono}</p>
        </div>
        <div>
          <span className="text-xs font-medium text-muted-foreground">Dirección</span>
          <p className="text-base text-foreground">{perfil.direccion}</p>
        </div>
      </div>

      {perfil.rubros.length > 0 && (
        <div>
          <span className="mb-2 block text-xs font-medium text-muted-foreground">Rubros de interés</span>
          <div className="flex flex-wrap gap-2">
            {perfil.rubros.map((rubro) => (
              <span key={rubro} className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                <IconoRubro rubro={rubro} className="size-3.5" />
                {NOMBRE_RUBRO[rubro]}
              </span>
            ))}
          </div>
        </div>
      )}

      {perfil.experiencia && (
        <div>
          <span className="text-xs font-medium text-muted-foreground">Experiencia laboral</span>
          <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{perfil.experiencia}</p>
        </div>
      )}
    </div>
  );
}