import { afterEach, expect, test, vi } from "vitest";

import { bloquearEnProduccion } from "./respuestas";

afterEach(() => {
  vi.unstubAllEnvs();
});

test("the simulated API answers 404 in production", () => {
  vi.stubEnv("NODE_ENV", "production");

  expect(bloquearEnProduccion()?.status).toBe(404);
});

test("the simulated API works in development", () => {
  vi.stubEnv("NODE_ENV", "development");

  expect(bloquearEnProduccion()).toBeUndefined();
});
