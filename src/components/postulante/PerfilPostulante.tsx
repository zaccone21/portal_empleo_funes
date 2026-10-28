"use client";

import { useState } from "react";
import Link from "next/link";
import { InfoIcon, PencilIcon, ShieldCheckIcon } from "lucide-react";
import { toast } from "sonner";

import { ErrorAlCargar } from "@/components/estados/ErrorAlCargar";
import { PedirIngreso } from "@/components/estados/PedirIngreso";
import { EsqueletoPerfilLaboral } from "@/components/marca/animaciones";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { usePerfilPostulante } from "@/hooks/usePerfilPostulante";
import { cn } from "@/lib/utils";
import type { PerfilPostulante as Perfil } from "@/lib/validation/postulante-perfil";

import { FormularioPerfilPostulante } from "./FormularioPerfilPostulante";
import { VistaPerfilPostulante } from "./VistaPerfilPostulante";

/**
 * "Datos del postulante" (P03). Loads the saved data with usePerfilPostulante.
 * Always stays in View Mode (`VistaPerfilPostulante`) by default when a profile
 * exists, switching to Edit Mode (`FormularioPerfilPostulante`) only when the
 * user explicitly clicks "Editar perfil" (or "Editar mis datos").
 * Uses the exact same 8fr/4fr non-sticky grid as `MiCv` so cards align cleanly.
 */
export function PerfilPostulante({ ofertaId }: { ofertaId?: string }) {
  const { perfil, dni, loading, error, sinAcceso, recargar, guardar, guardando, errorGuardado } = usePerfilPostulante();
  const [editando, setEditando] = useState(false);
  const [recienGuardado, setRecienGuardado] = useState(false);
  const [version, setVersion] = useState(0);

  async function handleGuardar(datos: Perfil) {
    const guardado = await guardar(datos);
    if (guardado) {
      toast.success("Guardaste tus datos personales.");
      setEditando(false);
      setRecienGuardado(true);
      setVersion((v) => v + 1);
    }
    return guardado;
  }

  if (loading) {
    return (
      <div aria-busy="true" className="grid gap-6 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)] lg:items-start">
        <span className="sr-only" role="status">
          Cargando los datos de tu perfil…
        </span>
        <EsqueletoPerfilLaboral />
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

  const completo = Boolean(
    perfil &&
      perfil.nombre &&
      perfil.apellido &&
      perfil.telefono &&
      perfil.direccion &&
      perfil.rubros.length > 0,
  );
  const mostrarFormulario = editando || !perfil;

  const perfilAdaptado = perfil
    ? {
        nombre: perfil.nombre ?? "",
        apellido: perfil.apellido ?? "",
        telefono: perfil.telefono ?? "",
        direccion: perfil.direccion ?? "",
        dni: perfil.dni ?? "",
        email: perfil.email ?? "",
        rubros: perfil.rubros.map((r: { slug: import("@/lib/validation/rubros").Rubro }) => r.slug),
        tieneCv: perfil.tieneCv,
        experiencia: perfil.experiencia ?? "",
      }
    : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)] lg:items-start">
      <div className="flex flex-col gap-4">
        {ofertaId && !completo && !recienGuardado && (
          <Alert>
            <InfoIcon aria-hidden="true" />
            <AlertTitle className="text-base">Completá tu perfil para postularte</AlertTitle>
            <AlertDescription className="flex flex-col gap-3 text-base sm:flex-row sm:items-center sm:justify-between">
              <span>
                Cargá tu nombre, apellido, teléfono, dirección y al menos un rubro, y después volvé a la oferta.
              </span>
              {!editando ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setEditando(true)}
                  className="shrink-0 self-start sm:self-center"
                >
                  <PencilIcon data-icon="inline-start" aria-hidden="true" />
                  Editar mis datos
                </Button>
              ) : null}
            </AlertDescription>
          </Alert>
        )}
        {ofertaId && recienGuardado && (
          <div role="status" className="flex flex-col gap-3 rounded-2xl bg-secondary p-5">
            <p className="font-heading text-lg font-semibold text-secondary-foreground">
              {perfil?.tieneCv
                ? "Ya podés postularte a la oferta"
                : "Tus datos quedaron guardados. Si todavía no subiste tu CV (PDF o imagen PNG), subilo más abajo antes de volver."}
            </p>
            <Link
              href={`/ofertas?oferta=${encodeURIComponent(ofertaId)}`}
              className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto sm:self-start")}
            >
              Volver a la oferta
            </Link>
          </div>
        )}
        {mostrarFormulario ? (
          <FormularioPerfilPostulante
            key={version}
            perfil={perfilAdaptado}
            dni={dni}
            onGuardar={handleGuardar}
            onCancelar={perfilAdaptado ? () => setEditando(false) : undefined}
            guardando={guardando}
            error={errorGuardado}
          />
        ) : (
          <VistaPerfilPostulante perfil={perfilAdaptado!} onEditar={() => setEditando(true)} />
        )}
      </div>

      <aside className="flex gap-3 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card p-5 ring-1 ring-foreground/5 sm:p-6">
        <ShieldCheckIcon aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-primary" />
        <div className="flex flex-col gap-1.5">
          <h2 className="font-heading text-lg font-semibold text-foreground">¿Quién ve estos datos?</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            La Oficina de Empleo de la Municipalidad de Funes. Si la Oficina te propone para un trabajo, esa empresa ve tu nombre, tu
            teléfono, tu email, tus rubros y tu CV. Tu dirección y tu DNI <strong>nunca</strong>.{" "}
            <Link href="/privacidad" className="font-semibold text-primary underline underline-offset-2 hover:text-primary/80">
              Ver privacidad y uso de datos
            </Link>
            .
          </p>
        </div>
      </aside>
    </div>
  );
}
