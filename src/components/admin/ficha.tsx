import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { etiquetaVolver } from "@/features/navegacion/config";
import { cn } from "@/lib/utils";

type FichaProps = {
  /** The list or page the operator came from (`?desde=`, already validated), or where to go without it. */
  volver: string;
  badges?: ReactNode;
  titulo: string;
  /** Line under the title: ID number, company, dates. */
  contexto?: ReactNode;
  /** Contact buttons or decisions, next to the title. */
  acciones?: ReactNode;
  children: ReactNode;
  /** Side column from `lg`: company card, quick tools. Below `lg` it goes after the main column. */
  lateral?: ReactNode;
};

/**
 * Full page of one record of the Office (D-062): back arrow to the list it was
 * opened from, title with its status and actions, and the content in two
 * columns from `lg`. It scrolls on its own, because the Office layout fixes
 * the height of the content column.
 */
export function FichaAdmin({ volver, badges, titulo, contexto, acciones, children, lateral }: FichaProps) {
  return (
    <div className="-mx-[22px] -my-3.5 flex min-h-0 flex-1 flex-col overflow-y-auto px-[22px] py-3.5 text-[14px]">
      <header className="flex flex-col gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-1">
          <SidebarTrigger className="-ml-1 size-8 text-muted-foreground" />
          <EnlaceVolver href={volver} />
        </div>
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div className="flex min-w-0 flex-col gap-1.5">
            {badges && <div className="flex flex-wrap items-center gap-1.5">{badges}</div>}
            <h1 className="font-heading text-[26px] leading-tight font-semibold tracking-[-0.02em] break-words text-foreground">
              {titulo}
            </h1>
            {contexto && <p className="text-muted-foreground">{contexto}</p>}
          </div>
          {acciones && <div className="flex flex-wrap items-center gap-2">{acciones}</div>}
        </div>
      </header>

      <div className={cn("grid gap-4 pt-4", lateral && "lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)] lg:items-start")}>
        <div className="flex min-w-0 flex-col gap-4">{children}</div>
        {lateral && <aside className="flex min-w-0 flex-col gap-4">{lateral}</aside>}
      </div>
    </div>
  );
}

/** Back arrow of a full page, named after where it leads ("Volver a Postulantes"). 44 px tall. */
export function EnlaceVolver({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex h-11 items-center gap-2 rounded-lg px-2 text-[14px] font-semibold text-primary outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-primary"
    >
      <ArrowLeftIcon aria-hidden="true" className="size-4" />
      {etiquetaVolver(href)}
    </Link>
  );
}

type SeccionProps = {
  titulo: string;
  /** Small action on the right of the title ("Ver todas", a count). */
  extra?: ReactNode;
  children: ReactNode;
  className?: string;
};

/** A block of the page: white card with its own heading. */
export function FichaSeccion({ titulo, extra, children, className }: SeccionProps) {
  return (
    <section className={cn("flex flex-col gap-3 rounded-[10px] border border-border bg-card p-4", className)}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-[15px] font-semibold text-foreground">{titulo}</h2>
        {extra}
      </div>
      {children}
    </section>
  );
}
