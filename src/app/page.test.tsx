import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import Home from "./page";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

beforeEach(() => {
  // The home page asks the session and the offers; here nobody answers.
  vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

test("home presents the portal with its heading", () => {
  render(<Home />);

  expect(screen.getByRole("heading", { level: 1, name: "Tu próximo trabajo está en Funes." })).toBeDefined();
});

test("the search works as a plain form to the catalog (even before JavaScript loads)", () => {
  render(<Home />);

  const buscador = screen.getByRole("search");
  expect(buscador.getAttribute("action")).toBe("/ofertas");
  expect(buscador.getAttribute("method")).toBe("get");
  expect(screen.getByLabelText("¿Qué trabajo buscás?").getAttribute("name")).toBe("q");
});

test("offers a shortcut per trade and a way in for companies and the Office", () => {
  render(<Home />);

  expect(screen.getByRole("link", { name: "Gastronomía" }).getAttribute("href")).toBe("/ofertas?rubro=gastronomia");
  expect(screen.getByRole("link", { name: "Registrar mi empresa" }).getAttribute("href")).toBe("/empresa/registrarse");
  expect(screen.getByRole("link", { name: "Ingreso para la Oficina de Empleo" }).getAttribute("href")).toBe(
    "/admin/ingresar",
  );
});
