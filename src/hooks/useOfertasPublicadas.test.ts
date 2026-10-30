import { describe, expect, it } from "vitest";

import { listaOfertasSchema } from "@/lib/validation/ofertas";

describe("listaOfertasSchema", () => {
  it("validates published offers schema", () => {
    const fixture = [
      {
        id: "389afed9-5c57-4a4e-8ece-cbd71408deee",
        titulo: "Jefe de cocina",
        descripcion: "Coordinar y supervisar todas las operaciones de la cocina.",
        requisitos: "Experiencia mínima de 3 años.",
        lugar: "Funes norte",
        jornada: "Lunes a sábados de 9 a 17 hrs",
        sueldo: null,
        rubros: ["gastronomia"],
        publicadaEl: "2026-10-25T23:32:59.372Z",
        yaTePostulaste: false,
      },
    ];

    const result = listaOfertasSchema.safeParse(fixture);
    expect(result.success).toBe(true);
  });
});
