import { beforeEach, describe, expect, test, vi } from "vitest";

import type { CurrentUser } from "@/lib/dal/auth";
import type { Candidato } from "@/lib/dal/candidatos";
import type { Oferta } from "@/lib/dal/ofertas";

vi.mock("server-only", () => ({}));

const dal = vi.hoisted(() => ({
  leerPerfilEmpresa: vi.fn(),
  guardarPerfilEmpresa: vi.fn(),
  crearOferta: vi.fn(),
  leerOferta: vi.fn(),
  listarOfertasDeEmpresa: vi.fn(),
  marcarCierreSolicitado: vi.fn(),
  listarCandidatosDerivados: vi.fn(),
  leerCandidato: vi.fn(),
  guardarDecisionEmpresa: vi.fn(),
  crearUrlFirmadaCvParaEmpresa: vi.fn(),
}));
vi.mock("@/lib/dal/candidatos", () => ({
  listarCandidatosDerivados: dal.listarCandidatosDerivados,
  leerCandidato: dal.leerCandidato,
  guardarDecisionEmpresa: dal.guardarDecisionEmpresa,
}));
vi.mock("@/lib/dal/cv", () => ({ crearUrlFirmadaCvParaEmpresa: dal.crearUrlFirmadaCvParaEmpresa }));
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

import {
  abrirCvCandidato,
  decidirCandidato,
  guardarPerfil,
  pedirCierre,
  publicarOferta,
  verCandidatosDerivados,
  verMiOferta,
  verMisOfertas,
} from "./empresa";

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

describe("verMiOferta (D-048)", () => {
  test("another company's published offer answers the same as one that does not exist", async () => {
    dal.leerOferta.mockResolvedValue(oferta({ empresaId: "otra-empresa", estado: "publicada" }));

    const resultado = await verMiOferta(empresa, "oferta-1");

    expect(resultado.ok === false && resultado.falla).toBe("not_found");
  });

  test("returns the company's own offer to fill in the duplicate", async () => {
    dal.leerOferta.mockResolvedValue(oferta({ estado: "rechazada", motivoRechazo: "Falta el horario." }));

    const resultado = await verMiOferta(empresa, "oferta-1");

    expect(resultado.ok && resultado.datos.oferta.titulo).toBe("Puesto (ejemplo)");
  });
});

function candidato(datos: Partial<Candidato>): Candidato {
  return {
    postulacionId: "p-1",
    postulanteId: "postulante-1",
    empresaId: "empresa-1",
    estado: "derivado",
    oferta: { id: "oferta-1", titulo: "Puesto (ejemplo)" },
    derivadoEl: "2026-10-10T12:00:00.000Z",
    nombre: "Persona",
    apellido: "De Prueba",
    telefono: "341 555-0000",
    email: "persona@ejemplo.com",
    rubros: ["otros"],
    tieneCv: true,
    decision: null,
    motivoNoContratacion: null,
    ...datos,
  };
}

describe("verCandidatosDerivados (RF1.6.3, D-044)", () => {
  test("only companies see referred applicants", async () => {
    const resultado = await verCandidatosDerivados(postulante);

    expect(resultado.ok === false && resultado.falla).toBe("forbidden");
    expect(dal.listarCandidatosDerivados).not.toHaveBeenCalled();
  });

  test("another company's offer answers 'not found' and lists nobody", async () => {
    dal.leerOferta.mockResolvedValue(oferta({ empresaId: "otra-empresa", estado: "publicada" }));

    const resultado = await verCandidatosDerivados(empresa, "oferta-1");

    expect(resultado.ok === false && resultado.falla).toBe("not_found");
    expect(dal.listarCandidatosDerivados).not.toHaveBeenCalled();
  });

  test("lists the company's referred applicants without internal ids or status", async () => {
    dal.listarCandidatosDerivados.mockResolvedValue([candidato({})]);

    const resultado = await verCandidatosDerivados(empresa);

    expect(dal.listarCandidatosDerivados).toHaveBeenCalledWith("empresa-1", undefined);
    expect(resultado.ok && resultado.datos[0]).not.toHaveProperty("postulanteId");
    expect(resultado.ok && resultado.datos[0]).not.toHaveProperty("estado");
    expect(resultado.ok && resultado.datos[0]).not.toHaveProperty("empresaId");
  });
});

describe("decidirCandidato (RF1.6.4, D-044)", () => {
  test("another company's applicant answers 'not found'", async () => {
    dal.leerCandidato.mockResolvedValue(candidato({ empresaId: "otra-empresa" }));

    const resultado = await decidirCandidato(empresa, "p-1", { decision: "contratado" });

    expect(resultado.ok === false && resultado.falla).toBe("not_found");
    expect(dal.guardarDecisionEmpresa).not.toHaveBeenCalled();
  });

  test("an application the Office did not refer answers 'not found'", async () => {
    dal.leerCandidato.mockResolvedValue(candidato({ estado: "preseleccionado" }));

    const resultado = await decidirCandidato(empresa, "p-1", { decision: "contratado" });

    expect(resultado.ok === false && resultado.falla).toBe("not_found");
    expect(dal.guardarDecisionEmpresa).not.toHaveBeenCalled();
  });

  test("the decision is answered only once", async () => {
    dal.leerCandidato.mockResolvedValue(candidato({ decision: "contratado" }));

    const resultado = await decidirCandidato(empresa, "p-1", { decision: "no_contratado", motivo: "Otro perfil" });

    expect(resultado.ok === false && resultado.falla).toBe("conflict");
    expect(dal.guardarDecisionEmpresa).not.toHaveBeenCalled();
  });

  test("two answers at once: the one that loses is a conflict", async () => {
    dal.leerCandidato.mockResolvedValue(candidato({}));
    dal.guardarDecisionEmpresa.mockResolvedValue(false);

    const resultado = await decidirCandidato(empresa, "p-1", { decision: "contratado" });

    expect(resultado.ok === false && resultado.falla).toBe("conflict");
  });

  test("not hiring without a reason is invalid", async () => {
    dal.leerCandidato.mockResolvedValue(candidato({}));

    const resultado = await decidirCandidato(empresa, "p-1", { decision: "no_contratado" });

    expect(resultado.ok === false && resultado.falla).toBe("invalid");
    expect(dal.guardarDecisionEmpresa).not.toHaveBeenCalled();
  });

  test("not hiring saves the reason", async () => {
    dal.leerCandidato.mockResolvedValue(candidato({}));
    dal.guardarDecisionEmpresa.mockResolvedValue(true);

    const resultado = await decidirCandidato(empresa, "p-1", { decision: "no_contratado", motivo: "Buscaba más experiencia" });

    expect(dal.guardarDecisionEmpresa).toHaveBeenCalledWith("p-1", "no_contratado", "Buscaba más experiencia");
    expect(resultado.ok && resultado.datos.candidato.decision).toBe("no_contratado");
  });

  test("hiring does not keep a reason", async () => {
    dal.leerCandidato.mockResolvedValue(candidato({}));
    dal.guardarDecisionEmpresa.mockResolvedValue(true);

    await decidirCandidato(empresa, "p-1", { decision: "contratado", motivo: "Sobra" });

    expect(dal.guardarDecisionEmpresa).toHaveBeenCalledWith("p-1", "contratado", null);
  });
});

describe("abrirCvCandidato (RNF1, D-044)", () => {
  test("another company's applicant gets no link", async () => {
    dal.leerCandidato.mockResolvedValue(candidato({ empresaId: "otra-empresa" }));

    const resultado = await abrirCvCandidato(empresa, "p-1");

    expect(resultado.ok === false && resultado.falla).toBe("not_found");
    expect(dal.crearUrlFirmadaCvParaEmpresa).not.toHaveBeenCalled();
  });

  test("gives a signed link to a referred applicant's CV", async () => {
    dal.leerCandidato.mockResolvedValue(candidato({}));
    dal.crearUrlFirmadaCvParaEmpresa.mockResolvedValue("https://ejemplo.supabase.co/firmada");

    const resultado = await abrirCvCandidato(empresa, "p-1");

    expect(dal.crearUrlFirmadaCvParaEmpresa).toHaveBeenCalledWith("postulante-1");
    expect(resultado).toEqual({ ok: true, datos: { url: "https://ejemplo.supabase.co/firmada" } });
  });
});
