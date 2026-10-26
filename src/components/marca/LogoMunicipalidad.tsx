import Image from "next/image";

import { cn } from "@/lib/utils";

type Props = {
  /** "claro" is white, for the deep green surfaces; "color" is the municipal green, for white surfaces. */
  variante: "claro" | "color";
  /** Size it by height (`h-8 w-auto`): the width follows the logo's proportion. */
  className?: string;
};

/** The logo with its full text, white on a transparent background, 185 × 52 px (2026-10-22). */
const ARCHIVO = "/LOGOencabezado.png";

/**
 * Logo of the Gobierno de la Ciudad de Funes. There is one file, white, so the
 * "color" version paints the same shape in the municipal green with a CSS mask
 * instead of needing a second, blurrier file.
 *
 * At 185 × 52 px it stays sharp on any screen up to about 32 px of height;
 * a bigger use needs an SVG from the Municipality.
 */
export function LogoMunicipalidad({ variante, className }: Props) {
  if (variante === "claro") {
    return <Image src={ARCHIVO} alt="Gobierno de la Ciudad de Funes" width={185} height={52} className={className} />;
  }

  const mascara = `url(${ARCHIVO})`;
  return (
    <span
      role="img"
      aria-label="Gobierno de la Ciudad de Funes"
      className={cn("inline-block aspect-[185/52] bg-primary", className)}
      style={{
        maskImage: mascara,
        WebkitMaskImage: mascara,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "left center",
        WebkitMaskPosition: "left center",
      }}
    />
  );
}
