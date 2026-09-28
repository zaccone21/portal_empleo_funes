import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";

import { CampoContrasena } from "./CampoContrasena";

afterEach(cleanup);

function renderCampo(props: { error?: string; descripcion?: string } = {}) {
  render(
    <CampoContrasena
      id="password"
      name="password"
      label="Contraseña"
      autoComplete="current-password"
      {...props}
    />,
  );
  return screen.getByLabelText("Contraseña");
}

test("hides the password until the toggle is pressed", () => {
  const input = renderCampo();
  const boton = screen.getByRole("button", { name: "Mostrar contraseña" });

  expect(input.getAttribute("type")).toBe("password");
  expect(boton.getAttribute("aria-pressed")).toBe("false");

  fireEvent.click(boton);

  expect(input.getAttribute("type")).toBe("text");
  expect(boton.getAttribute("aria-pressed")).toBe("true");
});

test("the toggle never submits the form", () => {
  renderCampo();

  expect(screen.getByRole("button", { name: "Mostrar contraseña" }).getAttribute("type")).toBe(
    "button",
  );
});

test("links the description and the error to the input", () => {
  const input = renderCampo({ descripcion: "Mínimo 8", error: "Ingresá tu contraseña" });

  expect(input.getAttribute("aria-invalid")).toBe("true");
  expect(input.getAttribute("aria-describedby")).toBe("password-descripcion password-error");
  expect(screen.getByText("Ingresá tu contraseña")).toBeDefined();
});
