import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import type { EstadoEmpresa, PerfilEmpresa } from "@/lib/validation/empresa";

import { PublicarOferta } from "./PublicarOferta";

const mocks = vi.hoisted(() => ({
  perfil: null as PerfilEmpresa | null,
  estado: "aprobada" as EstadoEmpresa,
  motivoRechazo: null as string | null,
}));

vi.mock("@/hooks/usePerfilEmpresa", () => ({
  usePerfilEmpresa: () => ({
    perfil: mocks.perfil,
    estado: mocks.estado,
    motivoRechazo: mocks.motivoRechazo,
    loading: false,
    error: null,
    sinAcceso: false,
    recargar: vi.fn(),
  }),
}));
// The form has its own tests; here only whether it is shown or not.
vi.mock("./FormularioOferta", () => ({ FormularioOferta: () => <p>Formulario de oferta</p> }));

const PERFIL: PerfilEmpresa = {
  razonSocial: "Empresa (ejemplo)",
  cuit: "30-71234567-1",
  descripcion: "",
  contactoNombre: "Persona",
  contactoTelefono: "341 555-0000",
  contactoEmail: "contacto@ejemplo.com",
};

beforeEach(() => {
  mocks.perfil = PERFIL;
  mocks.estado = "aprobada";
  mocks.motivoRechazo = null;
});

afterEach(cleanup);

test("an approved company gets the offer form (D-068)", () => {
  render(<PublicarOferta />);

  expect(screen.getByText("Formulario de oferta")).toBeDefined();
});

test("a company waiting for approval gets the notice instead of the form", () => {
  mocks.estado = "pendiente";
  render(<PublicarOferta />);

  expect(screen.getByText("Tu empresa está en revisión")).toBeDefined();
  expect(screen.queryByText("Formulario de oferta")).toBeNull();
});

test("a rejected company reads the reason", () => {
  mocks.estado = "rechazada";
  mocks.motivoRechazo = "El perfil no es adecuado para el portal: revisá la descripción";
  render(<PublicarOferta />);

  expect(screen.getByText(/revisá la descripción/)).toBeDefined();
  expect(screen.queryByText("Formulario de oferta")).toBeNull();
});

test("without the company data it asks to fill them in first", () => {
  mocks.perfil = null;
  mocks.estado = "pendiente";
  render(<PublicarOferta />);

  expect(screen.getByRole("link", { name: "Completar datos" }).getAttribute("href")).toBe("/empresa/perfil");
  expect(screen.queryByText("Formulario de oferta")).toBeNull();
});
