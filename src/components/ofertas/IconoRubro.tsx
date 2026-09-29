import {
  CalculatorIcon,
  ChefHatIcon,
  EllipsisIcon,
  FactoryIcon,
  HardHatIcon,
  HeartHandshakeIcon,
  LaptopIcon,
  SprayCanIcon,
  SproutIcon,
  StoreIcon,
  TruckIcon,
  type LucideIcon,
} from "lucide-react";

import type { Rubro } from "@/lib/validation/rubros";

/** The same trade icons as the tile mosaic, so the catalog speaks the portal's visual language (D-022, D-029). */
export const ICONO_RUBRO: Record<Rubro, LucideIcon> = {
  gastronomia: ChefHatIcon,
  comercio: StoreIcon,
  construccion: HardHatIcon,
  jardineria: SproutIcon,
  transporte: TruckIcon,
  limpieza: SprayCanIcon,
  administracion: CalculatorIcon,
  cuidados: HeartHandshakeIcon,
  industria: FactoryIcon,
  tecnologia: LaptopIcon,
  otros: EllipsisIcon,
};

/** Decorative icon of a trade; the trade's name is always written next to it. */
export function IconoRubro({ rubro, className }: { rubro: Rubro; className?: string }) {
  const Icono = ICONO_RUBRO[rubro];
  return <Icono aria-hidden="true" className={className} />;
}
