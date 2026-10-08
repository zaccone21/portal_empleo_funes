import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon, FileCheckIcon, FileXIcon, MailIcon, PhoneIcon } from "lucide-react";

import { getCurrentUser } from "@/lib/dal/auth";
import { verPostulante } from "@/lib/use-cases/oficina";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { RubroTile } from "@/components/admin/rubro-tile";
import { formatearDia } from "@/lib/fechas";

export const metadata: Metadata = { title: "Detalle del postulante" };

type Params = {
  params: Promise<{ id: string }>;
};

export default async function AdminPostulanteDetallePage(props: Params) {
  const params = await props.params;
  const usuario = await getCurrentUser();
  if (!usuario) return null;

  const resultado = await verPostulante(usuario, params.id);
  if (!resultado.ok) return notFound();

  const p = resultado.datos;
  const nombre = [p.nombre, p.apellido].filter(Boolean).join(" ");

  return (
    <div className="flex flex-col h-full bg-muted/20 pb-12">
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 pt-6">
        <article
          aria-labelledby="detalle-titulo"
          className="flex flex-col rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card ring-1 ring-foreground/5 shadow-sm"
        >
          <header className="flex flex-col gap-2 rounded-tl-2xl rounded-tr-md bg-brand-deep px-5 pt-5 pb-6 text-primary-foreground sm:px-7">
            <Link
              href="/admin/postulantes"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "-ml-3 self-start text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground mb-2",
              )}
            >
              <ArrowLeftIcon data-icon="inline-start" aria-hidden="true" />
              Volver a la búsqueda
            </Link>
            <h2
              id="detalle-titulo"
              className="text-2xl leading-tight font-semibold sm:text-3xl"
            >
              {nombre || "Sin nombre"}
            </h2>
            {p.dni && <p className="text-base text-primary-foreground/80 tabular-nums">DNI {p.dni}</p>}
          </header>
          
          <div className="flex flex-col gap-7 px-5 py-6 sm:px-7">
            <section className="flex flex-col gap-2 rounded-xl bg-muted p-4">
              <h3 className="text-lg font-semibold text-brand-deep">Datos de contacto</h3>
              <ul className="flex flex-col gap-1.5 text-base mt-2">
                {p.email && (
                  <li>
                    <a
                      href={`mailto:${p.email}`}
                      className="inline-flex items-center gap-2 break-all underline-offset-4 hover:underline text-primary"
                    >
                      <MailIcon aria-hidden="true" className="size-4 shrink-0" />
                      {p.email}
                    </a>
                  </li>
                )}
                {p.telefono && (
                  <li>
                    <a
                      href={`tel:${p.telefono.replace(/[^\d+]/g, "")}`}
                      className="inline-flex items-center gap-2 underline-offset-4 hover:underline text-primary tabular-nums"
                    >
                      <PhoneIcon aria-hidden="true" className="size-4 shrink-0" />
                      {p.telefono}
                    </a>
                  </li>
                )}
                {!p.email && !p.telefono && (
                  <li className="text-muted-foreground">Esta persona no proporcionó datos de contacto.</li>
                )}
              </ul>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold text-brand-deep">Rubros y oficios</h3>
              {p.rubros.length === 0 ? (
                <p className="text-base text-muted-foreground">Todavía no eligió rubros.</p>
              ) : (
                <ul className="flex flex-wrap gap-2">
                  {p.rubros.map((rubro) => (
                    <li key={rubro}>
                      <RubroTile rubro={rubro} />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold text-brand-deep">Currículum Vitae</h3>
              <div className="flex items-center">
                {!p.cvSubidoEl ? (
                  <Badge variant="outline" className="h-8 gap-2 border-dashed px-3 text-sm text-muted-foreground">
                    <FileXIcon className="size-4" />
                    Sin CV
                  </Badge>
                ) : (
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="h-8 gap-2 px-3 text-sm bg-brand-mint text-brand-deep border-brand-leaf/20 border">
                      <FileCheckIcon className="size-4" />
                      CV cargado
                    </Badge>
                    <span className="text-sm text-muted-foreground">Subido el {formatearDia(p.cvSubidoEl)}</span>
                  </div>
                )}
              </div>
            </section>
          </div>
        </article>
      </div>
    </div>
  );
}
