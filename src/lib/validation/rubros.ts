import { z } from "zod";

/*
 * Trades and sectors ("rubros") an offer belongs to (D-029). They power the
 * offer catalog filter and the shortcuts on the home page, and match the
 * trades of the tile mosaic.
 *
 * PROVISIONAL (DT-002): the official list is still open (Q-006: who keeps it
 * and which items). The values are Spanish slugs because they show up in the
 * URL (/ofertas?rubro=gastronomia) and URLs are in Spanish (AGENTS §3).
 */
export const RUBROS = [
  "gastronomia",
  "comercio",
  "construccion",
  "jardineria",
  "transporte",
  "limpieza",
  "administracion",
  "cuidados",
  "industria",
  "tecnologia",
  "otros",
] as const;

export const rubroSchema = z.enum(RUBROS, { error: "Elegí el rubro" });

export type Rubro = z.infer<typeof rubroSchema>;

/** How each trade is named on screen. */
export const NOMBRE_RUBRO: Record<Rubro, string> = {
  gastronomia: "Gastronomía",
  comercio: "Comercio y ventas",
  construccion: "Construcción y oficios",
  jardineria: "Jardinería y mantenimiento",
  transporte: "Transporte y reparto",
  limpieza: "Limpieza",
  administracion: "Administración",
  cuidados: "Cuidado de personas",
  industria: "Industria y producción",
  tecnologia: "Tecnología",
  otros: "Otros",
};

/** True when `valor` (for example from the URL) is one of the trades. */
export function esRubro(valor: string | undefined): valor is Rubro {
  return RUBROS.some((rubro) => rubro === valor);
}
