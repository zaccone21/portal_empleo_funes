import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import type { CandidatoDerivado } from "@/lib/validation/candidatos";

import { DecisionCandidato } from "./DecisionCandidato";

const mocks = vi.hoisted(() => ({
  decidir: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock("@/hooks/useDecidirCandidato", () => ({
  useDecidirCandidato: () => ({ decidir: mocks.decidir, loading: false, error: null }),
}));
vi.mock("sonner", () => ({ toast: { success: mocks.toastSuccess } }));

const candidato: CandidatoDerivado = {
  postulacionId: "p-1",
  oferta: { id: "o-1", titulo: "Cadete (ejemplo)" },
  derivadoEl: "2026-10-10T12:00:00.000Z",
  nombre: "Persona",
  apellido: "De Prueba",
  telefono: null,
  email: null,
  rubros: [],
  tieneCv: false,
  decision: null,
  motivoNoContratacion: null,
};

beforeEach(() => {
  mocks.decidir.mockReset();
  mocks.toastSuccess.mockReset();
});

afterEach(cleanup);

test("hiring asks for confirmation and saves the answer (RF1.6.4)", async () => {
  const onDecidido = vi.fn();
  const decidido = { ...candidato, decision: "contratado" as const };
  mocks.decidir.mockResolvedValue(decidido);
  render(<DecisionCandidato candidato={candidato} nombre="Persona De Prueba" onDecidido={onDecidido} />);

  fireEvent.click(screen.getByRole("button", { name: "Sí, la contraté" }));
  expect(await screen.findByText("¿Confirmás que contrataste a Persona De Prueba?")).toBeDefined();
  fireEvent.click(screen.getByRole("button", { name: "Sí, confirmar" }));

  await waitFor(() => expect(onDecidido).toHaveBeenCalledWith(decidido));
  expect(mocks.decidir).toHaveBeenCalledWith("p-1", { decision: "contratado" });
});

test("not hiring needs the reason before confirming, next to its field", async () => {
  render(<DecisionCandidato candidato={candidato} nombre="Persona De Prueba" onDecidido={vi.fn()} />);

  fireEvent.click(screen.getByRole("button", { name: "No la contraté" }));
  fireEvent.click(screen.getByRole("button", { name: "Enviar respuesta" }));

  expect(await screen.findByText("Contanos por qué no contratás a esta persona")).toBeDefined();
  expect(screen.queryByText(/¿Confirmás que no contrataste/)).toBeNull();
  expect(mocks.decidir).not.toHaveBeenCalled();
});

test("not hiring sends the reason after confirming", async () => {
  mocks.decidir.mockResolvedValue({ ...candidato, decision: "no_contratado", motivoNoContratacion: "Buscaba otro horario" });
  render(<DecisionCandidato candidato={candidato} nombre="Persona De Prueba" onDecidido={vi.fn()} />);

  fireEvent.click(screen.getByRole("button", { name: "No la contraté" }));
  fireEvent.change(screen.getByLabelText(/¿Por qué no la contratás\?/), { target: { value: "Buscaba otro horario" } });
  fireEvent.click(screen.getByRole("button", { name: "Enviar respuesta" }));
  fireEvent.click(await screen.findByRole("button", { name: "Sí, confirmar" }));

  await waitFor(() =>
    expect(mocks.decidir).toHaveBeenCalledWith("p-1", { decision: "no_contratado", motivo: "Buscaba otro horario" }),
  );
});
