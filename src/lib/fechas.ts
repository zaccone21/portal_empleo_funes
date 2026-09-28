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

/** "2026-09-25T13:00:00-03:00" → "25 de septiembre". */
export function formatearDia(iso: string): string {
  return formatoDia.format(new Date(iso));
}
