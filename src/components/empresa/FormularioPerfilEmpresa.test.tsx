import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";

import { FormularioPerfilEmpresa } from "./FormularioPerfilEmpresa";

afterEach(cleanup);

function completar(cuit: string) {
  const campos: Record<string, string> = {
    "Razón social": "Empresa de ejemplo S.A.",
    CUIT: cuit,
    "Nombre y apellido": "Persona de ejemplo",
    Teléfono: "341 555-1234",
    Email: "contacto@ejemplo.com",
  };
  for (const [etiqueta, valor] of Object.entries(campos)) {
    // Escapar caracteres especiales y crear expresión regular
    const regex = new RegExp(etiqueta.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    fireEvent.change(screen.getByLabelText(regex), { target: { value: valor } });
  }
  fireEvent.click(screen.getByRole("button", { name: "Guardar datos" }));
}

test("rejects a CUIT with a wrong check digit", () => {
  const onGuardar = vi.fn();
  render(<FormularioPerfilEmpresa perfil={null} onGuardar={onGuardar} guardando={false} error={null} />);

  completar("30712345672");

  expect(screen.getByText(/Revisá el CUIT/)).toBeDefined();
  expect(onGuardar).not.toHaveBeenCalled();
});

test("saves the data with the CUIT in AFIP's format", async () => {
  const onGuardar = vi.fn().mockResolvedValue(true);
  render(<FormularioPerfilEmpresa perfil={null} onGuardar={onGuardar} guardando={false} error={null} />);

  completar("30712345671");

  await waitFor(() => expect(onGuardar).toHaveBeenCalled());
  expect(onGuardar.mock.calls[0][0]).toMatchObject({ cuit: "30-71234567-1", descripcion: "" });
});

test("starts with the saved data", () => {
  render(
    <FormularioPerfilEmpresa
      perfil={{
        razonSocial: "Empresa de ejemplo S.A.",
        cuit: "30-71234567-1",
        descripcion: "",
        contactoNombre: "Persona de ejemplo",
        contactoTelefono: "341 555-1234",
        contactoEmail: "contacto@ejemplo.com",
      }}
      onGuardar={vi.fn()}
      guardando={false}
      error={null}
    />,
  );

  expect(screen.getByLabelText(/CUIT/i).getAttribute("value")).toBe("30-71234567-1");
});
