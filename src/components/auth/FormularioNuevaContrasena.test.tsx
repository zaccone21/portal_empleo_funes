import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { FormularioNuevaContrasena } from "./FormularioNuevaContrasena";

const mocks = vi.hoisted(() => ({
  cambiarContrasena: vi.fn(),
  replace: vi.fn(),
  toastSuccess: vi.fn(),
  estado: { loading: false, error: null as string | null },
}));

vi.mock("@/hooks/useNuevaContrasena", () => ({
  useNuevaContrasena: () => ({ cambiarContrasena: mocks.cambiarContrasena, ...mocks.estado }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace }),
}));

vi.mock("sonner", () => ({
  toast: { success: mocks.toastSuccess },
}));

beforeEach(() => {
  mocks.cambiarContrasena.mockReset();
  mocks.replace.mockReset();
  mocks.toastSuccess.mockReset();
  mocks.estado = { loading: false, error: null };
});

afterEach(cleanup);

function completar(password: string, repetirPassword: string) {
  fireEvent.change(screen.getByLabelText(/^Contraseña nueva/i), { target: { value: password } });
  fireEvent.change(screen.getByLabelText(/^Repetí la contraseña nueva/i), {
    target: { value: repetirPassword },
  });
  fireEvent.click(screen.getByRole("button", { name: "Guardar contraseña" }));
}

test("shows the mismatch under the repeated password", () => {
  render(<FormularioNuevaContrasena />);

  completar("12345678", "1234567x");

  expect(screen.getByText("Las contraseñas no coinciden")).toBeDefined();
  expect(mocks.cambiarContrasena).not.toHaveBeenCalled();
});

test("sends only the new password, then shows a toast and goes to the destination", async () => {
  mocks.cambiarContrasena.mockResolvedValue("/empresa");
  render(<FormularioNuevaContrasena />);

  completar("12345678", "12345678");

  expect(mocks.cambiarContrasena).toHaveBeenCalledWith({ password: "12345678" });
  await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/empresa"));
  expect(mocks.toastSuccess).toHaveBeenCalledWith("Listo, cambiaste tu contraseña.");
});

test("disables the button while loading and shows the server error", () => {
  mocks.estado = { loading: true, error: "El enlace venció" };
  render(<FormularioNuevaContrasena />);

  expect(screen.getByRole("button", { name: /Guardando/ }).hasAttribute("disabled")).toBe(true);
  expect(screen.getByRole("alert").textContent).toContain("El enlace venció");
});
