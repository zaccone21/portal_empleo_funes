import Image from "next/image";

import { cn } from "@/lib/utils";

type Props = {
  /** "claro" paints it white, for the deep green surfaces; "color" keeps the original green. */
  variante: "claro" | "color";
  className?: string;
};

/**
 * Logo of the Gobierno de la Ciudad de Funes (public/logo-municipalidad-funes.png,
 * a copy of docs/LOGOcolor.png). The file is green on a transparent
 * background, so on the portal's deep green it would disappear: the "claro"
 * version turns it white with a CSS filter instead of needing a second file.
 *
 * The file is only 92×26 px, so it is shown at that size or smaller; a bigger
 * version (ideally SVG) is pending from the Municipality.
 */
export function LogoMunicipalidad({ variante, className }: Props) {
  return (
    <Image
      src="/logo-municipalidad-funes.png"
      alt="Gobierno de la Ciudad de Funes"
      width={92}
      height={26}
      className={cn(variante === "claro" && "brightness-0 invert", className)}
    />
  );
}
