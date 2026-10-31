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

const formatoDiaAnio = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "America/Argentina/Buenos_Aires",
});

/** "2026-09-25T13:00:00-03:00" -> "25 de septiembre". */
export function formatearDia(iso: string): string {
  return formatoDia.format(new Date(iso));
}

function diasCalendarioDesde(iso: string, ahora: Date = new Date()): number {
  const fechaIso = new Date(iso);
  if (Number.isNaN(fechaIso.getTime())) return 999;
  const [a1, m1, d1] = formatoDiaAnio.format(fechaIso).split("-").map(Number);
  const [a2, m2, d2] = formatoDiaAnio.format(ahora).split("-").map(Number);
  const utc1 = Date.UTC(a1, m1 - 1, d1);
  const utc2 = Date.UTC(a2, m2 - 1, d2);
  return Math.max(0, Math.round((utc2 - utc1) / 86_400_000));
}

/** Human-friendly relative label ("Hoy", "Ayer", "Hace 3 días"). */
export function formatearTiempoRelativo(iso: string, ahora: Date = new Date()): string {
  const dias = diasCalendarioDesde(iso, ahora);
  if (dias === 0) return "Hoy";
  if (dias === 1) return "Ayer";
  if (dias < 30) return `Hace ${dias} días`;
  const meses = Math.floor(dias / 30);
  return meses === 1 ? "Hace 1 mes" : `Hace ${meses} meses`;
}

/** True when `iso` is within `diasMax` calendar days from `ahora` (default 3 days). */
export function esFechaReciente(iso: string, diasMax = 3, ahora: Date = new Date()): boolean {
  return diasCalendarioDesde(iso, ahora) <= diasMax;
}
