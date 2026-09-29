import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import type { PerfilEmpresa } from "@/lib/validation/empresa";
import type { OfertaEmpresa } from "@/lib/validation/ofertas";

import { ResumenEmpresa } from "./ResumenEmpresa";

const mocks = vi.hoisted(() => ({
  ofertas: [] as OfertaEmpresa[],
  perfil: null as PerfilEmpresa | null,
}));

vi.mock("@/hooks/useOfertasEmpresa", () => ({
  useOfertasEmpresa: () => ({
    ofertas: mocks.ofertas,
    loading: false,
    error: null,
    recargar: vi.fn(),
    reemplazar: vi.fn(),
  }),
}));
vi.mock("@/hooks/usePerfilEmpresa", () => ({
  usePerfilEmpresa: () => ({ perfil: mocks.perfil, loading: false, error: null, recargar: vi.fn() }),
}));

beforeEach(() => {
  mocks.ofertas = [];
  mocks.perfil = null;
});

afterEach(cleanup);

function oferta(id: string, estado: OfertaEmpresa["estado"]): OfertaEmpresa {
  return {
    id,
    titulo: `Oferta ${id} (ejemplo)`,
    descripcion: "",
    requisitos: "",
    lugar: "",
    jornada: "",
    rubro: "otros",
    estado,
    motivoRechazo: null,
    cierreSolicitado: false,
    creadaEl: "2026-09-27T16:00:00-03:00",
  };
}

test("counts the offers in each status", () => {
  mocks.ofertas = [oferta("a", "published"), oferta("b", "published"), oferta("c", "pending")];
  render(<ResumenEmpresa />);

  const resumen = screen.getByRole("region", { name: "Tus ofertas" });
  const filas = within(resumen).getAllByRole("listitem").map((fila) => fila.textContent);
  expect(filas).toEqual(["Pendiente1", "Publicada2", "Rechazada0", "Cerrada0"]);
});

test("reminds to fill in the company data while there is none", () => {
  render(<ResumenEmpresa />);

  expect(screen.getByText("Completá los datos de la empresa")).toBeDefined();
  expect(screen.getByRole("link", { name: "Completar datos" }).getAttribute("href")).toBe("/empresa/perfil");
});

test("always offers to publish an offer", () => {
  render(<ResumenEmpresa />);

  expect(screen.getByRole("link", { name: "Publicar una oferta" }).getAttribute("href")).toBe(
    "/empresa/ofertas/nueva",
  );
});
