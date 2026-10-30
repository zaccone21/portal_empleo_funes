import {
  BriefcaseIcon,
  CheckCircle2Icon,
  ClockIcon,
  FileTextIcon,
  IdCardIcon,
  MailIcon,
  MapPinIcon,
  PencilIcon,
  PhoneIcon,
  WrenchIcon,
} from "lucide-react";

import { AnimarElemento, AnimarGrupo } from "@/components/marca/animaciones";
import { IconoRubro } from "@/components/ofertas/IconoRubro";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NOMBRE_RUBRO, type Rubro } from "@/lib/validation/rubros";

type Props = {
  perfil: {
    nombre: string;
    apellido: string;
    dni: string;
    telefono: string;
    direccion: string;
    email?: string;
    rubros: Rubro[];
    tieneCv: boolean;
    experiencia: string;
  };
  onEditar: () => void;
};

/**
 * Formal professional profile view for the applicant (P03).
 * Stays in read-only mode by default until the user clicks "Editar perfil".
 * Does NOT show any avatar or photo placeholder (Point E).
 */
export function VistaPerfilPostulante({ perfil, onEditar }: Props) {
  const tieneNombre = Boolean(perfil.nombre.trim() || perfil.apellido.trim());
  const nombreCompleto = tieneNombre
    ? `${perfil.nombre} ${perfil.apellido}`.trim()
    : "Tu perfil laboral";

  const dniOculto = perfil.dni ? `••••••${perfil.dni.slice(-2)}` : "Sin DNI";

  const perfilCompleto = Boolean(
    perfil.nombre.trim() &&
      perfil.apellido.trim() &&
      perfil.telefono.trim() &&
      perfil.direccion.trim() &&
      perfil.rubros.length > 0 &&
      perfil.tieneCv,
  );

  return (
    <AnimarGrupo className="flex flex-col gap-5">
      {/* Cabecera formal sin espacio de foto ni avatar de iniciales */}
      <AnimarElemento>
        <section
          aria-label="Resumen de tu perfil"
          className="overflow-hidden rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card ring-1 ring-foreground/5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 bg-brand-deep px-5 py-3.5 text-primary-foreground sm:px-7">
            <span className="text-xs font-semibold tracking-wider text-brand-mint uppercase">
              Perfil laboral · Funes
            </span>
            {perfilCompleto ? (
              <Badge className="bg-brand-mint text-brand-deep">
                <CheckCircle2Icon data-icon="inline-start" aria-hidden="true" />
                Perfil listo para postularse
              </Badge>
            ) : (
              <Badge variant="outline" className="border-brand-mint/40 text-brand-mint">
                <ClockIcon data-icon="inline-start" aria-hidden="true" />
                Datos por completar
              </Badge>
            )}
          </div>

          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
            <div className="flex min-w-0 flex-col gap-2">
              <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {nombreCompleto}
              </h2>
              {!tieneNombre ? (
                <p className="text-sm text-muted-foreground">
                  Tocá &ldquo;Editar perfil&rdquo; para cargar tu nombre y apellido.
                </p>
              ) : null}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 font-medium text-foreground/85">
                  <IdCardIcon aria-hidden="true" className="size-4 text-primary" />
                  DNI {dniOculto}
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium text-foreground/85">
                  <MapPinIcon aria-hidden="true" className="size-4 text-primary" />
                  {perfil.direccion ? `${perfil.direccion} · Funes` : "Dirección pendiente"}
                </span>
              </div>
            </div>

            <Button onClick={onEditar} size="lg" className="w-full shrink-0 sm:w-auto">
              <PencilIcon data-icon="inline-start" aria-hidden="true" />
              Editar perfil
            </Button>
          </div>
        </section>
      </AnimarElemento>

      {/* Sección 1: Sobre mí y experiencia laboral */}
      <AnimarElemento>
        <section
          aria-labelledby="perfil-experiencia-titulo"
          className="flex flex-col gap-3 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card p-5 ring-1 ring-foreground/5 sm:p-7"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="flex size-9 items-center justify-center rounded-lg bg-secondary text-primary"
              >
                <BriefcaseIcon className="size-5" />
              </span>
              <h3 id="perfil-experiencia-titulo" className="font-heading text-lg font-semibold text-foreground">
                Sobre mí y experiencia laboral
              </h3>
            </div>
            <Button variant="ghost" size="sm" onClick={onEditar}>
              {perfil.experiencia ? "Editar" : "Agregar"}
            </Button>
          </div>

          {perfil.experiencia ? (
            <p className="rounded-xl bg-muted/40 p-4 text-base leading-relaxed whitespace-pre-line text-foreground">
              {perfil.experiencia}
            </p>
          ) : (
            <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-dashed border-border bg-muted/20 p-4 sm:flex-row sm:items-center">
              <p className="text-sm text-muted-foreground">
                Contá brevemente de qué trabajaste, qué tareas sabés hacer o qué cursos hiciste.
              </p>
              <Button variant="outline" size="sm" onClick={onEditar}>
                Contar mi experiencia
              </Button>
            </div>
          )}
        </section>
      </AnimarElemento>

      {/* Sección 2: Oficios y Rubros */}
      <AnimarElemento>
        <section
          aria-labelledby="perfil-rubros-titulo"
          className="flex flex-col gap-4 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card p-5 ring-1 ring-foreground/5 sm:p-7"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="flex size-9 items-center justify-center rounded-lg bg-secondary text-primary"
              >
                <WrenchIcon className="size-5" />
              </span>
              <div>
                <h3 id="perfil-rubros-titulo" className="font-heading text-lg font-semibold text-foreground">
                  Mis oficios y rubros ({perfil.rubros.length})
                </h3>
                <p className="text-xs text-muted-foreground">
                  Usamos estos rubros para sugerirte ofertas acordes a tu perfil.
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onEditar}>
              {perfil.rubros.length > 0 ? "Cambiar" : "Elegir"}
            </Button>
          </div>

          {perfil.rubros.length > 0 ? (
            <div className="grid gap-2.5 sm:grid-cols-2">
              {perfil.rubros.map((rubro) => (
                <div
                  key={rubro}
                  className="flex items-center gap-3 rounded-xl bg-muted/50 px-3.5 py-2.5 text-sm font-medium text-foreground ring-1 ring-foreground/5"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                    <IconoRubro rubro={rubro} className="size-4" />
                  </span>
                  <span className="truncate">{NOMBRE_RUBRO[rubro]}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-dashed border-border bg-muted/20 p-4 sm:flex-row sm:items-center">
              <p className="text-sm text-muted-foreground">
                Todavía no elegiste en qué rubros buscás trabajo.
              </p>
              <Button variant="outline" size="sm" onClick={onEditar}>
                Elegir rubros
              </Button>
            </div>
          )}
        </section>
      </AnimarElemento>

      {/* Sección 3: Datos de contacto y CV */}
      <AnimarElemento>
        <section
          aria-labelledby="perfil-contacto-titulo"
          className="flex flex-col gap-4 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card p-5 ring-1 ring-foreground/5 sm:p-7"
        >
          <div className="flex items-center justify-between gap-2">
            <h3 id="perfil-contacto-titulo" className="font-heading text-lg font-semibold text-foreground">
              Datos de contacto y currículum
            </h3>
            <Button variant="ghost" size="sm" onClick={onEditar}>
              Editar datos
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-xl bg-muted/35 p-3.5">
              <MailIcon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="text-xs font-medium text-muted-foreground">Correo electrónico</span>
                <span className="truncate text-sm font-medium text-foreground">
                  {perfil.email || "No especificado"}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl bg-muted/35 p-3.5">
              <PhoneIcon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="text-xs font-medium text-muted-foreground">Teléfono</span>
                {perfil.telefono ? (
                  <span className="text-sm font-medium text-foreground">{perfil.telefono}</span>
                ) : (
                  <button
                    type="button"
                    onClick={onEditar}
                    className="text-left text-sm font-medium text-primary hover:underline"
                  >
                    Agregar teléfono
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl bg-muted/35 p-3.5">
              <MapPinIcon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="text-xs font-medium text-muted-foreground">Dirección en Funes</span>
                {perfil.direccion ? (
                  <span className="text-sm font-medium text-foreground">{perfil.direccion}</span>
                ) : (
                  <button
                    type="button"
                    onClick={onEditar}
                    className="text-left text-sm font-medium text-primary hover:underline"
                  >
                    Agregar dirección
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl bg-muted/35 p-3.5">
              <FileTextIcon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
              <div className="flex min-w-0 flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground">Currículum (PDF o PNG)</span>
                {perfil.tieneCv ? (
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <a
                      href="/api/cv/archivo"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-primary hover:underline"
                    >
                      Ver archivo
                    </a>
                    <span aria-hidden="true" className="text-muted-foreground/40">•</span>
                    <a href="#cv" className="text-muted-foreground hover:underline">
                      Reemplazar CV
                    </a>
                  </div>
                ) : (
                  <a href="#cv" className="text-sm font-semibold text-destructive hover:underline">
                    Sin CV — subilo más abajo
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      </AnimarElemento>
    </AnimarGrupo>
  );
}
