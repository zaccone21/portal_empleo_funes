import type { CSSProperties } from "react";
import {
  CalculatorIcon,
  ChefHatIcon,
  DrillIcon,
  Flower2Icon,
  HammerIcon,
  HardHatIcon,
  HeartHandshakeIcon,
  LaptopIcon,
  PackageIcon,
  PaintRollerIcon,
  ScissorsIcon,
  ShirtIcon,
  SproutIcon,
  StoreIcon,
  TruckIcon,
  UtensilsIcon,
  WrenchIcon,
  ZapIcon,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

/*
 * "Mosaico de oficios" (D-022): the portal's signature element. A wall of
 * tiles, each one a trade from the city (the same idea as the applicant's
 * trade tags, RF1.2.2), in the municipal greens with a single "sun" accent.
 * It is decoration only: aria-hidden and never carries information.
 *
 * The pattern is deterministic (it depends on the tile index, not on
 * Math.random), so the server and the browser render the same markup and
 * React does not report a hydration mismatch.
 */

const OFICIOS: LucideIcon[] = [
  HammerIcon,
  SproutIcon,
  ChefHatIcon,
  ZapIcon,
  TruckIcon,
  ScissorsIcon,
  PaintRollerIcon,
  WrenchIcon,
  StoreIcon,
  HardHatIcon,
  Flower2Icon,
  UtensilsIcon,
  ShirtIcon,
  PackageIcon,
  DrillIcon,
  CalculatorIcon,
  HeartHandshakeIcon,
  LaptopIcon,
];

/**
 * Tile colors, in full: the municipal greens, a mint and one sun accent. "monte"
 * is almost the background, so the wall has calm gaps between colored tiles.
 */
const TONOS = {
  monte: "bg-brand-deep text-brand-mint/40 ring-1 ring-inset ring-brand-mint/10",
  municipal: "bg-primary text-brand-mint/80",
  brote: "bg-brand-leaf text-brand-mint",
  menta: "bg-brand-mint text-primary",
  sol: "bg-brand-sun text-brand-deep",
} as const;

/**
 * Tone sequence. Its length (13) does not match the number of columns (5 on
 * a phone, about 12 on desktop), so every row starts at a different point of
 * the sequence and the colors swap places from one row to the next: the wall
 * reads as a varied mural, not as stripes. The user liked this effect and
 * asked to keep it (docs/DESIGN.md §0). "sol" appears once in 13.
 */
const SECUENCIA_TONOS: (keyof typeof TONOS)[] = [
  "municipal",
  "monte",
  "brote",
  "monte",
  "menta",
  "municipal",
  "monte",
  "brote",
  "sol",
  "monte",
  "municipal",
  "menta",
  "monte",
];

/**
 * Square tiles with a slight radius, and every third one with the "hoja"
 * corners (the portal's signature shape; see docs/DESIGN.md). No circles or
 * arches: they made the wall look playful. 3 and 13 have no common factor,
 * so a tone does not always fall on the same shape.
 */
const FORMAS = [
  "rounded-md",
  "rounded-tl-[30%] rounded-br-[30%] rounded-tr-sm rounded-bl-sm",
  "rounded-md",
];

type Props = {
  className?: string;
  /** How many tiles to draw; extra tiles are clipped by the container. */
  cantidad?: number;
};

export function MosaicoOficios({ className, cantidad = 96 }: Props) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none overflow-hidden", className)}>
      <div className="grid origin-top-left -rotate-3 scale-105 grid-cols-[repeat(auto-fill,minmax(4rem,1fr))] gap-2 p-2 lg:grid-cols-[repeat(auto-fill,minmax(6rem,1fr))] lg:gap-3">
        {Array.from({ length: cantidad }, (_, i) => {
          const Icono = OFICIOS[i % OFICIOS.length];
          const tono = TONOS[SECUENCIA_TONOS[i % SECUENCIA_TONOS.length]];
          const forma = FORMAS[i % FORMAS.length];
          // One page-load moment: tiles pop in one after another (capped so
          // the last ones do not wait too long). Skipped with reduced motion.
          const estilo: CSSProperties = { animationDelay: `${Math.min(i * 22, 1100)}ms` };

          return (
            <div
              key={i}
              style={estilo}
              className={cn(
                "flex aspect-square items-center justify-center",
                "motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-75 motion-safe:fill-mode-both motion-safe:duration-500",
                tono,
                forma,
              )}
            >
              <Icono className="size-2/5" strokeWidth={1.5} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
