import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { FormularioRecuperarContrasena } from "./FormularioRecuperarContrasena";

const mocks = vi.hoisted(() => ({
  pedirEnlace: vi.fn(),
  estado: { loading: false, error: null as string | null },
}));

vi.mock("@/hooks/useRecuperarContrasena", () => ({
  useRecuperarContrasena: () => ({ pedirEnlace: mocks.pedirEnlace, ...mocks.estado }),
}));

beforeEach(() => {
  mocks.pedirEnlace.mockReset();
  mocks.estado = { loading: false, error: null };
});

afterEach(cleanup);

function enviar(email: string) {
  fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: email } });
  fireEvent.click(screen.getByRole("button", { name: "Enviar enlace" }));
}

test("rejects a malformed email", () => {
  render(<FormularioRecuperarContrasena />);

  enviar("persona@");

  expect(screen.getByText(/^Revisá el email/)).toBeDefined();
  expect(mocks.pedirEnlace).not.toHaveBeenCalled();
});

test("sends the email", () => {
  mocks.pedirEnlace.mockResolvedValue(false);
  render(<FormularioRecuperarContrasena />);

  enviar("persona@ejemplo.com");

  expect(mocks.pedirEnlace).toHaveBeenCalledWith({ email: "persona@ejemplo.com" });
});

test("after a success, shows a message that does not confirm the account exists", async () => {
  mocks.pedirEnlace.mockResolvedValue(true);
  render(<FormularioRecuperarContrasena />);

  enviar("persona@ejemplo.com");

  expect(await screen.findByRole("heading", { name: "Revisá tu correo" })).toBeDefined();
  expect(screen.getByText(/^Si hay una cuenta con ese email/)).toBeDefined();
});

test("disables the button while loading and shows the server error", () => {
  mocks.estado = { loading: true, error: "Probá de nuevo" };
  render(<FormularioRecuperarContrasena />);

  expect(screen.getByRole("button", { name: /Enviando/ }).hasAttribute("disabled")).toBe(true);
  expect(screen.getByRole("alert").textContent).toContain("Probá de nuevo");
});
