import { beforeEach, describe, expect, test, vi } from "vitest";

import type { CurrentUser } from "@/lib/dal/auth";

vi.mock("server-only", () => ({}));

const dal = vi.hoisted(() => ({
  listarCuentasOficina: vi.fn(),
  crearCuentaOficina: vi.fn(),
}));

vi.mock("@/lib/dal/equipo", () => dal);

import { crearCuentaOficina, generarContrasenaTemporal, verEquipoOficina } from "./equipo";

const oficina: CurrentUser = { id: "oficina-1", rol: "admin", email: "oficina@ejemplo.com" };
const empresa: CurrentUser = { id: "empresa-1", rol: "empresa", email: "empresa@ejemplo.com" };

beforeEach(() => {
  for (const fn of Object.values(dal)) fn.mockReset();
});

describe("generarContrasenaTemporal", () => {
  test("is 4 groups of 4 easy-to-read characters, different every time", () => {
    const primera = generarContrasenaTemporal();

    expect(primera).toMatch(/^[a-z2-9]{4}-[a-z2-9]{4}-[a-z2-9]{4}-[a-z2-9]{4}$/);
    expect(primera).not.toMatch(/[01ilo]/);
    expect(generarContrasenaTemporal()).not.toBe(primera);
  });
});

describe("verEquipoOficina (D-058)", () => {
  test("only the Office sees its accounts", async () => {
    const resultado = await verEquipoOficina(empresa);

    expect(resultado.ok === false && resultado.falla).toBe("forbidden");
    expect(dal.listarCuentasOficina).not.toHaveBeenCalled();
  });

  test("lists the Office accounts", async () => {
    const cuentas = [{ id: "oficina-1", email: "oficina@ejemplo.com", creadaEl: "2026-10-01T12:00:00.000Z" }];
    dal.listarCuentasOficina.mockResolvedValue(cuentas);

    const resultado = await verEquipoOficina(oficina);

    expect(resultado).toEqual({ ok: true, datos: cuentas });
  });
});

describe("crearCuentaOficina (D-058)", () => {
  test("only the Office can create Office accounts", async () => {
    const resultado = await crearCuentaOficina(empresa, { email: "nueva@ejemplo.com" });

    expect(resultado.ok === false && resultado.falla).toBe("forbidden");
    expect(dal.crearCuentaOficina).not.toHaveBeenCalled();
  });

  test("creates the account with a temporary password and returns it once", async () => {
    dal.crearCuentaOficina.mockResolvedValue({ ok: true });

    const resultado = await crearCuentaOficina(oficina, { email: "Nueva@Ejemplo.com" });

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;
    expect(resultado.datos.email).toBe("nueva@ejemplo.com");
    expect(dal.crearCuentaOficina).toHaveBeenCalledWith("nueva@ejemplo.com", resultado.datos.contrasenaTemporal);
  });

  test("an email that already has an account is a conflict", async () => {
    dal.crearCuentaOficina.mockResolvedValue({ ok: false, motivo: "email_existente" });

    const resultado = await crearCuentaOficina(oficina, { email: "oficina@ejemplo.com" });

    expect(resultado.ok === false && resultado.falla).toBe("conflict");
  });
});
