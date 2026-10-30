import type { ReactNode } from "react";

type Props = {
  /** Portal slogan, the large text on the green (one per portal, set in its layout). */
  lema: string;
  /** One sentence under the slogan; hidden on phones to keep the form above the fold. */
  bajada: string;
  children: ReactNode;
};

/**
 * Content of an access screen inside MarcoAcceso: the portal's slogan and the
 * white tile that holds the screen (title, form and links).
 * Compact layout designed to fit on a single screen without vertical scrolling.
 */
export function PanelAcceso({ lema, bajada, children }: Props) {
  return (
    <div className="grid flex-1 content-center items-center gap-6 lg:grid-cols-[minmax(0,1.15fr)_26rem] lg:gap-10 xl:gap-16">
      <div className="flex flex-col gap-2.5 sm:gap-3.5">
        <p className="max-w-xl font-heading text-2xl font-bold tracking-tight text-balance sm:text-3xl lg:text-4xl xl:text-5xl leading-tight">
          {lema}
        </p>
        <p className="hidden max-w-md text-sm text-primary-foreground/80 sm:block sm:text-base leading-relaxed">
          {bajada}
        </p>
      </div>
      <main
        id="contenido"
        className="rounded-2xl bg-card p-5 sm:p-6 text-foreground shadow-2xl ring-1 ring-black/5 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-300"
      >
        {children}
      </main>
    </div>
  );
}
