"use client";

import { useState } from "react";
import { ShieldCheckIcon } from "lucide-react";
import { toast } from "sonner";

import { ErrorAlCargar } from "@/components/estados/ErrorAlCargar";
import { PedirIngreso } from "@/components/estados/PedirIngreso";
import { Skeleton } from "@/components/ui/skeleton";
import { usePerfilPostulante } from "@/hooks/usePerfilPostulante";
import type { PerfilPostulante as Perfil } from "@/lib/validation/postulante-perfil";

import { FormularioPerfilPostulante } from "./FormularioPerfilPostulante";
import { VistaPerfilPostulante } from "./VistaPerfilPostulante";

/**
 * "Datos del postulante" (P03). Loads the saved data with usePerfilPostulante.
 * If empty, shows the form directly. If it has data, shows the read-only view
 * with a button to edit.
 */
export function PerfilPostulante() {
  const { perfil, loading, error, sinAcceso, recargar, guardar, guardando, errorGuardado } = usePerfilPostulante();
  const [editando, setEditando] = useState(false);
  const [version, setVersion] = useState(0);

  async function handleGuardar(datos: Perfil) {
    const guardado = await guardar(datos);
    if (guardado) {
      toast.success("Guardaste tus datos personales.");
      setEditando(false);
      setVersion((v) => v + 1);
    }
    return guardado;
  }

  if (loading) {
    return (
      <div aria-busy="true" className="lg:max-w-[64%]">
        <span className="sr-only" role="status">
          Cargando los datos de tu perfil…
        </span>
        <Skeleton className="h-[36rem] rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card" />
      </div>
    );
  }

  if (sinAcceso) {
    return (
      <PedirIngreso
        rol="postulante"
        titulo="Ingresá como postulante"
        descripcion="Para cargar o cambiar tus datos personales."
      />
    );
  }

  if (error) {
    return <ErrorAlCargar que="tus datos" mensaje={error} onReintentar={recargar} />;
  }

  const mostrarFormulario = editando || !perfil;

  // The type of perfil from usePerfilPostulante has { slug, nombre } for rubros,
  // but Formulario/Vista expect just the slugs array for the `rubros` field,
  // so we adapt it here.
  const perfilAdaptado = perfil
    ? {
        nombre: perfil.nombre ?? "",
        apellido: perfil.apellido ?? "",
        telefono: perfil.telefono ?? "",
        dni: perfil.dni ?? "",
        email: perfil.email ?? "",
        rubros: perfil.rubros.map((r: { slug: import("@/lib/validation/rubros").Rubro }) => r.slug),
        tieneCv: perfil.tieneCv,
      }
    : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] lg:items-start">
      {mostrarFormulario ? (
        <FormularioPerfilPostulante
          key={version}
          perfil={perfilAdaptado}
          onGuardar={handleGuardar}
          guardando={guardando}
          error={errorGuardado}
        />
      ) : (
        <VistaPerfilPostulante perfil={perfilAdaptado!} onEditar={() => setEditando(true)} />
      )}
      
      <aside className="flex gap-3 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card p-5 ring-1 ring-foreground/5 lg:sticky lg:top-4">
        <ShieldCheckIcon aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-primary" />
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold">¿Quién ve estos datos?</h2>
          <p className="text-base text-muted-foreground">
            Solo la Oficina de Empleo. Las empresas <strong>nunca</strong> ven tu información personal, ni cómo te llamás ni tu DNI.
          </p>
        </div>
      </aside>
    </div>
  );
}
