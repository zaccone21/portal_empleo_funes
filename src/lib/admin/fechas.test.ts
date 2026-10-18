import { describe, expect, it } from "vitest";

import { diasDesde, fechaCorta, haceCuanto } from "./fechas";

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
});
