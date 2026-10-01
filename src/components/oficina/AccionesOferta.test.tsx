import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import type { OfertaOficina } from "@/lib/validation/oficina";

import { AccionesOferta, hayDecisionPendiente } from "./AccionesOferta";

const mocks = vi.hoisted(() => ({ moderar: vi.fn(), toastSuccess: vi.fn() }));

vi.mock("@/hooks/useOficina", () => ({
  useModerarOferta: () => ({ moderar: mocks.moderar, loading: false, error: null }),
}));
vi.mock("sonner", () => ({ toast: { success: mocks.toastSuccess } }));

beforeEach(() => {
  mocks.moderar.mockReset();
  mocks.toastSuccess.mockReset();
});

afterEach(cleanup);

const base: OfertaOficina = {
  id: "o-1",
  titulo: "Cadete (ejemplo)",
  descripcion: "",
  requisitos: "",
  lugar: "",
  jornada: "",
  sueldo: null,
  rubros: ["transporte"],
  estado: "pendiente",
  motivoRechazo: null,
  cierreSolicitado: false,
  creadaEl: "2026-09-27T16:00:00-03:00",
  publicadaEl: null,
  emailEmpresa: "empresa@ejemplo.com",
  empresa: null,
  cantidadPostulaciones: 0,
};

test("rejecting asks for the reason right there, and it is required (RF1.5.3)", async () => {
  mocks.moderar.mockResolvedValue({ ...base, estado: "rechazada", motivoRechazo: "Falta el horario." });
  const onActualizada = vi.fn();
  render(<AccionesOferta oferta={base} onActualizada={onActualizada} />);

  fireEvent.click(screen.getByRole("button", { name: "Rechazar" }));
  fireEvent.click(screen.getByRole("button", { name: "Rechazar la oferta" }));
  expect(screen.getByText("Escribí el motivo: la empresa lo va a leer")).toBeDefined();
  expect(mocks.moderar).not.toHaveBeenCalled();

  fireEvent.change(screen.getByLabelText("Motivo del rechazo"), { target: { value: "Falta el horario." } });
  fireEvent.click(screen.getByRole("button", { name: "Rechazar la oferta" }));

  await waitFor(() =>
    expect(mocks.moderar).toHaveBeenCalledWith("o-1", { tipo: "rechazar", motivo: "Falta el horario." }),
  );
  expect(onActualizada).toHaveBeenCalled();
});

test("publishing asks for confirmation first", async () => {
  mocks.moderar.mockResolvedValue({ ...base, estado: "publicada" });
  render(<AccionesOferta oferta={base} onActualizada={vi.fn()} />);

  fireEvent.click(screen.getByRole("button", { name: "Publicar" }));
  expect(mocks.moderar).not.toHaveBeenCalled();
  fireEvent.click(await screen.findByRole("button", { name: "Sí, publicar" }));

  await waitFor(() => expect(mocks.moderar).toHaveBeenCalledWith("o-1", { tipo: "publicar" }));
  expect(mocks.toastSuccess).toHaveBeenCalledWith("Publicaste la oferta.");
});

test("a published offer can only be closed when the company asked for it (RF1.5.4)", () => {
  const { container } = render(<AccionesOferta oferta={{ ...base, estado: "publicada" }} onActualizada={vi.fn()} />);
  expect(container.textContent).toBe("");
  cleanup();

  render(<AccionesOferta oferta={{ ...base, estado: "publicada", cierreSolicitado: true }} onActualizada={vi.fn()} />);
  expect(screen.getByRole("button", { name: "Cerrar la oferta" })).toBeDefined();
});

test("only pending offers and close requests leave something to decide", () => {
  expect(hayDecisionPendiente(base)).toBe(true);
  expect(hayDecisionPendiente({ ...base, estado: "publicada", cierreSolicitado: true })).toBe(true);
  expect(hayDecisionPendiente({ ...base, estado: "publicada" })).toBe(false);
  expect(hayDecisionPendiente({ ...base, estado: "rechazada" })).toBe(false);
  expect(hayDecisionPendiente({ ...base, estado: "cerrada" })).toBe(false);
});
