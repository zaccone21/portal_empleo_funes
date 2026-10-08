import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon, Building2Icon, MailIcon, PhoneIcon } from "lucide-react";

import { getCurrentUser } from "@/lib/dal/auth";
import { verEmpresa } from "@/lib/use-cases/oficina";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Detalle de empresa" };

type Params = {
  params: Promise<{ id: string }>;
};

export default async function AdminEmpresaDetallePage(props: Params) {
  const params = await props.params;
  const usuario = await getCurrentUser();
  if (!usuario) return null;

  const resultado = await verEmpresa(usuario, params.id);
  if (!resultado.ok) return notFound();

  const p = resultado.datos.perfil;

  return (
    <div className="flex flex-col h-full bg-muted/20 pb-12">
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 pt-6">
        <article
          aria-labelledby="detalle-titulo"
          className="flex flex-col rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card ring-1 ring-foreground/5 shadow-sm"
        >
          <header className="flex flex-col gap-2 rounded-tl-2xl rounded-tr-md bg-brand-deep px-5 pt-5 pb-6 text-primary-foreground sm:px-7">
            <Link
              href="/admin/empresas"
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
              className="text-2xl leading-tight font-semibold sm:text-3xl flex items-center gap-3"
            >
              <Building2Icon className="size-8 opacity-80" />
              {p.razonSocial || "Empresa"}
            </h2>
            {p.cuit && <p className="text-base text-primary-foreground/80 tabular-nums">CUIT {p.cuit}</p>}
          </header>
          
          <div className="flex flex-col gap-7 px-5 py-6 sm:px-7">
            <section className="flex flex-col gap-2 rounded-xl bg-muted p-4">
              <h3 className="text-lg font-semibold text-brand-deep">Contacto principal</h3>
              <ul className="flex flex-col gap-1.5 text-base mt-2">
                <li><span className="font-medium">Nombre:</span> {p.contactoNombre}</li>
                {p.contactoEmail && (
                  <li>
                    <a
                      href={`mailto:${p.contactoEmail}`}
                      className="inline-flex items-center gap-2 break-all underline-offset-4 hover:underline text-primary"
                    >
                      <MailIcon aria-hidden="true" className="size-4 shrink-0" />
                      {p.contactoEmail}
                    </a>
                  </li>
                )}
                {p.contactoTelefono && (
                  <li>
                    <a
                      href={`tel:${p.contactoTelefono.replace(/[^\d+]/g, "")}`}
                      className="inline-flex items-center gap-2 underline-offset-4 hover:underline text-primary tabular-nums"
                    >
                      <PhoneIcon aria-hidden="true" className="size-4 shrink-0" />
                      {p.contactoTelefono}
                    </a>
                  </li>
                )}
              </ul>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold text-brand-deep">Descripción de la empresa</h3>
              <p className="text-base whitespace-pre-line text-foreground/90">
                {p.descripcion || "La empresa no completó una descripción."}
              </p>
            </section>
          </div>
        </article>
      </div>
    </div>
  );
}
