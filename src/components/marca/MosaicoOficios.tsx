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
 * Tile colors, kept tonal on purpose: mostly greens close to the background,
 * so the wall reads as a sober institutional texture and not as a toy. Light
 * and sun tiles are rare accents.
 */
const TONOS = {
  monte: "bg-brand-deep text-brand-mint/30 ring-1 ring-inset ring-brand-mint/10",
  municipal: "bg-primary text-brand-mint/70",
  brote: "bg-brand-leaf/60 text-brand-mint/90",
  menta: "bg-brand-mint/85 text-primary",
  sol: "bg-brand-sun/90 text-brand-deep",
} as const;

/**
 * Tone sequence. Its length (17) and the shape list's length (3) have no
 * common factor, so the same tone+shape pair does not repeat in a visible
 * rhythm. "sol" appears once in 17 and "menta" once: accents, not colors of
 * their own.
 */
const SECUENCIA_TONOS: (keyof typeof TONOS)[] = [
  "municipal",
  "monte",
  "monte",
  "brote",
  "monte",
  "municipal",
  "monte",
  "menta",
  "monte",
  "municipal",
  "monte",
  "brote",
  "monte",
  "monte",
  "sol",
  "municipal",
  "monte",
];

/**
 * Square tiles with a slight radius, and every third one with the "hoja"
 * corners (the portal's signature shape; see docs/DESIGN.md). No circles or
 * arches: they made the wall look playful.
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
