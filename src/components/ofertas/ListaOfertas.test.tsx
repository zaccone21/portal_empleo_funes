import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import type { OfertaPublica } from "@/lib/validation/ofertas";

import { ListaOfertas } from "./ListaOfertas";

// The detail contains BotonPostularme; its hook would call the network.
vi.mock("@/hooks/usePostularme", () => ({
  usePostularme: () => ({ postularme: vi.fn(), loading: false, resultado: null }),
}));

// jsdom has no matchMedia; the detail asks it whether the screen is a phone.
beforeEach(() => {
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: false, media: query }));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const ofertas: OfertaPublica[] = [
  {
    id: "o-1",
    titulo: "Ayudante de cocina (ejemplo)",
    descripcion: "Preparar ingredientes.",
    requisitos: "Libreta sanitaria.",
    lugar: "Barrio de ejemplo",
    jornada: "Lunes a viernes de 8 a 16",
    sueldo: null,
    rubros: ["otros"],
    publicadaEl: "2026-09-25T10:00:00-03:00",
    yaTePostulaste: false,
  },
  {
    id: "o-2",
    titulo: "Jardinero (ejemplo)",
    descripcion: "Cortar el pasto.",
    requisitos: "Experiencia.",
    lugar: "Otro barrio de ejemplo",
    jornada: "Martes y jueves",
    sueldo: null,
    rubros: ["otros"],
    publicadaEl: "2026-09-24T10:00:00-03:00",
    yaTePostulaste: false,
  },
];

function detalle() {
  return screen.getByRole("article", { name: /./ });
}

test("each offer is a link that selects it in the URL (D-025)", () => {
  render(<ListaOfertas ofertas={ofertas} />);

  expect(screen.getByText("Hay 2 ofertas publicadas.")).toBeDefined();
  expect(screen.getByRole("link", { name: /Jardinero \(ejemplo\)/ }).getAttribute("href")).toBe(
    "/ofertas?oferta=o-2",
  );
});

test("without a selection, the detail shows the first offer (desktop default)", () => {
  render(<ListaOfertas ofertas={ofertas} />);

  expect(within(detalle()).getByRole("heading", { level: 2 }).textContent).toBe("Ayudante de cocina (ejemplo)");
  expect(screen.queryByRole("link", { current: true })).toBeNull();
});

test("shows the selected offer's detail on the same page, with requirements and the apply button", () => {
  render(<ListaOfertas ofertas={ofertas} seleccionadaId="o-2" />);

  const panel = detalle();
  expect(within(panel).getByRole("heading", { level: 2 }).textContent).toBe("Jardinero (ejemplo)");
  expect(panel.textContent).toContain("Experiencia.");
  expect(within(panel).getByRole("button", { name: "Postularme" })).toBeDefined();
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(screen.getByRole("link", { current: true }).getAttribute("href")).toBe("/ofertas?oferta=o-2");
});

test("says so when the selected offer is no longer published", () => {
  render(<ListaOfertas ofertas={ofertas} seleccionadaId="cerrada" />);

  expect(screen.getByText("Esta oferta ya no está publicada")).toBeDefined();
});

test("an offer already applied to says so on the card and in the detail, without the button", () => {
  render(<ListaOfertas ofertas={[{ ...ofertas[0], yaTePostulaste: true }, ofertas[1]]} seleccionadaId="o-1" />);

  expect(screen.getAllByText("Te postulaste")).toHaveLength(1);
  expect(within(detalle()).getByText("Te postulaste a esta oferta")).toBeDefined();
  expect(screen.queryByRole("button", { name: "Postularme" })).toBeNull();
});

test("filters by trade and keeps the filters in each card's link (D-029)", () => {
  render(
    <ListaOfertas
      ofertas={[{ ...ofertas[0], rubros: ["gastronomia"] }, { ...ofertas[1], rubros: ["jardineria"] }]}
      filtros={{ q: "", rubro: "jardineria", orden: "recientes" }}
    />,
  );

  expect(screen.getByText("Hay 1 oferta de Jardinería y mantenimiento.")).toBeDefined();
  expect(screen.getByRole("link", { name: /Jardinero \(ejemplo\)/ }).getAttribute("href")).toBe(
    "/ofertas?rubro=jardineria&oferta=o-2",
  );
  expect(screen.queryByRole("link", { name: /Ayudante de cocina/ })).toBeNull();
});

test("when nothing matches, says so and offers every offer", () => {
  render(<ListaOfertas ofertas={ofertas} filtros={{ q: "astronauta", rubro: null, orden: "recientes" }} />);

  expect(screen.getByText("No encontramos ofertas con esa búsqueda")).toBeDefined();
  expect(screen.getByRole("link", { name: "Ver todas las ofertas" }).getAttribute("href")).toBe("/ofertas");
});
