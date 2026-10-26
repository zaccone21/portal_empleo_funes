import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/dal/auth", () => ({
  getCurrentUser: vi.fn(async () => null),
}));
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  redirect: vi.fn(),
}));

import Home from "./page";

beforeEach(() => {
  // The home page asks the session and the offers; here nobody answers.
  vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

test("home presents the portal with its heading", async () => {
  render(await Home());

  expect(screen.getByRole("heading", { level: 1, name: "Tu próximo trabajo está en Funes." })).toBeDefined();
});

test("the search works as a plain form to the catalog (even before JavaScript loads)", async () => {
  render(await Home());

  const buscador = screen.getByRole("search");
  expect(buscador.getAttribute("action")).toBe("/ofertas");
  expect(buscador.getAttribute("method")).toBe("get");
  expect(screen.getByLabelText("¿Qué trabajo buscás?").getAttribute("name")).toBe("q");
});

// D-066: there is no "Para empresas" block any more; companies find their way in through the help.
test("offers a shortcut per trade, the help (also for companies) and the Office's way in", async () => {
  render(await Home());

  expect(screen.getByRole("link", { name: "Gastronomía" }).getAttribute("href")).toBe("/ofertas?rubro=gastronomia");
  expect(screen.queryByRole("link", { name: "Registrar mi empresa" })).toBeNull();
  expect(screen.getByRole("link", { name: "Ayuda y preguntas frecuentes" }).getAttribute("href")).toBe("/ayuda");
  expect(screen.getByRole("link", { name: "Ingreso para la Oficina de Empleo" }).getAttribute("href")).toBe(
    "/admin/ingresar",
  );
});
