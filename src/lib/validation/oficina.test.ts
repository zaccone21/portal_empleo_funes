import { describe, expect, test } from "vitest";

import { derivacionCursoSchema, preentrevistaSchema } from "./oficina";

describe("preentrevistaSchema (RF1.6.1, D-045)", () => {
  test("requires the date", () => {
    const resultado = preentrevistaSchema.safeParse({ notas: "Llegó puntual" });

    expect(resultado.error?.issues[0]?.message).toBe("Elegí la fecha de la preentrevista");
  });

  test("the notes are optional", () => {
    expect(preentrevistaSchema.safeParse({ fecha: "2026-10-20T13:00:00.000Z" }).success).toBe(true);
  });
});

describe("derivacionCursoSchema (RF1.6.6, D-047)", () => {
  test("requires the course name", () => {
    const resultado = derivacionCursoSchema.safeParse({ curso: "  " });

    expect(resultado.error?.issues[0]?.message).toBe("Escribí el nombre del curso");
  });

  test("the date is a day; without it the database takes today's", () => {
    expect(derivacionCursoSchema.safeParse({ curso: "Curso (ejemplo)", fecha: "2026-10-20" }).success).toBe(true);
    expect(derivacionCursoSchema.safeParse({ curso: "Curso (ejemplo)", fecha: "20/10/2026" }).success).toBe(false);
    expect(derivacionCursoSchema.safeParse({ curso: "Curso (ejemplo)" }).success).toBe(true);
  });
});
