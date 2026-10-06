import { expect, test } from "vitest";

import {
  alternarRubro,
  describirPostulantes,
  hayFiltrosPostulantes,
  leerFiltrosPostulantes,
  rutaPostulantes,
} from "./busqueda-postulantes";

test("reads the text and the trades from the URL", () => {
  expect(leerFiltrosPostulantes({ q: "  perez ", rubro: ["limpieza", "gastronomia"] })).toEqual({
    q: "perez",
    rubros: ["gastronomia", "limpieza"],
  });
});

test("a single trade in the URL is read like a list of one", () => {
  expect(leerFiltrosPostulantes({ rubro: "comercio" })).toEqual({ q: "", rubros: ["comercio"] });
});

test("unknown trades, repeated trades and array text fall back to the defaults", () => {
  expect(leerFiltrosPostulantes({ q: ["a", "b"], rubro: ["astronauta", "limpieza", "limpieza"] })).toEqual({
    q: "",
    rubros: ["limpieza"],
  });
  expect(leerFiltrosPostulantes({})).toEqual({ q: "", rubros: [] });
});

test("the search text is capped at 100 characters", () => {
  expect(leerFiltrosPostulantes({ q: "a".repeat(150) }).q).toHaveLength(100);
});

test("a search with only a trade or only text counts as filtered", () => {
  expect(hayFiltrosPostulantes({ q: "", rubros: [] })).toBe(false);
  expect(hayFiltrosPostulantes({ q: "ana", rubros: [] })).toBe(true);
  expect(hayFiltrosPostulantes({ q: "", rubros: ["otros"] })).toBe(true);
});

test("the plain list is just /admin/postulantes", () => {
  expect(rutaPostulantes({ q: "", rubros: [] })).toBe("/admin/postulantes");
});

test("the URL repeats the trade once per chosen trade", () => {
  expect(rutaPostulantes({ q: "perez", rubros: ["gastronomia", "limpieza"] })).toBe(
    "/admin/postulantes?q=perez&rubro=gastronomia&rubro=limpieza",
  );
});

test("toggling a trade adds it in the portal's order and removes it the second time", () => {
  const conLimpieza = alternarRubro({ q: "ana", rubros: ["limpieza"] }, "gastronomia");
  expect(conLimpieza).toEqual({ q: "ana", rubros: ["gastronomia", "limpieza"] });
  expect(alternarRubro(conLimpieza, "limpieza")).toEqual({ q: "ana", rubros: ["gastronomia"] });
});

test("says how many people there are, with and without filters", () => {
  expect(describirPostulantes(12, { q: "", rubros: [] })).toBe("Hay 12 postulantes registrados.");
  expect(describirPostulantes(1, { q: "", rubros: [] })).toBe("Hay 1 postulante registrado.");
  expect(describirPostulantes(3, { q: "perez", rubros: ["gastronomia", "limpieza"] })).toBe(
    "Hay 3 postulantes de Gastronomía o Limpieza para “perez”.",
  );
  expect(describirPostulantes(1, { q: "", rubros: ["limpieza"] })).toBe("Hay 1 postulante de Limpieza.");
});
