import { expect, test } from "vitest";

import { formatearDia } from "./fechas";

test("formats the day in Spanish", () => {
  expect(formatearDia("2026-09-25T13:00:00-03:00")).toBe("25 de septiembre");
});

test("uses Argentina's time zone, not the machine's", () => {
  // 01:00 UTC on the 26th is still the 25th in Argentina (UTC-3).
  expect(formatearDia("2026-09-26T01:00:00Z")).toBe("25 de septiembre");
});
