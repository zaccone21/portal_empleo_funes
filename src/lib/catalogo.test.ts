import { describe, expect, test } from "vitest";

import {
  FILTROS_VACIOS,
  describirResultados,
  filtrarOfertas,
  hayFiltros,
  leerFiltros,
  rutaCatalogo,
} from "./catalogo";
import type { OfertaPublica } from "./validation/ofertas";

function oferta(id: string, datos: Partial<OfertaPublica>): OfertaPublica {
  return {
    id,
    titulo: "Puesto (ejemplo)",
    descripcion: "",
    requisitos: "",
    lugar: "Centro",
    jornada: "",
    rubro: "otros",
    publicadaEl: "2026-09-20T10:00:00-03:00",
    yaTePostulaste: false,
    ...datos,
  };
}

const ofertas = [
  oferta("cocina", { titulo: "Ayudante de cocina", rubro: "gastronomia", publicadaEl: "2026-09-25T10:00:00-03:00" }),
  oferta("jardin", { titulo: "Jardinero", rubro: "jardineria", lugar: "Barrio Norte", publicadaEl: "2026-09-24T10:00:00-03:00" }),
  oferta("chofer", { titulo: "Chofer", rubro: "transporte", descripcion: "Reparto en el centro", publicadaEl: "2026-09-18T10:00:00-03:00" }),
];

describe("leerFiltros", () => {
  test("reads the URL and ignores unknown values", () => {
    expect(leerFiltros({ q: "  cocina ", rubro: "gastronomia", orden: "antiguas" })).toEqual({
      q: "cocina",
      rubro: "gastronomia",
      orden: "antiguas",
    });
    expect(leerFiltros({ rubro: "inventado", orden: "al-azar" })).toEqual(FILTROS_VACIOS);
    expect(leerFiltros({ q: ["a", "b"] }).q).toBe("");
  });
});

describe("filtrarOfertas", () => {
  test("without filters, newest first", () => {
    expect(filtrarOfertas(ofertas, FILTROS_VACIOS).map((o) => o.id)).toEqual(["cocina", "jardin", "chofer"]);
  });

  test("oldest first when asked", () => {
    expect(filtrarOfertas(ofertas, { ...FILTROS_VACIOS, orden: "antiguas" })[0].id).toBe("chofer");
  });

  test("by trade", () => {
    expect(filtrarOfertas(ofertas, { ...FILTROS_VACIOS, rubro: "jardineria" }).map((o) => o.id)).toEqual(["jardin"]);
  });

  test("the search ignores case and accents, and every word must match", () => {
    expect(filtrarOfertas(ofertas, { ...FILTROS_VACIOS, q: "JARDINERÍA norte" }).map((o) => o.id)).toEqual(["jardin"]);
    expect(filtrarOfertas(ofertas, { ...FILTROS_VACIOS, q: "reparto centro" }).map((o) => o.id)).toEqual(["chofer"]);
    expect(filtrarOfertas(ofertas, { ...FILTROS_VACIOS, q: "cocina norte" })).toEqual([]);
  });
});

describe("rutaCatalogo", () => {
  test("leaves defaults out and keeps the selected offer", () => {
    expect(rutaCatalogo(FILTROS_VACIOS)).toBe("/ofertas");
    expect(rutaCatalogo({ q: "cocina", rubro: "gastronomia", orden: "recientes" }, "o-1")).toBe(
      "/ofertas?q=cocina&rubro=gastronomia&oferta=o-1",
    );
  });

  test("hayFiltros ignores the order", () => {
    expect(hayFiltros({ ...FILTROS_VACIOS, orden: "antiguas" })).toBe(false);
    expect(hayFiltros({ ...FILTROS_VACIOS, q: "x" })).toBe(true);
  });
});

describe("describirResultados", () => {
  test("says what the list shows", () => {
    expect(describirResultados(7, FILTROS_VACIOS)).toBe("Hay 7 ofertas publicadas.");
    expect(describirResultados(1, FILTROS_VACIOS)).toBe("Hay 1 oferta publicada.");
    expect(describirResultados(2, { q: "cocina", rubro: "gastronomia", orden: "recientes" })).toBe(
      "Hay 2 ofertas de Gastronomía para “cocina”.",
    );
  });
});
