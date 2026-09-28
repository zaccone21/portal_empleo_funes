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
 * white "leaf" tile that holds the screen (title, form and links).
 *
 * Phone: slogan on top, a strip of mosaic, then the tile. Desktop: slogan on
 * the left, tile on the right floating over the mosaic. The slogan is a <p>,
 * not a heading: the page's only h1 is the screen title inside the tile.
 * The tile slides in once on page load (skipped with reduced motion).
 */
export function PanelAcceso({ lema, bajada, children }: Props) {
  return (
    <div className="grid flex-1 content-start gap-16 lg:grid-cols-[minmax(0,1fr)_27rem] lg:content-center lg:items-center lg:gap-16">
      <div className="flex flex-col gap-5">
        <p className="max-w-xl font-heading text-[2.25rem] leading-[1.05] font-semibold tracking-[-0.025em] text-balance lg:text-7xl">
          {lema}
        </p>
        <p className="hidden max-w-md text-lg text-primary-foreground/80 sm:block">{bajada}</p>
      </div>
      <main className="rounded-tl-[1.75rem] rounded-br-[1.75rem] rounded-tr-lg rounded-bl-lg bg-background p-6 text-foreground shadow-2xl sm:p-8 lg:p-10 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-6 motion-safe:duration-500">
        {children}
      </main>
    </div>
  );
}
