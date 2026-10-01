import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import type { OfertaEmpresa } from "@/lib/validation/ofertas";

import { DetalleOfertaEmpresa } from "./DetalleOfertaEmpresa";

const mocks = vi.hoisted(() => ({
  solicitar: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock("@/hooks/useSolicitarCierre", () => ({
  useSolicitarCierre: () => ({ solicitar: mocks.solicitar, loading: false, error: null }),
}));
vi.mock("sonner", () => ({ toast: { success: mocks.toastSuccess } }));

beforeEach(() => {
  mocks.solicitar.mockReset();
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: false, media: query }));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const base: OfertaEmpresa = {
  id: "o-1",
  titulo: "Cadete (ejemplo)",
  descripcion: "Entregas.",
  requisitos: "Moto.",
  lugar: "Centro",
  jornada: "Lunes a viernes",
  sueldo: null,
  rubros: ["otros"],
  estado: "pendiente",
  motivoRechazo: null,
  cierreSolicitado: false,
  creadaEl: "2026-09-27T16:00:00-03:00",
};

function renderDetalle(oferta: Partial<OfertaEmpresa>, onActualizada = vi.fn()) {
  render(<DetalleOfertaEmpresa oferta={{ ...base, ...oferta }} elegida onActualizada={onActualizada} />);
  return onActualizada;
}

test("a pending offer explains the review and offers no action", () => {
  renderDetalle({ estado: "pendiente" });

  expect(screen.getByText("Pendiente")).toBeDefined();
  expect(screen.getByText(/La Oficina de Empleo la está revisando/)).toBeDefined();
  expect(screen.queryByRole("button", { name: "Pedir el cierre" })).toBeNull();
});

test("a rejected offer shows the Office's reason (RF1.3.5)", () => {
  renderDetalle({ estado: "rechazada", motivoRechazo: "Falta el horario." });

  expect(screen.getByText("Motivo del rechazo")).toBeDefined();
  expect(screen.getByText("Falta el horario.")).toBeDefined();
});

test("a published offer can be asked to close after confirming (RF1.3.6)", async () => {
  const actualizada = { ...base, estado: "publicada" as const, cierreSolicitado: true };
  mocks.solicitar.mockResolvedValue(actualizada);
  const onActualizada = renderDetalle({ estado: "publicada" });

  fireEvent.click(screen.getByRole("button", { name: "Pedir el cierre" }));
  fireEvent.click(await screen.findByRole("button", { name: "Sí, pedir el cierre" }));

  await waitFor(() => expect(onActualizada).toHaveBeenCalledWith(actualizada));
  expect(mocks.solicitar).toHaveBeenCalledWith("o-1");
  expect(mocks.toastSuccess).toHaveBeenCalledWith("Pediste el cierre de la oferta.");
});

test("after asking to close, it says so and does not offer the action again", () => {
  renderDetalle({ estado: "publicada", cierreSolicitado: true });

  expect(screen.getByText("Pediste el cierre")).toBeDefined();
  expect(screen.queryByRole("button", { name: "Pedir el cierre" })).toBeNull();
});
