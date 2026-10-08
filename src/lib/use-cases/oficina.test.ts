import { beforeEach, describe, expect, test, vi } from "vitest";

import type { CurrentUser } from "@/lib/dal/auth";
import type { OfertaConEmpresa } from "@/lib/dal/ofertas";

vi.mock("server-only", () => ({}));

const dal = vi.hoisted(() => ({
  actualizarEstadoOferta: vi.fn(),
  contarOfertas: vi.fn(),
  leerOfertaParaOficina: vi.fn(),
  listarOfertasParaOficina: vi.fn(),
  actualizarEstadoPostulacion: vi.fn(),
  contarPostulaciones: vi.fn(),
  leerRutaCvDePostulacion: vi.fn(),
  listarPostulacionesDeOferta: vi.fn(),
  crearUrlFirmadaCv: vi.fn(),
  buscarPostulantes: vi.fn(),
}));
vi.mock("@/lib/dal/ofertas", () => ({
  actualizarEstadoOferta: dal.actualizarEstadoOferta,
  contarOfertas: dal.contarOfertas,
  leerOfertaParaOficina: dal.leerOfertaParaOficina,
  listarOfertasParaOficina: dal.listarOfertasParaOficina,
}));
vi.mock("@/lib/dal/postulaciones", () => ({
  actualizarEstadoPostulacion: dal.actualizarEstadoPostulacion,
  contarPostulaciones: dal.contarPostulaciones,
  leerRutaCvDePostulacion: dal.leerRutaCvDePostulacion,
  listarPostulacionesDeOferta: dal.listarPostulacionesDeOferta,
}));
vi.mock("@/lib/dal/postulantes", () => ({
  buscarPostulantes: dal.buscarPostulantes,
}));
vi.mock("@/lib/dal/cv", () => ({ crearUrlFirmadaCv: dal.crearUrlFirmadaCv }));

import {
  abrirCv,
  buscarPostulantes,
  cambiarEstadoPostulacion,
  cerrarOferta,
  publicarOfertaPendiente,
  rechazarOferta,
  verResumen,
} from "./oficina";

const oficina: CurrentUser = { id: "admin-1", rol: "admin", email: "oficina@ejemplo.com" };
const empresa: CurrentUser = { id: "empresa-1", rol: "empresa", email: "empresa@ejemplo.com" };

function oferta(datos: Partial<OfertaConEmpresa>): OfertaConEmpresa {
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
    emailEmpresa: "empresa@ejemplo.com",
    empresa: null,
    cantidadPostulaciones: 0,
    ...datos,
  };
}

beforeEach(() => {
  for (const fn of Object.values(dal)) fn.mockReset();
});

test("only the Office sees its panel", async () => {
  const resultado = await verResumen(empresa);

  expect(resultado.ok === false && resultado.falla).toBe("forbidden");
  expect(dal.contarOfertas).not.toHaveBeenCalled();
});

describe("publicarOfertaPendiente (RF1.5.3)", () => {
  test("an offer that does not exist is 'not found'", async () => {
    dal.leerOfertaParaOficina.mockResolvedValue(null);

    const resultado = await publicarOfertaPendiente(oficina, "oferta-1");

    expect(resultado.ok === false && resultado.falla).toBe("not_found");
  });

  test("an offer someone already decided is a conflict with the Office's message (D-030)", async () => {
    dal.leerOfertaParaOficina.mockResolvedValue(oferta({ estado: "publicada", publicadaEl: "2026-09-29T13:00:00.000Z" }));

    const resultado = await publicarOfertaPendiente(oficina, "oferta-1");

    expect(resultado).toEqual({ ok: false, falla: "conflict", mensaje: "Esta oferta ya fue revisada." });
    expect(dal.actualizarEstadoOferta).not.toHaveBeenCalled();
  });

  test("a pending offer is published", async () => {
    dal.leerOfertaParaOficina
      .mockResolvedValueOnce(oferta({}))
      .mockResolvedValueOnce(oferta({ estado: "publicada", publicadaEl: "2026-09-29T13:00:00.000Z" }));

    const resultado = await publicarOfertaPendiente(oficina, "oferta-1");

    expect(dal.actualizarEstadoOferta).toHaveBeenCalledWith("oferta-1", { estado: "publicada" });
    expect(resultado.ok && resultado.datos.oferta.estado).toBe("publicada");
  });
});

test("rejecting saves the reason the company will read (RF1.3.5)", async () => {
  dal.leerOfertaParaOficina
    .mockResolvedValueOnce(oferta({}))
    .mockResolvedValueOnce(oferta({ estado: "rechazada", motivoRechazo: "Falta el horario." }));

  await rechazarOferta(oficina, "oferta-1", "Falta el horario.");

  expect(dal.actualizarEstadoOferta).toHaveBeenCalledWith("oferta-1", {
    estado: "rechazada",
    motivoRechazo: "Falta el horario.",
  });
});

test("an offer is closed only if its company asked for it (RF1.5.4)", async () => {
  dal.leerOfertaParaOficina.mockResolvedValue(oferta({ estado: "publicada", publicadaEl: "2026-09-29T13:00:00.000Z" }));

  const resultado = await cerrarOferta(oficina, "oferta-1");

  expect(resultado.ok === false && resultado.falla).toBe("conflict");
  expect(dal.actualizarEstadoOferta).not.toHaveBeenCalled();
});

test("changing the status of an application that does not exist is 'not found'", async () => {
  dal.actualizarEstadoPostulacion.mockResolvedValue(null);

  const resultado = await cambiarEstadoPostulacion(oficina, "p-1", "preseleccionado");

  expect(resultado.ok === false && resultado.falla).toBe("not_found");
});

describe("abrirCv (RF1.5.5, RNF1)", () => {
  test("without a CV there is nothing to open", async () => {
    dal.leerRutaCvDePostulacion.mockResolvedValue(null);

    const resultado = await abrirCv(oficina, "p-1");

    expect(resultado.ok === false && resultado.falla).toBe("not_found");
  });

  test("gives a signed link to the stored file", async () => {
    dal.leerRutaCvDePostulacion.mockResolvedValue("postulante-1/cv.pdf");
    dal.crearUrlFirmadaCv.mockResolvedValue("https://ejemplo.supabase.co/firmada");

    const resultado = await abrirCv(oficina, "p-1");

    expect(dal.crearUrlFirmadaCv).toHaveBeenCalledWith("postulante-1/cv.pdf");
    expect(resultado).toEqual({ ok: true, datos: { url: "https://ejemplo.supabase.co/firmada" } });
  });

  test("a company never opens CVs", async () => {
    const resultado = await abrirCv(empresa, "p-1");

    expect(resultado.ok === false && resultado.falla).toBe("forbidden");
    expect(dal.leerRutaCvDePostulacion).not.toHaveBeenCalled();
  });
});

describe("buscarPostulantes", () => {
  test("allows admin to search applicants with filters", async () => {
    const mockPostulantes = [
      {
        id: "postulante-1",
        nombre: "Juan",
        apellido: "Pérez",
        telefono: "12345678",
        dni: "12345678",
        email: "juan@ejemplo.com",
        rubros: ["gastronomia"],
        cvSubidoEl: "2026-09-29T12:00:00.000Z",
      },
    ];
    dal.buscarPostulantes.mockResolvedValue(mockPostulantes);

    const resultado = await buscarPostulantes(oficina, { q: "Juan", rubros: ["gastronomia"] });

    expect(dal.buscarPostulantes).toHaveBeenCalledWith({ q: "Juan", rubros: ["gastronomia"] });
    expect(resultado).toEqual({ ok: true, datos: mockPostulantes });
  });

  test("denies access to non-admin roles", async () => {
    const resultado = await buscarPostulantes(empresa, { q: "Juan" });

    expect(resultado.ok === false && resultado.falla).toBe("forbidden");
    expect(dal.buscarPostulantes).not.toHaveBeenCalled();
  });
});
