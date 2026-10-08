import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

/*
 * Dates shown to users, in Spanish (es-AR) and in Argentina's time zone.
 * The zone is fixed on purpose: without it, a date formatted on a server in
 * UTC (Vercel) and again in the browser could land on different days near
 * midnight, and React would report a hydration mismatch.
 */
const formatoDia = new Intl.DateTimeFormat("es-AR", {
  day: "numeric",
  month: "long",
  timeZone: "America/Argentina/Buenos_Aires",
});

const formatoCorto = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "America/Argentina/Buenos_Aires",
});

/** "2026-09-25T13:00:00-03:00" -> "25 de septiembre". */
export function formatearDia(iso: string): string {
  return formatoDia.format(new Date(iso));
}

/** "2026-09-25T13:00:00-03:00" -> "25/09/2026". */
export function formatearFechaCorta(iso: string | null | undefined): string {
  if (!iso) return "-";
  return formatoCorto.format(new Date(iso));
}

/** "2026-09-25T13:00:00-03:00" -> "hace 3 días". */
export function antiguedad(iso: string | null | undefined): string {
  if (!iso) return "-";
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: es });
  } catch {
    return "-";
  }
}
