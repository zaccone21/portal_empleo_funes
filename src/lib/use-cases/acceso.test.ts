import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("server-only", () => ({}));

const dal = vi.hoisted(() => ({
  ingresarConContrasena: vi.fn(),
  registrar: vi.fn(),
  enviarRecuperacion: vi.fn(),
  cambiarContrasena: vi.fn(),
  salir: vi.fn(),
  abrirSesionConEnlace: vi.fn(),
}));
vi.mock("@/lib/dal/auth", () => dal);

import { abrirEnlace, elegirNuevaContrasena, ingresar, pedirRecuperacion, registrarse, verSesion } from "./acceso";
import type { DatosRegistro } from "@/lib/validation/auth";

beforeEach(() => {
  for (const fn of Object.values(dal)) fn.mockReset();
});

describe("ingresar", () => {
  test("sends each role to its home, from the role stored in perfiles", async () => {
    dal.ingresarConContrasena.mockResolvedValue({ ok: true, rol: "empresa" });

    await expect(ingresar({ email: "empresa@ejemplo.com", password: "x" })).resolves.toEqual({
      ok: true,
      datos: { destino: "/empresa" },
    });
  });

  test("answers the same for an unknown email and a wrong password (AGENTS §7)", async () => {
    dal.ingresarConContrasena.mockResolvedValue({ ok: false, motivo: "credenciales" });

    await expect(ingresar({ email: "nadie@ejemplo.com", password: "x" })).resolves.toEqual({
      ok: false,
      falla: "unauthenticated",
      mensaje: "Email o contraseña incorrectos",
    });
  });

  test("tells a person with the right password that the account is not activated yet", async () => {
    dal.ingresarConContrasena.mockResolvedValue({ ok: false, motivo: "sin_confirmar" });

    const resultado = await ingresar({ email: "persona@ejemplo.com", password: "x" });

    expect(resultado.ok).toBe(false);
    expect(!resultado.ok && resultado.mensaje).toContain("activaste");
  });
});

describe("registrarse", () => {
  const datosPostulante: DatosRegistro = { email: "persona@ejemplo.com", password: "12345678", role: "postulante", dni: "38123456", nombre: "Juan", apellido: "Perez" };
  const datosEmpresa: DatosRegistro = { email: "empresa@ejemplo.com", password: "12345678", role: "empresa", cuit: "30-12345678-9" };

  test("with email confirmation on, there is no destination: the screen asks to check the email", async () => {
    dal.registrar.mockResolvedValue({ ok: true, sesionIniciada: false });

    await expect(registrarse(datosPostulante, "http://localhost/acceso/confirmar")).resolves.toEqual({
      ok: true,
      datos: { destino: null },
    });
    expect(dal.registrar).toHaveBeenCalledWith(
      datosPostulante,
      "http://localhost/acceso/confirmar",
    );
  });

  test("when Supabase logs the person in right away, goes to the role's home (D-034)", async () => {
    dal.registrar.mockResolvedValue({ ok: true, sesionIniciada: true });

    await expect(registrarse(datosEmpresa, "u")).resolves.toEqual({
      ok: true,
      datos: { destino: "/empresa" },
    });
  });

  test("an email Supabase could not send is 'unavailable', with a message to try later", async () => {
    dal.registrar.mockResolvedValue({ ok: false, motivo: "envio_fallido" });

    const resultado = await registrarse(datosPostulante, "u");

    expect(resultado.ok === false && resultado.falla).toBe("unavailable");
  });
});

test("the recovery answers the same whether the email has an account or not", async () => {
  dal.enviarRecuperacion.mockResolvedValue({ ok: true });

  await expect(pedirRecuperacion({ email: "cualquiera@ejemplo.com" }, "u")).resolves.toEqual({
    ok: true,
    datos: undefined,
  });
});

test("a new password without the recovery session says the link expired", async () => {
  dal.cambiarContrasena.mockResolvedValue({ ok: false, motivo: "sin_sesion" });

  const resultado = await elegirNuevaContrasena({ password: "12345678" });

  expect(resultado.ok === false && resultado.falla).toBe("unauthenticated");
});

describe("abrirEnlace", () => {
  test("a recovery link leads to choosing the new password", async () => {
    dal.abrirSesionConEnlace.mockResolvedValue("postulante");

    await expect(abrirEnlace({ code: "c" }, true)).resolves.toEqual({ ok: true, datos: { destino: "/nueva-contrasena" } });
  });

  test("an activation link leads to the role's home", async () => {
    dal.abrirSesionConEnlace.mockResolvedValue("empresa");

    await expect(abrirEnlace({ tokenHash: "t", tipo: "signup" }, false)).resolves.toEqual({
      ok: true,
      datos: { destino: "/empresa" },
    });
  });

  test("an expired link fails", async () => {
    dal.abrirSesionConEnlace.mockResolvedValue(null);

    const resultado = await abrirEnlace({ code: "vencido" }, false);

    expect(resultado.ok).toBe(false);
  });
});

test("the session answer has only the role and the email", () => {
  expect(verSesion(null)).toEqual({ ok: true, datos: { usuario: null } });
  expect(verSesion({ id: "u-1", rol: "admin", email: "oficina@ejemplo.com" })).toEqual({
    ok: true,
    datos: { usuario: { rol: "admin", email: "oficina@ejemplo.com" } },
  });
});
