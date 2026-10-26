import { describe, expect, it } from "vitest";

import { contarVistasEmpresas, filtrarEmpresas, perfilEmpresaIncompleto, type FilaEmpresa } from "./empresas";

function empresa(id: string, estado: FilaEmpresa["estado"], datos: Partial<FilaEmpresa> = {}): FilaEmpresa {
  return {
    id,
    razonSocial: `Empresa ${id}`,
    cuit: "30-71234567-1",
    contactoNombre: "Persona",
    contactoEmail: "contacto@ejemplo.com",
    contactoTelefono: "341 555-0000",
    creadaEl: "2026-10-20T12:00:00.000Z",
    estado,
    motivoRechazo: estado === "rechazada" ? "Otro motivo" : null,
    rubros: [],
    ofertasActivas: 0,
    ofertasTotales: 0,
    ...datos,
  };
}

describe("empresas por aprobar (D-068)", () => {
  const empresas = [empresa("a", "pendiente"), empresa("b", "aprobada"), empresa("c", "rechazada")];

  it("filters the queue of companies waiting for the Office", () => {
    expect(filtrarEmpresas(empresas, { vista: "pendientes" }).map((e) => e.id)).toEqual(["a"]);
  });

  it("filters the rejected ones", () => {
    expect(filtrarEmpresas(empresas, { vista: "rechazadas" }).map((e) => e.id)).toEqual(["c"]);
  });

  it("counts every view of the strip", () => {
    expect(contarVistasEmpresas(empresas)).toMatchObject({ todas: 3, pendientes: 1, rechazadas: 1 });
  });

  it("combines the view with the text search", () => {
    const conBusqueda = [empresa("a", "pendiente", { razonSocial: "Panadería Sol" }), empresa("d", "pendiente")];

    expect(filtrarEmpresas(conBusqueda, { vista: "pendientes", q: "panad" }).map((e) => e.id)).toEqual(["a"]);
  });
});

describe("perfilEmpresaIncompleto", () => {
  it("is true while the company has not loaded its CUIT", () => {
    expect(perfilEmpresaIncompleto(empresa("a", "pendiente", { cuit: null }))).toBe(true);
  });

  it("is false once the required data is there", () => {
    expect(perfilEmpresaIncompleto(empresa("a", "pendiente"))).toBe(false);
  });
});
