import { beforeEach, describe, expect, test, vi } from "vitest";

import type { CurrentUser } from "@/lib/dal/auth";
import type { Oferta } from "@/lib/dal/ofertas";

vi.mock("server-only", () => ({}));

const dal = vi.hoisted(() => ({
  leerPerfilEmpresa: vi.fn(),
  guardarPerfilEmpresa: vi.fn(),
  crearOferta: vi.fn(),
  leerOferta: vi.fn(),
  listarOfertasDeEmpresa: vi.fn(),
  marcarCierreSolicitado: vi.fn(),
}));
vi.mock("@/lib/dal/empresas", () => ({
  leerPerfilEmpresa: dal.leerPerfilEmpresa,
  guardarPerfilEmpresa: dal.guardarPerfilEmpresa,
}));
vi.mock("@/lib/dal/ofertas", () => ({
  crearOferta: dal.crearOferta,
  leerOferta: dal.leerOferta,
  listarOfertasDeEmpresa: dal.listarOfertasDeEmpresa,
  marcarCierreSolicitado: dal.marcarCierreSolicitado,
}));

import { guardarPerfil, pedirCierre, publicarOferta, verMisOfertas } from "./empresa";

const empresa: CurrentUser = { id: "empresa-1", rol: "empresa", email: "empresa@ejemplo.com" };
const postulante: CurrentUser = { id: "postulante-1", rol: "postulante", email: "persona@ejemplo.com" };

function oferta(datos: Partial<Oferta>): Oferta {
  return {
    id: "oferta-1",
    empresaId: "empresa-1",
    titulo: "Puesto (ejemplo)",
    descripcion: "Tareas",
    requisitos: "Requisitos",
    lugar: "Centro",
    jornada: "Mañana",
    sueldo: null,
    rubros: ["otros"],
    estado: "pendiente",
    motivoRechazo: null,
    cierreSolicitado: false,
    creadaEl: "2026-09-29T12:00:00.000Z",
    publicadaEl: null,
    ...datos,
  };
}

beforeEach(() => {
  for (const fn of Object.values(dal)) fn.mockReset();
});

test("only companies use the company area (403, and the DAL is not touched)", async () => {
  const resultado = await verMisOfertas(postulante);

  expect(resultado.ok === false && resultado.falla).toBe("forbidden");
  expect(dal.listarOfertasDeEmpresa).not.toHaveBeenCalled();
});

test("the company sees its offers, and the rejection reason only on rejected ones (RF1.3.5)", async () => {
  dal.listarOfertasDeEmpresa.mockResolvedValue([oferta({ estado: "rechazada", motivoRechazo: "Falta el horario." })]);

  const resultado = await verMisOfertas(empresa);

  expect(dal.listarOfertasDeEmpresa).toHaveBeenCalledWith("empresa-1");
  expect(resultado.ok && resultado.datos[0].motivoRechazo).toBe("Falta el horario.");
});

test("a new offer starts pending, and an empty pay field is saved as no pay", async () => {
  dal.crearOferta.mockResolvedValue("oferta-nueva");
  dal.leerOferta.mockResolvedValue(oferta({ id: "oferta-nueva" }));
  dal.leerPerfilEmpresa.mockResolvedValue({ perfil: {} });

  const resultado = await publicarOferta(empresa, {
    titulo: "Cadete",
    descripcion: "Entregas",
    requisitos: "Moto",
    lugar: "Centro",
    jornada: "Tardes",
    sueldo: "",
    rubros: ["transporte"],
  });

  expect(dal.crearOferta).toHaveBeenCalledWith(expect.objectContaining({ sueldo: null, rubros: ["transporte"] }));
  expect(resultado.ok && resultado.datos.oferta.estado).toBe("pendiente");
});

test("cannot publish without a profile", async () => {
  dal.leerPerfilEmpresa.mockResolvedValue({ perfil: null });

  const resultado = await publicarOferta(empresa, {
    titulo: "Cadete",
    descripcion: "Entregas",
    requisitos: "Moto",
    lugar: "Centro",
    jornada: "Tardes",
    sueldo: "",
    rubros: ["transporte"],
  });

  expect(resultado.ok === false && resultado.falla).toBe("conflict");
});

test("another company's CUIT is a conflict with a message for the person", async () => {
  dal.guardarPerfilEmpresa.mockResolvedValue({ ok: false, motivo: "cuit_repetido" });

  const resultado = await guardarPerfil(empresa, {
    razonSocial: "Empresa (ejemplo)",
    cuit: "30-71234567-1",
    descripcion: "",
    contactoNombre: "Persona",
    contactoTelefono: "341 555-0000",
    contactoEmail: "contacto@ejemplo.com",
  });

  expect(resultado.ok === false && resultado.falla).toBe("conflict");
});

describe("pedirCierre (RF1.3.6)", () => {
  test("another company's offer answers the same as one that does not exist", async () => {
    dal.leerOferta.mockResolvedValue(oferta({ empresaId: "otra-empresa", estado: "publicada" }));

    const resultado = await pedirCierre(empresa, "oferta-1");

    expect(resultado.ok === false && resultado.falla).toBe("not_found");
    expect(dal.marcarCierreSolicitado).not.toHaveBeenCalled();
  });

  test("only a published offer can be closed", async () => {
    dal.leerOferta.mockResolvedValue(oferta({ estado: "pendiente" }));

    const resultado = await pedirCierre(empresa, "oferta-1");

    expect(resultado.ok === false && resultado.falla).toBe("conflict");
  });

  test("marks the request, and asking twice does not mark it again", async () => {
    dal.leerOferta.mockResolvedValueOnce(oferta({ estado: "publicada" }));
    const primera = await pedirCierre(empresa, "oferta-1");

    dal.leerOferta.mockResolvedValueOnce(oferta({ estado: "publicada", cierreSolicitado: true }));
    const segunda = await pedirCierre(empresa, "oferta-1");

    expect(dal.marcarCierreSolicitado).toHaveBeenCalledTimes(1);
    expect(primera.ok && primera.datos.oferta.cierreSolicitado).toBe(true);
    expect(segunda.ok).toBe(true);
  });
});
