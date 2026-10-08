import { describe, expect, it } from "vitest";
import { puedeTransicionarPostulacion } from "./estados";

describe("puedeTransicionarPostulacion", () => {
  it("permite avanzar de postulado a preseleccionado", () => {
    expect(puedeTransicionarPostulacion("postulado", "preseleccionado")).toBe(true);
  });

  it("permite descartar directamente de postulado a no_apto", () => {
    expect(puedeTransicionarPostulacion("postulado", "no_apto")).toBe(true);
  });

  it("no permite saltar de postulado a derivado directamente", () => {
    expect(puedeTransicionarPostulacion("postulado", "derivado")).toBe(false);
  });

  it("permite avanzar de preseleccionado a derivado", () => {
    expect(puedeTransicionarPostulacion("preseleccionado", "derivado")).toBe(true);
  });

  it("permite descartar desde preseleccionado a no_apto", () => {
    expect(puedeTransicionarPostulacion("preseleccionado", "no_apto")).toBe(true);
  });

  it("no permite regresar de derivado a preseleccionado", () => {
    expect(puedeTransicionarPostulacion("derivado", "preseleccionado")).toBe(false);
  });
});
