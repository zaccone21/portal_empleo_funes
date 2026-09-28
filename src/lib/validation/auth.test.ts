import { describe, expect, test } from "vitest";
import { z } from "zod";

import {
  formularioNuevaContrasenaSchema,
  formularioRegistroSchema,
  ingresoSchema,
  recuperarContrasenaSchema,
  registroSchema,
  respuestaConDestinoSchema,
} from "./auth";

/** Returns the messages of every issue attached to each field, keyed by field name. */
function erroresDe(resultado: z.ZodSafeParseResult<unknown>) {
  if (resultado.success) throw new Error("expected a validation error");

  const errores: Record<string, string[]> = {};
  for (const issue of resultado.error.issues) {
    const campo = String(issue.path[0]);
    errores[campo] = [...(errores[campo] ?? []), issue.message];
  }
  return errores;
}

describe("ingresoSchema", () => {
  test("accepts a valid email and any non-empty password", () => {
    const resultado = ingresoSchema.safeParse({ email: "persona@ejemplo.com", password: "x" });

    expect(resultado.success).toBe(true);
  });

  test("trims spaces around the email", () => {
    const resultado = ingresoSchema.parse({ email: "  persona@ejemplo.com ", password: "x" });

    expect(resultado.email).toBe("persona@ejemplo.com");
  });

  test("asks for the email when it is empty, not for a valid format", () => {
    const errores = erroresDe(ingresoSchema.safeParse({ email: "", password: "x" }));

    expect(errores.email).toEqual(["Ingresá tu email"]);
  });

  test("rejects a malformed email", () => {
    const errores = erroresDe(ingresoSchema.safeParse({ email: "persona@", password: "x" }));

    expect(errores.email?.[0]).toMatch(/^Revisá el email/);
  });

  test("treats missing fields (FormData returns null) as empty", () => {
    const errores = erroresDe(ingresoSchema.safeParse({ email: null, password: null }));

    expect(errores.email).toEqual(["Ingresá tu email"]);
    expect(errores.password).toEqual(["Ingresá tu contraseña"]);
  });
});

describe("registroSchema", () => {
  const valido = { email: "persona@ejemplo.com", password: "12345678", role: "applicant" };

  test("accepts applicant and company", () => {
    expect(registroSchema.safeParse(valido).success).toBe(true);
    expect(registroSchema.safeParse({ ...valido, role: "company" }).success).toBe(true);
  });

  test("rejects the admin role", () => {
    const errores = erroresDe(registroSchema.safeParse({ ...valido, role: "admin" }));

    expect(errores.role).toBeDefined();
  });

  test("requires at least 8 characters", () => {
    const errores = erroresDe(registroSchema.safeParse({ ...valido, password: "1234567" }));

    expect(errores.password?.[0]).toMatch(/al menos 8/);
  });

  test("rejects more than 72 characters", () => {
    const errores = erroresDe(registroSchema.safeParse({ ...valido, password: "a".repeat(73) }));

    expect(errores.password?.[0]).toMatch(/hasta 72/);
  });
});

describe("recuperarContrasenaSchema", () => {
  test("only needs a valid email", () => {
    expect(recuperarContrasenaSchema.safeParse({ email: "persona@ejemplo.com" }).success).toBe(true);
  });
});

describe("formularioRegistroSchema", () => {
  test("puts the mismatch error on the repeated password field", () => {
    const errores = erroresDe(
      formularioRegistroSchema.safeParse({
        email: "persona@ejemplo.com",
        password: "12345678",
        repetirPassword: "87654321",
      }),
    );

    expect(errores.repetirPassword).toEqual(["Las contraseñas no coinciden"]);
  });

  test("does not require a role (the screen adds it)", () => {
    const resultado = formularioRegistroSchema.safeParse({
      email: "persona@ejemplo.com",
      password: "12345678",
      repetirPassword: "12345678",
    });

    expect(resultado.success).toBe(true);
  });
});

describe("formularioNuevaContrasenaSchema", () => {
  test("accepts matching passwords of 8 or more characters", () => {
    const resultado = formularioNuevaContrasenaSchema.safeParse({
      password: "12345678",
      repetirPassword: "12345678",
    });

    expect(resultado.success).toBe(true);
  });

  test("rejects passwords that do not match", () => {
    const errores = erroresDe(
      formularioNuevaContrasenaSchema.safeParse({ password: "12345678", repetirPassword: "1234567x" }),
    );

    expect(errores.repetirPassword).toEqual(["Las contraseñas no coinciden"]);
  });
});

describe("respuestaConDestinoSchema", () => {
  test("accepts internal paths", () => {
    expect(respuestaConDestinoSchema.safeParse({ destino: "/ofertas" }).success).toBe(true);
  });

  test("rejects external and protocol-relative URLs", () => {
    expect(respuestaConDestinoSchema.safeParse({ destino: "https://otro-sitio.com" }).success).toBe(false);
    expect(respuestaConDestinoSchema.safeParse({ destino: "//otro-sitio.com" }).success).toBe(false);
  });
});
