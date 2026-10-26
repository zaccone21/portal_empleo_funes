import { describe, expect, test } from "vitest";

import { perfilPostulanteSchema } from "./postulante-perfil";

const VALIDO = {
  nombre: "Juan",
  apellido: "Pérez",
  telefono: "341 555-1234",
  direccion: "San José 1500",
  rubros: ["comercio"],
};

describe("perfilPostulanteSchema: nombre y apellido", () => {
  test("requires nombre and apellido and trims spaces", () => {
    expect(perfilPostulanteSchema.safeParse({ ...VALIDO, nombre: "   " }).error?.issues[0]?.message).toBe(
      "Ingresá tu nombre",
    );
    expect(perfilPostulanteSchema.safeParse({ ...VALIDO, apellido: "" }).error?.issues[0]?.message).toBe(
      "Ingresá tu apellido",
    );

    const resultado = perfilPostulanteSchema.parse({ ...VALIDO, nombre: "  Ana  ", apellido: "  Gómez  " });
    expect(resultado.nombre).toBe("Ana");
    expect(resultado.apellido).toBe("Gómez");
  });
});

describe("perfilPostulanteSchema: dirección (D-070)", () => {
  test("accepts a street and number", () => {
    expect(perfilPostulanteSchema.safeParse(VALIDO).success).toBe(true);
  });

  test("it is required: an empty or blank address is refused with a message", () => {
    for (const direccion of ["", "   "]) {
      const resultado = perfilPostulanteSchema.safeParse({ ...VALIDO, direccion });
      expect(resultado.error?.issues[0]?.message).toBe("Ingresá tu dirección");
    }
  });

  test("it is limited to 100 characters, like the database", () => {
    expect(perfilPostulanteSchema.safeParse({ ...VALIDO, direccion: "x".repeat(100) }).success).toBe(true);
    expect(perfilPostulanteSchema.safeParse({ ...VALIDO, direccion: "x".repeat(101) }).success).toBe(false);
  });

  test("spaces around it are trimmed", () => {
    const resultado = perfilPostulanteSchema.parse({ ...VALIDO, direccion: "  San José 1500  " });

    expect(resultado.direccion).toBe("San José 1500");
  });
});
