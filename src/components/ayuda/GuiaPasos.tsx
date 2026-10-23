import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

import type { PasoGuia } from "./contenido";

/**
 * Step-by-step guide of the help screen (P20). The steps are numbered because
 * they are a real sequence, and joined by a thin line so they read as a path.
 * A step with its own screen ends with a link there, so the guide doubles as
 * a shortcut.
 */
export function GuiaPasos({ titulo, pasos }: { titulo: string; pasos: PasoGuia[] }) {
  return (
    <section aria-labelledby="guia-titulo" className="flex flex-col gap-4">
      <h2 id="guia-titulo" className="text-2xl font-semibold">
        {titulo}
      </h2>
      <ol className="flex flex-col">
        {pasos.map(({ titulo: tituloPaso, texto, icono: Icono, enlace }, i) => (
          <li key={tituloPaso} className="relative flex gap-4 pb-6 last:pb-0">
            {i < pasos.length - 1 && (
              <span aria-hidden="true" className="absolute top-14 bottom-2 left-6 w-px bg-border" />
            )}
            <span
              aria-hidden="true"
              className="relative flex size-12 shrink-0 items-center justify-center rounded-tl-xl rounded-tr-sm rounded-br-xl rounded-bl-sm bg-primary text-primary-foreground"
            >
              <Icono className="size-6" />
            </span>
            <div className="flex min-w-0 flex-col gap-1 pt-1">
              <h3 className="font-heading text-lg font-semibold">
                <span className="text-muted-foreground">{i + 1}. </span>
                {tituloPaso}
              </h3>
              <p className="max-w-prose text-base text-muted-foreground">{texto}</p>
              {enlace && (
                <Link
                  href={enlace.href}
                  className={buttonVariants({ variant: "link", className: "h-11 self-start px-0 text-base" })}
                >
                  {enlace.texto}
                </Link>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
