import { describe, expect, test } from "vitest";

import {
  ETIQUETA_MOTIVO_EMPRESA,
  ETIQUETA_MOTIVO_OFERTA,
  MAXIMO_OBSERVACION,
  OPCIONES_MOTIVO_EMPRESA,
  OPCIONES_MOTIVO_OFERTA,
  armarMotivoRechazo,
  rechazoEmpresaSchema,
  rechazoOfertaSchema,
} from "./motivos-rechazo";

describe("fixed rejection reasons (D-069)", () => {
  test("a company can only be rejected with one of the listed reasons", () => {
    expect(rechazoEmpresaSchema.safeParse({ motivo: "perfil_inapropiado" }).success).toBe(true);
    expect(rechazoEmpresaSchema.safeParse({ motivo: "porque sí" }).success).toBe(false);
    expect(rechazoEmpresaSchema.safeParse({}).success).toBe(false);
  });

  test("an offer can only be rejected with one of its own reasons", () => {
    expect(rechazoOfertaSchema.safeParse({ motivo: "informacion_insuficiente" }).success).toBe(true);
    // A reason of companies is not a reason of offers.
    expect(rechazoOfertaSchema.safeParse({ motivo: "cuit_no_verificable" }).success).toBe(false);
  });

  test("the note is optional, and limited", () => {
    expect(rechazoOfertaSchema.safeParse({ motivo: "otro" }).success).toBe(true);
    expect(rechazoOfertaSchema.safeParse({ motivo: "otro", observacion: "Falta el horario" }).success).toBe(true);
    expect(rechazoOfertaSchema.safeParse({ motivo: "otro", observacion: "x".repeat(MAXIMO_OBSERVACION + 1) }).success).toBe(
      false,
    );
  });

  test("each list offers every reason with its label, and ends in 'Otro motivo'", () => {
    expect(OPCIONES_MOTIVO_EMPRESA.map((o) => o.etiqueta)).toContain(ETIQUETA_MOTIVO_EMPRESA.datos_incompletos);
    expect(OPCIONES_MOTIVO_OFERTA.map((o) => o.etiqueta)).toContain(ETIQUETA_MOTIVO_OFERTA.informacion_insuficiente);
    expect(OPCIONES_MOTIVO_EMPRESA.at(-1)?.codigo).toBe("otro");
    expect(OPCIONES_MOTIVO_OFERTA.at(-1)?.codigo).toBe("otro");
  });
});

describe("armarMotivoRechazo", () => {
  test("without a note it is just the reason", () => {
    expect(armarMotivoRechazo("Falta información en la oferta")).toBe("Falta información en la oferta");
    expect(armarMotivoRechazo("Falta información en la oferta", "   ")).toBe("Falta información en la oferta");
  });

  test("with a note it follows the reason", () => {
    expect(armarMotivoRechazo("Falta información en la oferta", "Agregá el horario")).toBe(
      "Falta información en la oferta: Agregá el horario",
    );
  });

  test("the longest reason plus the longest note fits the 500 characters of the database", () => {
    const etiquetas = [...Object.values(ETIQUETA_MOTIVO_EMPRESA), ...Object.values(ETIQUETA_MOTIVO_OFERTA)];
    const larga = etiquetas.reduce((a, b) => (b.length > a.length ? b : a));

    expect(armarMotivoRechazo(larga, "x".repeat(MAXIMO_OBSERVACION)).length).toBeLessThanOrEqual(500);
  });
});
