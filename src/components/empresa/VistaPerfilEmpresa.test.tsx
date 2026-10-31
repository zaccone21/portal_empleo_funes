import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { VistaPerfilEmpresa } from "./VistaPerfilEmpresa";

afterEach(cleanup);

describe("VistaPerfilEmpresa", () => {
  const perfilMock = {
    razonSocial: "Funes Tech Lab S.A.",
    cuit: "30-71234567-8",
    descripcion: "Desarrollo de software e innovación.",
    contactoNombre: "Valeria Gómez",
    contactoTelefono: "341 555-9876",
    contactoEmail: "contacto@funestech.com",
  };

  test("renders company name, CUIT registered badge and description", () => {
    render(<VistaPerfilEmpresa perfil={perfilMock} onEditar={vi.fn()} />);

    expect(screen.getByText("Funes Tech Lab S.A.")).toBeDefined();
    expect(screen.getByText("CUIT registrado")).toBeDefined();
    expect(screen.getByText("30-71234567-8")).toBeDefined();
    expect(screen.getByText("Desarrollo de software e innovación.")).toBeDefined();
  });

  test("renders contact details in structured cards", () => {
    render(<VistaPerfilEmpresa perfil={perfilMock} onEditar={vi.fn()} />);

    expect(screen.getByText("Valeria Gómez")).toBeDefined();
    expect(screen.getByText("341 555-9876")).toBeDefined();
    expect(screen.getByText("contacto@funestech.com")).toBeDefined();
  });

  test("triggers onEditar callback when edit button is clicked", () => {
    const onEditar = vi.fn();
    render(<VistaPerfilEmpresa perfil={perfilMock} onEditar={onEditar} />);

    fireEvent.click(screen.getByRole("button", { name: /editar datos/i }));
    expect(onEditar).toHaveBeenCalledTimes(1);
  });
});
