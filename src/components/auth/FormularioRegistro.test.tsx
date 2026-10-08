import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { FormularioRegistro } from "./FormularioRegistro";

const mocks = vi.hoisted(() => ({
  registrar: vi.fn(),
  replace: vi.fn(),
  estado: { loading: false, error: null as string | null },
}));

vi.mock("@/hooks/useRegistro", () => ({
  useRegistro: () => ({ registrar: mocks.registrar, ...mocks.estado }),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: mocks.replace }) }));

beforeEach(() => {
  mocks.registrar.mockReset();
  mocks.replace.mockReset();
  mocks.estado = { loading: false, error: null };
});

afterEach(cleanup);

function completarPostulante(email: string, password: string, repetirPassword: string, dni = "38123456") {
  fireEvent.change(screen.getByLabelText(new RegExp("^Email", "i")), { target: { value: email } });
  fireEvent.change(screen.getByLabelText(new RegExp("^DNI", "i")), { target: { value: dni } });
  fireEvent.change(screen.getByLabelText(new RegExp("^Contrase", "i")), { target: { value: password } });
  fireEvent.change(screen.getByLabelText(new RegExp("^Repet", "i")), { target: { value: repetirPassword } });
  fireEvent.click(screen.getByRole("button", { name: "Crear cuenta" }));
}

function completarEmpresa(email: string, password: string, repetirPassword: string, cuit = "30-12345678-9") {
  fireEvent.change(screen.getByLabelText(new RegExp("^Email", "i")), { target: { value: email } });
  fireEvent.change(screen.getByLabelText(new RegExp("^CUIT de la empresa", "i")), { target: { value: cuit } });
  fireEvent.change(screen.getByLabelText(new RegExp("^Contrase", "i")), { target: { value: password } });
  fireEvent.change(screen.getByLabelText(new RegExp("^Repet", "i")), { target: { value: repetirPassword } });
  fireEvent.click(screen.getByRole("button", { name: "Crear cuenta" }));
}

test("asks for at least 8 characters", () => {
  render(<FormularioRegistro rol="postulante" />);

  completarPostulante("persona@ejemplo.com", "corta", "corta");

  expect(screen.getByText(/al menos 8 caracteres$/)).toBeDefined();
  expect(mocks.registrar).not.toHaveBeenCalled();
});

test("shows the mismatch under the repeated password", () => {
  render(<FormularioRegistro rol="postulante" />);

  completarPostulante("persona@ejemplo.com", "12345678", "87654321");

  expect(screen.getByText(/Las contrase/i)).toBeDefined();
  expect(mocks.registrar).not.toHaveBeenCalled();
});

test("sends email, password, role and cuit for companies", () => {
  mocks.registrar.mockResolvedValue(null);
  render(<FormularioRegistro rol="empresa" />);

  completarEmpresa("empresa@ejemplo.com", "12345678", "12345678");

  expect(mocks.registrar).toHaveBeenCalledWith({
    email: "empresa@ejemplo.com",
    password: "12345678",
    role: "empresa",
    cuit: "30-12345678-9",
  });
});

test("replaces the form with 'Revisá tu correo' and the email when the account must be activated", async () => {
  mocks.registrar.mockResolvedValue({ destino: null });
  render(<FormularioRegistro rol="postulante" />);

  completarPostulante("persona@ejemplo.com", "12345678", "12345678");

  expect(await screen.findByRole("heading", { name: /Revis/i })).toBeDefined();
  expect(screen.getByText("persona@ejemplo.com")).toBeDefined();
  expect(screen.queryByRole("button", { name: "Crear cuenta" })).toBeNull();
});

test("when Supabase logs the person in right away, goes back to where they were (D-034)", async () => {
  mocks.registrar.mockResolvedValue({ destino: "/ofertas" });
  render(<FormularioRegistro rol="postulante" volver="/ofertas?oferta=o-1" />);

  completarPostulante("persona@ejemplo.com", "12345678", "12345678");

  await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/ofertas?oferta=o-1"));
});

test("without a return path, or with one to another site, goes to the role's home", async () => {
  mocks.registrar.mockResolvedValue({ destino: "/empresa" });
  render(<FormularioRegistro rol="empresa" volver="//otro-sitio.com" />);

  completarEmpresa("empresa@ejemplo.com", "12345678", "12345678");

  await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/empresa"));
});

test("disables the button while loading and shows the server error", () => {
  mocks.estado = { loading: true, error: "No pudimos crear la cuenta" };
  render(<FormularioRegistro rol="postulante" />);

  expect(screen.getByRole("button", { name: /Creando cuenta/ }).hasAttribute("disabled")).toBe(true);
  expect(screen.getByRole("alert").textContent).toContain("No pudimos crear la cuenta");
});

