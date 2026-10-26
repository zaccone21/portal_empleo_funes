/*
 * Date helpers for the Office screens (D-042). All dates are shown in
 * Argentine time so a row does not change day depending on the server.
 */

const ZONA = "America/Argentina/Buenos_Aires";
const MS_POR_DIA = 24 * 60 * 60 * 1000;

/** Calendar day (yyyy-mm-dd) of an instant in Argentine time. */
function diaArgentino(fecha: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: ZONA }).format(fecha);
}

/** Whole calendar days between an ISO date and `ahora` (0 = same day, never negative). */
export function diasDesde(iso: string, ahora: Date = new Date()): number {
  const desde = Date.parse(`${diaArgentino(new Date(iso))}T00:00:00Z`);
  const hasta = Date.parse(`${diaArgentino(ahora)}T00:00:00Z`);
  return Math.max(0, Math.round((hasta - desde) / MS_POR_DIA));
}

/** "hoy", "hace 1 día", "hace 3 días": the age shown in queues and the dashboard. */
export function haceCuanto(iso: string, ahora: Date = new Date()): string {
  const dias = diasDesde(iso, ahora);
  if (dias === 0) return "hoy";
  return dias === 1 ? "hace 1 día" : `hace ${dias} días`;
}

/** "01/10": day and month, for the table columns. */
export function fechaCorta(iso: string): string {
  const ymd = diaArgentino(new Date(iso));
  const [, mm, dd] = ymd.split("-");
  return `${dd}/${mm}`;
}

/** "1 de octubre": for the panel context lines. */
export function fechaLarga(iso: string): string {
  return new Intl.DateTimeFormat("es-AR", { timeZone: ZONA, day: "numeric", month: "long" }).format(new Date(iso));
}

/** Today in Argentine time (yyyy-mm-dd), the default day of a course referral (D-047). */
export function hoyArgentino(ahora: Date = new Date()): string {
  return diaArgentino(ahora);
}

/** "20 de octubre de 2026" for a calendar day (yyyy-mm-dd) that has no time, like a course referral. */
export function fechaDia(ymd: string): string {
  return new Intl.DateTimeFormat("es-AR", { timeZone: "UTC", day: "numeric", month: "long", year: "numeric" }).format(
    new Date(`${ymd}T00:00:00Z`),
  );
}

/** "1 de octubre, 10:30": a day with its time, for the pre-interview (D-045). */
export function fechaHora(iso: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    timeZone: ZONA,
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

/**
 * The value of an `<input type="datetime-local">` (yyyy-mm-ddThh:mm) for an
 * instant, in Argentine time, so the server and the browser render the same.
 */
export function aValorFechaHora(iso: string): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: ZONA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(new Date(iso))
    .replace(" ", "T");
}

/**
 * The instant of a `datetime-local` value typed in Argentine time, as ISO 8601
 * with offset. Argentina keeps UTC-3 all year (no daylight saving since 2009).
 */
export function desdeValorFechaHora(valor: string): string {
  return `${valor}:00-03:00`;
}
