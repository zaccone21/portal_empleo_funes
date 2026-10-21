import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import type { OfertaPublica } from "@/lib/validation/ofertas";

const estadisticas = vi.hoisted(() => ({ valor: {} as Record<string, unknown> }));
vi.mock("@/hooks/useEstadisticas", () => ({ useEstadisticas: () => estadisticas.valor }));

import { CifrasPortal } from "./CifrasPortal";
import { contarPorRubro, RubrosConOfertas } from "./RubrosConOfertas";

function oferta(id: string, rubros: OfertaPublica["rubros"]): OfertaPublica {
  return {
    id,
    titulo: `Puesto ${id} (ejemplo)`,
    descripcion: "Tareas",
    requisitos: "Ninguno",
    lugar: "Centro",
    jornada: "Mañana",
    sueldo: null,
    rubros,
    publicadaEl: "2026-10-20T12:00:00.000Z",
    yaTePostulaste: false,
  };
}

beforeEach(() => {
  // jsdom has no IntersectionObserver: the counters never start, which is enough here.
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("RubrosConOfertas (D-059)", () => {
  test("an offer with two trades counts in both", () => {
    const cuenta = contarPorRubro([oferta("1", ["gastronomia", "transporte"]), oferta("2", ["gastronomia"])]);

    expect(cuenta.gastronomia).toBe(2);
    expect(cuenta.transporte).toBe(1);
    expect(cuenta.limpieza).toBe(0);
  });

  test("lists every trade, the busiest first, each one opening the filtered catalog", () => {
    render(<RubrosConOfertas ofertas={[oferta("1", ["limpieza"]), oferta("2", ["limpieza"])]} />);

    const enlaces = screen.getAllByRole("link");
    expect(enlaces).toHaveLength(11);
    expect(enlaces[0].getAttribute("href")).toBe("/ofertas?rubro=limpieza");
    expect(enlaces[0].textContent).toContain("2 ofertas");
    expect(screen.getAllByText("Sin ofertas por ahora")).toHaveLength(10);
  });
});

describe("CifrasPortal (D-059)", () => {
  test("shows the real totals, readable for screen readers", () => {
    estadisticas.valor = {
      estadisticas: { ofertasPublicadas: 12, empresas: 5, postulantes: 1500, derivaciones: 9, contrataciones: 3 },
      loading: false,
      error: null,
    };
    render(<CifrasPortal />);

    expect(screen.getByRole("heading", { name: "El portal en números" })).toBeDefined();
    expect(screen.getByText("1.500")).toBeDefined();
    expect(screen.getByText("contrataciones logradas")).toBeDefined();
  });

  test("is left out when the totals cannot be counted", () => {
    estadisticas.valor = { estadisticas: null, loading: false, error: "No pudimos contar" };
    const { container } = render(<CifrasPortal />);

    expect(container.textContent).toBe("");
  });
});
