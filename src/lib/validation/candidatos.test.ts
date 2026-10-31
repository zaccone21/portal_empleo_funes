import { describe, expect, test } from "vitest";

import { candidatoDerivadoSchema, decisionCandidatoSchema } from "./candidatos";

describe("decisionCandidatoSchema (RF1.6.4)", () => {
  test("hiring needs no reason", () => {
    expect(decisionCandidatoSchema.safeParse({ decision: "contratado" }).success).toBe(true);
  });

  test("not hiring needs the reason, next to its field", () => {
    const resultado = decisionCandidatoSchema.safeParse({ decision: "no_contratado", motivo: "   " });

    expect(resultado.success).toBe(false);
    expect(resultado.error?.issues[0]).toMatchObject({
      path: ["motivo"],
      message: "Contanos por qué no contratás a esta persona",
    });
  });

  test("rejects an unknown decision with a message for the person", () => {
    const resultado = decisionCandidatoSchema.safeParse({ decision: "tal_vez" });

    expect(resultado.error?.issues[0]?.message).toBe("Elegí si contratás o no a esta persona");
  });
});

describe("candidatoDerivadoSchema (D-044)", () => {
  test("drops the DNI and the Office's status if the server sent them by mistake", () => {
    const candidato = candidatoDerivadoSchema.parse({
      postulacionId: "p-1",
      oferta: { id: "o-1", titulo: "Ayudante de cocina" },
      derivadoEl: "2026-10-10T12:00:00.000Z",
      nombre: "Persona",
      apellido: "De Prueba",
      telefono: null,
      email: null,
      rubros: ["gastronomia"],
      tieneCv: true,
      decision: null,
      motivoNoContratacion: null,
      dni: "30111222",
      estado: "derivado",
    });

    expect(candidato).not.toHaveProperty("dni");
    expect(candidato).not.toHaveProperty("estado");
  });
});
