import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { FormularioIngreso } from "./FormularioIngreso";

// The hook talks to the server and the router navigates: both are dependencies
// of the form, so they are replaced with fakes the tests can inspect.
const mocks = vi.hoisted(() => ({
  ingresar: vi.fn(),
  replace: vi.fn(),
  estado: { loading: false, error: null as string | null },
}));

vi.mock("@/hooks/useIngreso", () => ({
  useIngreso: () => ({ ingresar: mocks.ingresar, ...mocks.estado }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace }),
}));

beforeEach(() => {
  mocks.ingresar.mockReset();
  mocks.replace.mockReset();
  mocks.estado = { loading: false, error: null };
});

afterEach(cleanup);

function completar(email: string, password: string) {
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: email } });
  fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: password } });
  fireEvent.click(screen.getByRole("button", { name: "Ingresar" }));
}

test("shows an error under each empty field and does not send anything", () => {
  render(<FormularioIngreso />);

  fireEvent.click(screen.getByRole("button", { name: "Ingresar" }));

  expect(screen.getByText("Ingresá tu email")).toBeDefined();
  expect(screen.getByText("Ingresá tu contraseña")).toBeDefined();
  expect(mocks.ingresar).not.toHaveBeenCalled();
});

test("sends the validated data with the email trimmed and goes to the destination", async () => {
  mocks.ingresar.mockResolvedValue("/ofertas");
  render(<FormularioIngreso />);

  completar(" persona@ejemplo.com ", "secreta");

  expect(mocks.ingresar).toHaveBeenCalledWith({ email: "persona@ejemplo.com", password: "secreta" });
  await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/ofertas"));
});

test("stays on the page when the login fails", async () => {
  mocks.ingresar.mockResolvedValue(undefined);
  render(<FormularioIngreso />);

  completar("persona@ejemplo.com", "secreta");

  await waitFor(() => expect(mocks.ingresar).toHaveBeenCalled());
  expect(mocks.replace).not.toHaveBeenCalled();
});

test("disables the button while loading", () => {
  mocks.estado = { loading: true, error: null };
  render(<FormularioIngreso />);

  expect(screen.getByRole("button", { name: /Ingresando/ }).hasAttribute("disabled")).toBe(true);
});

test("shows the server error", () => {
  mocks.estado = { loading: false, error: "Email o contraseña incorrectos" };
  render(<FormularioIngreso />);

  expect(screen.getByRole("alert").textContent).toContain("Email o contraseña incorrectos");
});
