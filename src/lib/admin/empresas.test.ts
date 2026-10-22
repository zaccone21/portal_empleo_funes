import { describe, expect, it } from "vitest";

import { contarVistasEmpresas, esEmpresaNueva, filtrarEmpresas, inicioEmpresasNuevas, type FilaEmpresa } from "./empresas";

// 2026-10-22 at 10:00 in Argentina.
const AHORA = new Date("2026-10-22T13:00:00Z");

function empresa(id: string, creadaEl: string): FilaEmpresa {
  return {
    id,
    razonSocial: `Empresa ${id}`,
    cuit: null,
    contactoNombre: null,
    contactoEmail: null,
    contactoTelefono: null,
    creadaEl,
    rubros: [],
    ofertasActivas: 0,
    ofertasTotales: 0,
  };
}

describe("empresas nuevas (D-064)", () => {
  it("counts a company as new during its first 7 calendar days in Argentina", () => {
    expect(esEmpresaNueva(empresa("hoy", "2026-10-22T09:00:00-03:00"), AHORA)).toBe(true);
    expect(esEmpresaNueva(empresa("6d", "2026-10-16T00:30:00-03:00"), AHORA)).toBe(true);
    expect(esEmpresaNueva(empresa("7d", "2026-10-15T23:30:00-03:00"), AHORA)).toBe(false);
  });

  it("counts in the database from the same day the view uses", () => {
    expect(inicioEmpresasNuevas(AHORA)).toBe("2026-10-16T00:00:00-03:00");
  });

  it("filters and counts the 'Nuevas' view", () => {
    const empresas = [empresa("a", "2026-10-21T10:00:00-03:00"), empresa("b", "2026-09-01T10:00:00-03:00")];

    expect(filtrarEmpresas(empresas, { vista: "nuevas" }, AHORA).map((e) => e.id)).toEqual(["a"]);
    expect(contarVistasEmpresas(empresas, AHORA).nuevas).toBe(1);
  });
});
