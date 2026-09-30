import { describe, expect, test } from "vitest";

import { postulacionPropiaSchema, postularseSchema } from "./postulaciones";

describe("postulacionPropiaSchema", () => {
  test("drops any status the server might send (RF1.2.4)", () => {
    const postulacion = postulacionPropiaSchema.parse({
      id: "p-1",
      postuladoEl: "2026-09-20T10:00:00-03:00",
      estado: "preseleccionado",
      oferta: { id: "o-1", titulo: "Ayudante de cocina", lugar: "Centro" },
    });

    expect(postulacion).not.toHaveProperty("estado");
  });

  test("rejects a date without offset", () => {
    const resultado = postulacionPropiaSchema.safeParse({
      id: "p-1",
      postuladoEl: "2026-09-20",
      oferta: { id: "o-1", titulo: "Ayudante de cocina", lugar: "Centro" },
    });

    expect(resultado.success).toBe(false);
  });
});

describe("postularseSchema", () => {
  test("only accepts the offer id", () => {
    expect(postularseSchema.parse({ ofertaId: "00000000-0000-4000-8000-000000000001", postulanteId: "otro" })).toEqual({
      ofertaId: "00000000-0000-4000-8000-000000000001",
    });
  });

  test("requires the offer id", () => {
    expect(postularseSchema.safeParse({ ofertaId: "" }).success).toBe(false);
  });
});
