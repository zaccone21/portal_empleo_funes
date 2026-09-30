"use client";

import { useState } from "react";
import { ShieldCheckIcon } from "lucide-react";
import { toast } from "sonner";

import { ErrorAlCargar } from "@/components/estados/ErrorAlCargar";
import { PedirIngreso } from "@/components/estados/PedirIngreso";
import { Skeleton } from "@/components/ui/skeleton";
import { usePerfilEmpresa } from "@/hooks/usePerfilEmpresa";
import type { PerfilEmpresa as Perfil } from "@/lib/validation/empresa";

import { FormularioPerfilEmpresa } from "./FormularioPerfilEmpresa";

/**
 * "Datos de la empresa" (P10). Loads the saved data with usePerfilEmpresa and
 * shows the form filled in (or empty the first time).
 *
 * After a successful save the form is mounted again (`version`) with what the
 * server saved, so normalized values show as stored (for example the CUIT
 * with dashes), and a toast confirms it.
 */
export function PerfilEmpresa() {
  const { perfil, loading, error, sinAcceso, recargar, guardar, guardando, errorGuardado } =
    usePerfilEmpresa();
  const [version, setVersion] = useState(0);

  async function handleGuardar(datos: Perfil) {
    const guardado = await guardar(datos);
    if (guardado) {
      toast.success("Guardaste los datos de la empresa.");
      setVersion((n) => n + 1);
    }
    return guardado;
  }

  if (loading) {
    return (
      <div aria-busy="true" className="lg:max-w-[64%]">
        <span className="sr-only" role="status">
          Cargando los datos de la empresa…
        </span>
        <Skeleton className="h-[36rem] rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card" />
      </div>
    );
  }

  if (sinAcceso) {
    return (
      <PedirIngreso
        rol="empresa"
        titulo="Ingresá como empresa"
        descripcion="Para cargar o cambiar los datos de tu empresa."
      />
    );
  }

  if (error) {
    return <ErrorAlCargar que="los datos de la empresa" mensaje={error} onReintentar={recargar} />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] lg:items-start">
      <FormularioPerfilEmpresa
        key={version}
        perfil={perfil ?? null}
        onGuardar={handleGuardar}
        guardando={guardando}
        error={errorGuardado}
      />
      <aside className="flex gap-3 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card p-5 ring-1 ring-foreground/5 lg:sticky lg:top-4">
        <ShieldCheckIcon aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-primary" />
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold">¿Quién ve estos datos?</h2>
          <p className="text-base text-muted-foreground">
            Solo la Oficina de Empleo. La usa para comunicarse con ustedes cuando tiene candidatos
            para una búsqueda.
          </p>
        </div>
      </aside>
    </div>
  );
}
