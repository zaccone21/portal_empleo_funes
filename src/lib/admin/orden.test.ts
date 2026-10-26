import { describe, expect, it } from "vitest";

import { aplicarOrden, leerOrden, ordenarFilas, type ClavesOrden } from "./orden";

type Fila = { nombre: string | null; cantidad: number };

const CLAVES: ClavesOrden<Fila> = {
  nombre: (f) => f.nombre,
  cantidad: (f) => f.cantidad,
};

const FILAS: Fila[] = [
  { nombre: "Óscar", cantidad: 10 },
  { nombre: null, cantidad: 2 },
  { nombre: "ana", cantidad: 9 },
  { nombre: "Bruno", cantidad: 2 },
];

describe("orden de las tablas de la Oficina", () => {
  it("reads the order from the URL and ignores columns that cannot be sorted", () => {
    expect(leerOrden({ orden: "nombre", dir: "desc" }, CLAVES)).toEqual({ columna: "nombre", direccion: "desc" });
    expect(leerOrden({ orden: "nombre" }, CLAVES)).toEqual({ columna: "nombre", direccion: "asc" });
    expect(leerOrden({ orden: "constructor" }, CLAVES)).toBeUndefined();
    expect(leerOrden({}, CLAVES)).toBeUndefined();
  });

  it("sorts text ignoring case and accents, with missing values last", () => {
    const asc = ordenarFilas(FILAS, CLAVES, { columna: "nombre", direccion: "asc" }).map((f) => f.nombre);
    const desc = ordenarFilas(FILAS, CLAVES, { columna: "nombre", direccion: "desc" }).map((f) => f.nombre);

    expect(asc).toEqual(["ana", "Bruno", "Óscar", null]);
    expect(desc).toEqual(["Óscar", "Bruno", "ana", null]);
  });

  it("sorts numbers as numbers and keeps ties in their incoming order", () => {
    const asc = ordenarFilas(FILAS, CLAVES, { columna: "cantidad", direccion: "asc" }).map((f) => f.nombre);
    expect(asc).toEqual([null, "Bruno", "ana", "Óscar"]);
  });

  it("leaves the rows as they came when the URL asks for no order", () => {
    expect(aplicarOrden(FILAS, {}, CLAVES)).toBe(FILAS);
  });
});
