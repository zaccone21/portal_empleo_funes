import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { FormularioOferta } from "./FormularioOferta";

const mocks = vi.hoisted(() => ({
  crear: vi.fn(),
  push: vi.fn(),
  toastSuccess: vi.fn(),
  estado: { loading: false, error: null as string | null },
}));

vi.mock("@/hooks/useCrearOferta", () => ({
  useCrearOferta: () => ({ crear: mocks.crear, ...mocks.estado }),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock("sonner", () => ({ toast: { success: mocks.toastSuccess } }));

beforeEach(() => {
  mocks.crear.mockReset();
  mocks.push.mockReset();
  mocks.toastSuccess.mockReset();
  mocks.estado = { loading: false, error: null };
});

afterEach(cleanup);

function completar(campos: Record<string, string>) {
  for (const [etiqueta, valor] of Object.entries(campos)) {
    fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } });
  }
  fireEvent.click(screen.getByRole("button", { name: "Enviar oferta" }));
}

test("every field is required (RF1.3.3)", () => {
  render(<FormularioOferta />);

  fireEvent.click(screen.getByRole("button", { name: "Enviar oferta" }));

  expect(screen.getByText("Ingresá el puesto que buscás")).toBeDefined();
  expect(screen.getByText("Indicá los días y el horario")).toBeDefined();
  expect(screen.getByText("Elegí el rubro")).toBeDefined();
  expect(mocks.crear).not.toHaveBeenCalled();
});

test("sends the offer and opens it in 'Mis ofertas'", async () => {
  mocks.crear.mockResolvedValue({ id: "nueva-1" });
  render(<FormularioOferta />);

  fireEvent.change(screen.getByLabelText("Rubro"), { target: { value: "transporte" } });
  completar({
    Puesto: "Cadete (ejemplo)",
    "Qué va a hacer la persona": "Entregas.",
    "Qué tiene que tener": "Moto.",
    "Dónde es el trabajo": "Centro",
    "Días y horario": "Lunes a viernes de 9 a 13",
  });

  expect(mocks.crear).toHaveBeenCalledWith({
    titulo: "Cadete (ejemplo)",
    descripcion: "Entregas.",
    requisitos: "Moto.",
    lugar: "Centro",
    jornada: "Lunes a viernes de 9 a 13",
    rubro: "transporte",
  });
  await waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/empresa/ofertas?oferta=nueva-1"));
  expect(mocks.toastSuccess).toHaveBeenCalled();
});
