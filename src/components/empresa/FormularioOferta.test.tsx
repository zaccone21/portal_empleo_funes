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
    const regex = new RegExp(etiqueta.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    fireEvent.change(screen.getByLabelText(regex), { target: { value: valor } });
  }
  fireEvent.click(screen.getByRole("button", { name: "Enviar oferta" }));
}

test("every field is required (RF1.3.3)", () => {
  render(<FormularioOferta />);

  fireEvent.click(screen.getByRole("button", { name: "Enviar oferta" }));

  expect(screen.getByText("Ingresá el puesto que buscás")).toBeDefined();
  expect(screen.getByText("Indicá los días y el horario")).toBeDefined();
  expect(screen.getByText("Elegí al menos un rubro")).toBeDefined();
  expect(mocks.crear).not.toHaveBeenCalled();
});

test("sends the offer and opens it in 'Mis ofertas'", async () => {
  mocks.crear.mockResolvedValue({ id: "nueva-1" });
  render(<FormularioOferta />);

  fireEvent.click(screen.getByRole("checkbox", { name: "Transporte y reparto" }));
  fireEvent.click(screen.getByRole("checkbox", { name: "Gastronomía" }));
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
    sueldo: "",
    rubros: ["gastronomia", "transporte"],
  });
  await waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/empresa/ofertas?oferta=nueva-1"));
  expect(mocks.toastSuccess).toHaveBeenCalled();
});

test("after three trades the rest are disabled until one is unchecked (D-032)", () => {
  render(<FormularioOferta />);

  for (const nombre of ["Gastronomía", "Comercio y ventas", "Limpieza"]) {
    fireEvent.click(screen.getByRole("checkbox", { name: nombre }));
  }

  expect(screen.getByRole("checkbox", { name: "Otros" }).getAttribute("aria-disabled")).toBe("true");
  expect(screen.getByText("Elegiste 3, el máximo. Para cambiar uno, sacá otro.")).toBeDefined();

  fireEvent.click(screen.getByRole("checkbox", { name: "Limpieza" }));

  expect(screen.getByRole("checkbox", { name: "Otros" }).getAttribute("aria-disabled")).not.toBe("true");
});
