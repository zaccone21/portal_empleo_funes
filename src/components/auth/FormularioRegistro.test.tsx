import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { FormularioRegistro } from "./FormularioRegistro";

const mocks = vi.hoisted(() => ({
  registrar: vi.fn(),
  estado: { loading: false, error: null as string | null },
}));

vi.mock("@/hooks/useRegistro", () => ({
  useRegistro: () => ({ registrar: mocks.registrar, ...mocks.estado }),
}));

beforeEach(() => {
  mocks.registrar.mockReset();
  mocks.estado = { loading: false, error: null };
});

afterEach(cleanup);

function completar(email: string, password: string, repetirPassword: string) {
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: email } });
  fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: password } });
  fireEvent.change(screen.getByLabelText("Repetí la contraseña"), { target: { value: repetirPassword } });
  fireEvent.click(screen.getByRole("button", { name: "Crear cuenta" }));
}

test("asks for at least 8 characters", () => {
  render(<FormularioRegistro rol="applicant" />);

  completar("persona@ejemplo.com", "corta", "corta");

  expect(screen.getByText(/al menos 8 caracteres$/)).toBeDefined();
  expect(mocks.registrar).not.toHaveBeenCalled();
});

test("shows the mismatch under the repeated password", () => {
  render(<FormularioRegistro rol="applicant" />);

  completar("persona@ejemplo.com", "12345678", "87654321");

  expect(screen.getByText("Las contraseñas no coinciden")).toBeDefined();
  expect(mocks.registrar).not.toHaveBeenCalled();
});

test("sends email, password and the role of the page, without the repeated password", () => {
  mocks.registrar.mockResolvedValue(false);
  render(<FormularioRegistro rol="company" />);

  completar("empresa@ejemplo.com", "12345678", "12345678");

  expect(mocks.registrar).toHaveBeenCalledWith({
    email: "empresa@ejemplo.com",
    password: "12345678",
    role: "company",
  });
});

test("replaces the form with 'Revisá tu correo' and the email after a success", async () => {
  mocks.registrar.mockResolvedValue(true);
  render(<FormularioRegistro rol="applicant" />);

  completar("persona@ejemplo.com", "12345678", "12345678");

  expect(await screen.findByRole("heading", { name: "Revisá tu correo" })).toBeDefined();
  expect(screen.getByText("persona@ejemplo.com")).toBeDefined();
  expect(screen.queryByRole("button", { name: "Crear cuenta" })).toBeNull();
});

test("disables the button while loading and shows the server error", () => {
  mocks.estado = { loading: true, error: "No pudimos crear la cuenta" };
  render(<FormularioRegistro rol="applicant" />);

  expect(screen.getByRole("button", { name: /Creando cuenta/ }).hasAttribute("disabled")).toBe(true);
  expect(screen.getByRole("alert").textContent).toContain("No pudimos crear la cuenta");
});
