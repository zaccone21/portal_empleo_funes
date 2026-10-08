import { FileTextIcon, MailIcon, PhoneIcon } from "lucide-react";

import { IconoRubro } from "@/components/ofertas/IconoRubro";
import { Button } from "@/components/ui/button";
import { NOMBRE_RUBRO, type Rubro } from "@/lib/validation/rubros";

type Props = {
  perfil: {
    nombre: string;
    apellido: string;
    dni: string;
    telefono: string;
    email?: string;
    rubros: Rubro[];
    tieneCv: boolean;
  };
  onEditar: () => void;
};

export function VistaPerfilPostulante({ perfil, onEditar }: Props) {
  const dniOculto = perfil.dni ? `••••••${perfil.dni.slice(-2)}` : "Sin DNI";

  return (
    <div className="flex flex-col gap-8 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card p-5 ring-1 ring-foreground/5 sm:p-7">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-2xl font-bold text-foreground">
            {perfil.nombre} {perfil.apellido}
          </h2>
          <p className="text-base text-muted-foreground">DNI {dniOculto}</p>
        </div>
        <Button onClick={onEditar} variant="outline" className="w-full sm:w-auto">
          Editar datos
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex items-start gap-3">
          <MailIcon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-muted-foreground">Correo electrónico</span>
            <span className="font-medium text-foreground">{perfil.email || "No especificado"}</span>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <PhoneIcon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-muted-foreground">Teléfono</span>
            {perfil.telefono ? (
              <span className="font-medium">{perfil.telefono}</span>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">No se agregó teléfono</span>
                <Button variant="link" onClick={onEditar} className="h-auto p-0 text-sm font-medium text-primary">
                  Agregar
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-start gap-3 sm:col-span-2">
          <FileTextIcon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-muted-foreground">Curriculum (CV)</span>
            {perfil.tieneCv ? (
              <div className="flex items-center gap-2">
                <a
                  href="/api/cv/archivo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:underline"
                >
                  Ver archivo
                </a>
                <span aria-hidden="true" className="text-muted-foreground/30">•</span>
                <a href="#cv" className="text-sm font-medium text-muted-foreground hover:underline">
                  Gestionar CV
                </a>
              </div>
            ) : (
              <a href="#cv" className="font-medium text-destructive underline-offset-4 hover:underline">
                Sin CV — subilo acá
              </a>
            )}
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">Rubros elegidos ({perfil.rubros.length})</h3>
        {perfil.rubros.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {perfil.rubros.map((rubro) => (
              <div
                key={rubro}
                className="flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1.5 text-sm font-medium text-foreground"
              >
                <IconoRubro rubro={rubro} className="size-4 text-primary" />
                {NOMBRE_RUBRO[rubro]}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-lg border border-dashed border-border/60 bg-muted/20 p-4 text-muted-foreground">
            <span className="text-sm">No elegiste rubros todavía.</span>
            <Button variant="link" onClick={onEditar} className="h-auto p-0 text-sm font-medium text-primary">
              Elegir rubros
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
