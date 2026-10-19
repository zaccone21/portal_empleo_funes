import { describe, expect, it } from "vitest";

import { aValorFechaHora, desdeValorFechaHora, diasDesde, fechaCorta, fechaDia, haceCuanto, hoyArgentino } from "./fechas";

const AHORA = new Date("2026-10-03T15:00:00-03:00");

describe("fechas del admin", () => {
  it("counts calendar days in Argentine time", () => {
    expect(diasDesde("2026-10-03T00:30:00-03:00", AHORA)).toBe(0);
    expect(diasDesde("2026-10-01T23:00:00-03:00", AHORA)).toBe(2);
  });

  it("never returns negative days", () => {
    expect(diasDesde("2026-10-10T10:00:00-03:00", AHORA)).toBe(0);
  });

  it("writes the age in plain Spanish", () => {
    expect(haceCuanto("2026-10-03T08:00:00-03:00", AHORA)).toBe("hoy");
    expect(haceCuanto("2026-10-02T08:00:00-03:00", AHORA)).toBe("hace 1 día");
    expect(haceCuanto("2026-09-30T08:00:00-03:00", AHORA)).toBe("hace 3 días");
  });

  it("formats day and month", () => {
    expect(fechaCorta("2026-10-01T12:00:00-03:00")).toBe("01/10");
  });

  it("fills a datetime-local field in Argentine time, whatever the server's zone", () => {
    expect(aValorFechaHora("2026-10-20T13:30:00.000Z")).toBe("2026-10-20T10:30");
  });

  it("a day without time keeps its day in any zone", () => {
    expect(fechaDia("2026-10-20")).toBe("20 de octubre de 2026");
  });

  it("today is the Argentine day, also late at night in UTC", () => {
    expect(hoyArgentino(new Date("2026-10-21T01:00:00.000Z"))).toBe("2026-10-20");
  });

  it("reads a datetime-local value as Argentine time and back", () => {
    const iso = desdeValorFechaHora("2026-10-20T10:30");

    expect(iso).toBe("2026-10-20T10:30:00-03:00");
    expect(new Date(iso).toISOString()).toBe("2026-10-20T13:30:00.000Z");
    expect(aValorFechaHora(iso)).toBe("2026-10-20T10:30");
  });
});
