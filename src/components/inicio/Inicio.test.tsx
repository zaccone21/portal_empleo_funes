import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const estadisticas = vi.hoisted(() => ({ valor: {} as Record<string, unknown> }));
vi.mock("@/hooks/useEstadisticas", () => ({ useEstadisticas: () => estadisticas.valor }));

import { CifrasPortal } from "./CifrasPortal";
import { ContadorContrataciones } from "./ContadorContrataciones";

const TOTALES = { ofertasPublicadas: 12, empresas: 5, postulantes: 1500, derivaciones: 9, contrataciones: 3 };

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

describe("CifrasPortal (D-059)", () => {
  test("shows the real totals, readable for screen readers", () => {
    estadisticas.valor = { estadisticas: TOTALES, loading: false, error: null };
    render(<CifrasPortal />);

    expect(screen.getByRole("heading", { name: "El portal en números" })).toBeDefined();
    expect(screen.getByText("1.500")).toBeDefined();
    // The hires are the hero's figure (D-066); this band shows the referrals instead.
    expect(screen.getByText("personas presentadas a empresas por la Oficina")).toBeDefined();
    expect(screen.queryByText(/contrataciones/)).toBeNull();
  });

  test("is left out when the totals cannot be counted", () => {
    estadisticas.valor = { estadisticas: null, loading: false, error: "No pudimos contar" };
    const { container } = render(<CifrasPortal />);

    expect(container.textContent).toBe("");
  });
});

describe("ContadorContrataciones (D-066)", () => {
  test("shows the hires with a sentence that agrees with the number", () => {
    estadisticas.valor = { estadisticas: TOTALES, loading: false, error: null };
    render(<ContadorContrataciones />);

    expect(screen.getByRole("heading", { name: "personas consiguieron trabajo con el portal" })).toBeDefined();
    expect(screen.getByText("3")).toBeDefined();
  });

  test("speaks in singular for one hire", () => {
    estadisticas.valor = { estadisticas: { ...TOTALES, contrataciones: 1 }, loading: false, error: null };
    render(<ContadorContrataciones />);

    expect(screen.getByRole("heading", { name: "persona consiguió trabajo con el portal" })).toBeDefined();
  });

  test("is left out when the totals cannot be counted", () => {
    estadisticas.valor = { estadisticas: null, loading: false, error: "No pudimos contar" };
    const { container } = render(<ContadorContrataciones />);

    expect(container.textContent).toBe("");
  });
});
