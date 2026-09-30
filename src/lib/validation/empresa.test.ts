import { describe, expect, test } from "vitest";

import { esCuitValido, perfilEmpresaSchema } from "./empresa";
import { nuevaOfertaSchema } from "./ofertas";

describe("esCuitValido", () => {
  test("accepts a CUIT with a correct check digit, with or without dashes", () => {
    expect(esCuitValido("30-71234567-1")).toBe(true);
    expect(esCuitValido("30712345671")).toBe(true);
    expect(esCuitValido("30 71234567 1")).toBe(true);
  });

  test("rejects a wrong check digit (a typo)", () => {
    expect(esCuitValido("30-71234567-2")).toBe(false);
  });

  test("rejects anything that is not 11 digits", () => {
    expect(esCuitValido("30-7123456-1")).toBe(false);
    expect(esCuitValido("30-7123456A-1")).toBe(false);
  });
});

describe("perfilEmpresaSchema", () => {
  const valido = {
    razonSocial: "Empresa de ejemplo S.A.",
    cuit: "30712345671",
    descripcion: "",
    contactoNombre: "Persona de ejemplo",
    contactoTelefono: "(0341) 555-1234",
    contactoEmail: "contacto@ejemplo.com",
  };

  test("saves the CUIT with dashes", () => {
    expect(perfilEmpresaSchema.parse(valido).cuit).toBe("30-71234567-1");
  });

  test("explains an invalid CUIT", () => {
    const resultado = perfilEmpresaSchema.safeParse({ ...valido, cuit: "30712345672" });

    expect(resultado.success).toBe(false);
    expect(resultado.error?.issues[0].message).toMatch(/Revisá el CUIT/);
  });

  test("asks for at least 8 digits in the phone", () => {
    expect(perfilEmpresaSchema.safeParse({ ...valido, contactoTelefono: "555-12" }).success).toBe(false);
    expect(perfilEmpresaSchema.safeParse({ ...valido, contactoTelefono: "+54 9 341 555 1234" }).success).toBe(true);
  });

  test("the description is optional", () => {
    expect(perfilEmpresaSchema.safeParse({ ...valido, descripcion: "" }).success).toBe(true);
  });
});

describe("nuevaOfertaSchema", () => {
  test("requires every field (RF1.3.3)", () => {
    const resultado = nuevaOfertaSchema.safeParse({
      titulo: " ",
      descripcion: "",
      requisitos: "",
      lugar: "",
      jornada: "",
      rubros: [],
    });

    expect(resultado.success).toBe(false);
    expect(resultado.error?.issues.map((issue) => issue.path[0])).toEqual([
      "titulo",
      "descripcion",
      "requisitos",
      "lugar",
      "jornada",
      "rubros",
    ]);
  });

  test("takes one to three trades (D-032)", () => {
    const oferta = {
      titulo: "Repartidor",
      descripcion: "Reparto de pedidos",
      requisitos: "Moto propia",
      lugar: "Centro",
      jornada: "Tardes",
    };

    expect(nuevaOfertaSchema.safeParse({ ...oferta, rubros: ["gastronomia"] }).success).toBe(true);
    expect(nuevaOfertaSchema.safeParse({ ...oferta, rubros: ["gastronomia", "transporte", "comercio"] }).success).toBe(true);
    expect(
      nuevaOfertaSchema.safeParse({ ...oferta, rubros: ["gastronomia", "transporte", "comercio", "otros"] }).error
        ?.issues[0].message,
    ).toBe("Podés elegir hasta 3 rubros");
    expect(nuevaOfertaSchema.safeParse({ ...oferta, rubros: ["inventado"] }).success).toBe(false);
  });
});
