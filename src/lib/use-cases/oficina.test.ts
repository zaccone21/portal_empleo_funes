import { beforeEach, describe, expect, test, vi } from "vitest";

import type { CurrentUser } from "@/lib/dal/auth";
import type { EmpresaLista } from "@/lib/dal/empresas";
import type { OfertaConEmpresa } from "@/lib/dal/ofertas";
import type { PostulacionAdmin } from "@/lib/validation/oficina";

vi.mock("server-only", () => ({}));

const dal = vi.hoisted(() => ({
  actualizarEstadoOferta: vi.fn(),
  contarOfertas: vi.fn(),
  leerOfertaParaOficina: vi.fn(),
  listarOfertasParaOficina: vi.fn(),
  actualizarEstadoPostulacion: vi.fn(),
  contarPostulaciones: vi.fn(),
  contarDerivaciones: vi.fn(),
  contarDecisiones: vi.fn(),
  contarDerivadasSinDecision: vi.fn(),
  crearPostulacionDeOficina: vi.fn(),
  guardarPreentrevista: vi.fn(),
  leerPostulacionAdmin: vi.fn(),
  listarPostulacionesAdmin: vi.fn(),
  listarDerivadasSinDecision: vi.fn(),
  leerCv: vi.fn(),
  crearUrlFirmadaCv: vi.fn(),
  buscarPostulantes: vi.fn(),
  contarPostulantes: vi.fn(),
  leerPerfilPostulanteAdmin: vi.fn(),
  listarEmpresas: vi.fn(),
  contarEmpresasPendientes: vi.fn(),
  leerEmpresaParaOficina: vi.fn(),
  actualizarEstadoEmpresa: vi.fn(),
  listarDerivacionesCurso: vi.fn(),
  crearDerivacionCurso: vi.fn(),
  contarDerivacionesCurso: vi.fn(),
}));

const emailMock = vi.hoisted(() => ({
  enviarCorreo: vi.fn().mockResolvedValue({ ok: true }),
}));

vi.mock("@/lib/email/resend", () => ({
  enviarCorreo: emailMock.enviarCorreo,
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
  contarDerivaciones: dal.contarDerivaciones,
  contarDecisiones: dal.contarDecisiones,
  contarDerivadasSinDecision: dal.contarDerivadasSinDecision,
  crearPostulacionDeOficina: dal.crearPostulacionDeOficina,
  guardarPreentrevista: dal.guardarPreentrevista,
  leerPostulacionAdmin: dal.leerPostulacionAdmin,
  listarPostulacionesAdmin: dal.listarPostulacionesAdmin,
  listarDerivadasSinDecision: dal.listarDerivadasSinDecision,
}));
vi.mock("@/lib/dal/postulantes", () => ({
  buscarPostulantes: dal.buscarPostulantes,
  contarPostulantes: dal.contarPostulantes,
  leerPerfilPostulanteAdmin: dal.leerPerfilPostulanteAdmin,
}));
vi.mock("@/lib/dal/empresas", () => ({
  listarEmpresas: dal.listarEmpresas,
  contarEmpresasPendientes: dal.contarEmpresasPendientes,
  leerEmpresaParaOficina: dal.leerEmpresaParaOficina,
  actualizarEstadoEmpresa: dal.actualizarEstadoEmpresa,
}));
vi.mock("@/lib/dal/cv", () => ({ leerCv: dal.leerCv, crearUrlFirmadaCv: dal.crearUrlFirmadaCv }));
vi.mock("@/lib/dal/derivaciones-curso", () => ({
  listarDerivacionesCurso: dal.listarDerivacionesCurso,
  crearDerivacionCurso: dal.crearDerivacionCurso,
  contarDerivacionesCurso: dal.contarDerivacionesCurso,
}));

import {
  abrirCvPostulante,
  aprobarEmpresa,
  asociarPostulanteAOferta,
  buscarPostulantes,
  cerrarOferta,
  getConteosAdmin,
  publicarOfertaPendiente,
  rechazarEmpresa,
  rechazarOferta,
  registrarDerivacionCurso,
  registrarPreentrevista,
  resolverPostulacion,
  verDerivadasSinRespuesta,
  verIndicadoresAdmin,
  verSeguimientoPostulante,
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

function postulacion(datos: Partial<PostulacionAdmin>): PostulacionAdmin {
  return {
    id: "p-1",
    estado: "postulado",
    postuladoEl: "2026-09-29T12:00:00.000Z",
    preentrevista: null,
    derivadaEl: null,
    decisionEmpresa: null,
    motivoNoContratacion: null,
    oferta: {
      id: "oferta-1",
      titulo: "Puesto (ejemplo)",
      lugar: "Centro",
      jornada: "Mañana",
      descripcion: "Tareas",
      requisitos: "Ninguno",
      sueldo: null,
      rubros: ["otros"],
      empresaId: "empresa-1",
      empresa: null,
    },
    postulante: {
      id: "postulante-1",
      nombre: "Persona",
      apellido: "De Prueba",
      dni: "30111222",
      telefono: null,
      email: "postulante@ejemplo.com",
      cvNombre: "cv.pdf",
      rubros: ["otros"],
    },
    ...datos,
  };
}

beforeEach(() => {
  for (const fn of Object.values(dal)) fn.mockReset();
  emailMock.enviarCorreo.mockClear();
});

test("only the Office gets the counters of its panel", async () => {
  const conteos = await getConteosAdmin(empresa);

  expect(conteos).toEqual({
    ofertasPendientes: 0,
    postulacionesNuevas: 0,
    cierresSolicitados: 0,
    porDerivar: 0,
    empresasPorAprobar: 0,
  });
  expect(dal.contarOfertas).not.toHaveBeenCalled();
  expect(dal.contarPostulaciones).not.toHaveBeenCalled();
  expect(dal.contarEmpresasPendientes).not.toHaveBeenCalled();
});

test("the Office counts the companies waiting for its approval (D-068)", async () => {
  dal.contarOfertas.mockResolvedValue(0);
  dal.contarPostulaciones.mockResolvedValue(0);
  dal.contarEmpresasPendientes.mockResolvedValue(2);

  const conteos = await getConteosAdmin(oficina);

  expect(conteos.empresasPorAprobar).toBe(2);
});

function empresaLista(datos: Partial<EmpresaLista> = {}): EmpresaLista {
  return {
    id: "empresa-1",
    razonSocial: "Empresa (ejemplo)",
    cuit: "30-71234567-1",
    contactoNombre: "Persona",
    contactoEmail: "contacto@ejemplo.com",
    contactoTelefono: "341 555-0000",
    creadaEl: "2026-10-20T12:00:00.000Z",
    estado: "pendiente",
    motivoRechazo: null,
    ...datos,
  };
}

describe("aprobarEmpresa (D-068)", () => {
  test("only the Office approves, and nothing is read for anyone else", async () => {
    const resultado = await aprobarEmpresa(empresa, "empresa-1");

    expect(resultado.ok === false && resultado.falla).toBe("forbidden");
    expect(dal.leerEmpresaParaOficina).not.toHaveBeenCalled();
  });

  test("a company that does not exist is 'not found'", async () => {
    dal.leerEmpresaParaOficina.mockResolvedValue(null);

    const resultado = await aprobarEmpresa(oficina, "no-existe");

    expect(resultado.ok === false && resultado.falla).toBe("not_found");
  });

  test("approves a pending company, only while it is still pending", async () => {
    dal.leerEmpresaParaOficina
      .mockResolvedValueOnce(empresaLista())
      .mockResolvedValueOnce(empresaLista({ estado: "aprobada" }));
    dal.actualizarEstadoEmpresa.mockResolvedValue(true);

    const resultado = await aprobarEmpresa(oficina, "empresa-1");

    expect(dal.actualizarEstadoEmpresa).toHaveBeenCalledWith("empresa-1", "pendiente", { estado: "aprobada" });
    expect(resultado.ok && resultado.datos.empresa.estado).toBe("aprobada");
    expect(emailMock.enviarCorreo).toHaveBeenCalledWith(
      expect.objectContaining({
        para: "contacto@ejemplo.com",
        asunto: expect.stringContaining("fue aprobada"),
      }),
    );
  });

  test("a rejected company can be approved later", async () => {
    dal.leerEmpresaParaOficina
      .mockResolvedValueOnce(empresaLista({ estado: "rechazada", motivoRechazo: "Faltan datos de la empresa" }))
      .mockResolvedValueOnce(empresaLista({ estado: "aprobada" }));
    dal.actualizarEstadoEmpresa.mockResolvedValue(true);

    const resultado = await aprobarEmpresa(oficina, "empresa-1");

    expect(dal.actualizarEstadoEmpresa).toHaveBeenCalledWith("empresa-1", "rechazada", { estado: "aprobada" });
    expect(resultado.ok).toBe(true);
  });

  test("an approved company is a conflict", async () => {
    dal.leerEmpresaParaOficina.mockResolvedValue(empresaLista({ estado: "aprobada" }));

    const resultado = await aprobarEmpresa(oficina, "empresa-1");

    expect(resultado.ok === false && resultado.falla).toBe("conflict");
    expect(dal.actualizarEstadoEmpresa).not.toHaveBeenCalled();
  });

  test("a company without its data cannot be approved", async () => {
    dal.leerEmpresaParaOficina.mockResolvedValue(empresaLista({ cuit: null, razonSocial: null }));

    const resultado = await aprobarEmpresa(oficina, "empresa-1");

    expect(resultado.ok === false && resultado.falla).toBe("conflict");
    expect(dal.actualizarEstadoEmpresa).not.toHaveBeenCalled();
  });

  test("if another operator decided first, it says so", async () => {
    dal.leerEmpresaParaOficina.mockResolvedValue(empresaLista());
    dal.actualizarEstadoEmpresa.mockResolvedValue(false);

    const resultado = await aprobarEmpresa(oficina, "empresa-1");

    expect(resultado.ok === false && resultado.falla).toBe("conflict");
  });
});

describe("rechazarEmpresa (D-068, D-069)", () => {
  test("only the Office rejects", async () => {
    const resultado = await rechazarEmpresa(empresa, "empresa-1", "Faltan datos de la empresa");

    expect(resultado.ok === false && resultado.falla).toBe("forbidden");
    expect(dal.actualizarEstadoEmpresa).not.toHaveBeenCalled();
  });

  test("rejects a pending company with the reason the company will read", async () => {
    dal.leerEmpresaParaOficina
      .mockResolvedValueOnce(empresaLista())
      .mockResolvedValueOnce(empresaLista({ estado: "rechazada", motivoRechazo: "Faltan datos de la empresa" }));
    dal.actualizarEstadoEmpresa.mockResolvedValue(true);

    const resultado = await rechazarEmpresa(oficina, "empresa-1", "Faltan datos de la empresa");

    expect(dal.actualizarEstadoEmpresa).toHaveBeenCalledWith("empresa-1", "pendiente", {
      estado: "rechazada",
      motivoRechazo: "Faltan datos de la empresa",
    });
    expect(resultado.ok && resultado.datos.empresa.motivoRechazo).toBe("Faltan datos de la empresa");
    expect(emailMock.enviarCorreo).toHaveBeenCalledWith(
      expect.objectContaining({
        para: "contacto@ejemplo.com",
        asunto: expect.stringContaining("Observaciones"),
      }),
    );
  });

  test.each(["aprobada", "rechazada"] as const)("a %s company was already reviewed", async (estado) => {
    dal.leerEmpresaParaOficina.mockResolvedValue(
      empresaLista({ estado, motivoRechazo: estado === "rechazada" ? "Otro motivo" : null }),
    );

    const resultado = await rechazarEmpresa(oficina, "empresa-1", "Otro motivo");

    expect(resultado.ok === false && resultado.falla).toBe("conflict");
    expect(dal.actualizarEstadoEmpresa).not.toHaveBeenCalled();
  });
});

describe("publicarOfertaPendiente (RF1.5.3)", () => {
  test("an offer that does not exist is 'not found'", async () => {
    dal.leerOfertaParaOficina.mockResolvedValue(null);

    const resultado = await publicarOfertaPendiente(oficina, "oferta-1");

    expect(resultado.ok === false && resultado.falla).toBe("not_found");
    expect(emailMock.enviarCorreo).not.toHaveBeenCalled();
  });

  test("an offer someone already decided is a conflict with the Office's message (D-030)", async () => {
    dal.leerOfertaParaOficina.mockResolvedValue(oferta({ estado: "publicada", publicadaEl: "2026-09-29T13:00:00.000Z" }));

    const resultado = await publicarOfertaPendiente(oficina, "oferta-1");

    expect(resultado).toEqual({ ok: false, falla: "conflict", mensaje: "Esta oferta ya fue revisada." });
    expect(dal.actualizarEstadoOferta).not.toHaveBeenCalled();
    expect(emailMock.enviarCorreo).not.toHaveBeenCalled();
  });

  test("a pending offer is published and notifies the company via email", async () => {
    dal.leerOfertaParaOficina
      .mockResolvedValueOnce(oferta({
        emailEmpresa: "empresa@ejemplo.com",
        titulo: "Puesto (ejemplo)",
        empresa: {
          razonSocial: "Empresa S.A.",
          cuit: "30-11111111-1",
          contactoNombre: "Juan",
          contactoTelefono: "123",
          contactoEmail: "empresa@ejemplo.com",
          descripcion: "",
        },
      }))
      .mockResolvedValueOnce(oferta({ estado: "publicada", publicadaEl: "2026-09-29T13:00:00.000Z" }));

    const resultado = await publicarOfertaPendiente(oficina, "oferta-1");

    expect(dal.actualizarEstadoOferta).toHaveBeenCalledWith("oferta-1", { estado: "publicada" });
    expect(resultado.ok && resultado.datos.oferta.estado).toBe("publicada");
    expect(emailMock.enviarCorreo).toHaveBeenCalledWith(
      expect.objectContaining({
        para: "empresa@ejemplo.com",
        asunto: expect.stringContaining("fue aprobada"),
      }),
    );
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

describe("resolverPostulacion (RF1.5.6, D-042)", () => {
  test("an application that does not exist is 'not found'", async () => {
    dal.leerPostulacionAdmin.mockResolvedValue(null);

    const resultado = await resolverPostulacion(oficina, "p-1", "preseleccionado");

    expect(resultado.ok === false && resultado.falla).toBe("not_found");
    expect(dal.actualizarEstadoPostulacion).not.toHaveBeenCalled();
  });

  test("a move that the current status does not allow is a conflict", async () => {
    dal.leerPostulacionAdmin.mockResolvedValue(postulacion({ estado: "derivado" }));

    const resultado = await resolverPostulacion(oficina, "p-1", "preseleccionado");

    expect(resultado.ok === false && resultado.falla).toBe("conflict");
    expect(dal.actualizarEstadoPostulacion).not.toHaveBeenCalled();
  });

  test("a new application can be pre-selected", async () => {
    dal.leerPostulacionAdmin
      .mockResolvedValueOnce(postulacion({}))
      .mockResolvedValueOnce(postulacion({ estado: "preseleccionado" }));

    const resultado = await resolverPostulacion(oficina, "p-1", "preseleccionado");

    expect(dal.actualizarEstadoPostulacion).toHaveBeenCalledWith("p-1", "preseleccionado");
    expect(resultado.ok && resultado.datos.postulacion.estado).toBe("preseleccionado");
    expect(emailMock.enviarCorreo).not.toHaveBeenCalled();
  });

  test("deriving an application notifies company and applicant via email", async () => {
    dal.leerPostulacionAdmin
      .mockResolvedValueOnce(postulacion({ estado: "preseleccionado" }))
      .mockResolvedValueOnce(
        postulacion({
          estado: "derivado",
          oferta: {
            id: "oferta-1",
            titulo: "Cajero",
            lugar: "Funes",
            jornada: "Completa",
            descripcion: "Tareas",
            requisitos: "Ninguno",
            empresaId: "empresa-1",
            sueldo: null,
            rubros: ["comercio"],
            empresa: {
              razonSocial: "Supermercado Funes",
              cuit: "30-11111111-1",
              contactoNombre: "Jefe RRHH",
              contactoTelefono: "123456",
              contactoEmail: "rrhh@superfunes.com",
              descripcion: null,
            },
          },
          postulante: {
            id: "postulante-1",
            nombre: "Juan",
            apellido: "Pérez",
            dni: "30111222",
            telefono: null,
            email: "juan@ejemplo.com",
            cvNombre: "cv.pdf",
            rubros: ["comercio"],
          },
        }),
      );

    const resultado = await resolverPostulacion(oficina, "p-1", "derivado");

    expect(dal.actualizarEstadoPostulacion).toHaveBeenCalledWith("p-1", "derivado");
    expect(resultado.ok && resultado.datos.postulacion.estado).toBe("derivado");

    // Company email
    expect(emailMock.enviarCorreo).toHaveBeenCalledWith(
      expect.objectContaining({
        para: "rrhh@superfunes.com",
        asunto: expect.stringContaining("Cajero"),
      }),
    );

    // Applicant email
    expect(emailMock.enviarCorreo).toHaveBeenCalledWith(
      expect.objectContaining({
        para: "juan@ejemplo.com",
        asunto: expect.stringContaining("Cajero"),
      }),
    );
  });

  test("a company never changes an application's status", async () => {
    const resultado = await resolverPostulacion(empresa, "p-1", "derivado");

    expect(resultado.ok === false && resultado.falla).toBe("forbidden");
    expect(dal.leerPostulacionAdmin).not.toHaveBeenCalled();
  });
});

describe("abrirCvPostulante (RF1.5.5, RNF1)", () => {
  test("without a CV there is nothing to open", async () => {
    dal.leerCv.mockResolvedValue(null);

    const resultado = await abrirCvPostulante(oficina, "postulante-1");

    expect(resultado.ok === false && resultado.falla).toBe("not_found");
    expect(dal.crearUrlFirmadaCv).not.toHaveBeenCalled();
  });

  test("gives a signed link to the stored file", async () => {
    dal.leerCv.mockResolvedValue({ nombre: "cv.pdf", tamanoBytes: 1000, subidoEl: "2026-09-29T12:00:00.000Z" });
    dal.crearUrlFirmadaCv.mockResolvedValue("https://ejemplo.supabase.co/firmada");

    const resultado = await abrirCvPostulante(oficina, "postulante-1", true);

    expect(dal.crearUrlFirmadaCv).toHaveBeenCalledWith("postulante-1/cv.pdf", true);
    expect(resultado).toEqual({ ok: true, datos: { url: "https://ejemplo.supabase.co/firmada" } });
  });

  test("a company never opens CVs", async () => {
    const resultado = await abrirCvPostulante(empresa, "postulante-1");

    expect(resultado.ok === false && resultado.falla).toBe("forbidden");
    expect(dal.leerCv).not.toHaveBeenCalled();
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

const postulanteDePrueba = {
  id: "postulante-1",
  nombre: "Persona",
  apellido: "De Prueba",
  telefono: null,
  dni: "30111222",
  email: "postulante@ejemplo.com",
  rubros: ["otros"],
  cvSubidoEl: null,
  experiencia: null,
};

describe("registrarPreentrevista (RF1.6.1, D-045)", () => {
  test("an application that does not exist is 'not found'", async () => {
    dal.leerPostulacionAdmin.mockResolvedValue(null);

    const resultado = await registrarPreentrevista(oficina, "p-1", { fecha: "2026-10-20T13:00:00.000Z" });

    expect(resultado.ok === false && resultado.falla).toBe("not_found");
    expect(dal.guardarPreentrevista).not.toHaveBeenCalled();
  });

  test("saves the date, and empty notes as none", async () => {
    const preentrevista = { fecha: "2026-10-20T13:00:00.000Z", notas: null };
    dal.leerPostulacionAdmin.mockResolvedValueOnce(postulacion({})).mockResolvedValueOnce(postulacion({ preentrevista }));

    const resultado = await registrarPreentrevista(oficina, "p-1", { fecha: "2026-10-20T13:00:00.000Z", notas: "" });

    expect(dal.guardarPreentrevista).toHaveBeenCalledWith("p-1", expect.objectContaining(preentrevista));
    expect(resultado.ok && resultado.datos.postulacion.preentrevista).toEqual(preentrevista);
  });

  test("a company never records a pre-interview", async () => {
    const resultado = await registrarPreentrevista(empresa, "p-1", { fecha: "2026-10-20T13:00:00.000Z" });

    expect(resultado.ok === false && resultado.falla).toBe("forbidden");
    expect(dal.leerPostulacionAdmin).not.toHaveBeenCalled();
  });
});

describe("asociarPostulanteAOferta (RF1.5.8)", () => {
  test("only to a published offer", async () => {
    dal.leerPerfilPostulanteAdmin.mockResolvedValue(postulanteDePrueba);
    dal.leerOfertaParaOficina.mockResolvedValue(oferta({ estado: "cerrada" }));

    const resultado = await asociarPostulanteAOferta(oficina, "postulante-1", "oferta-1");

    expect(resultado.ok === false && resultado.falla).toBe("conflict");
    expect(dal.crearPostulacionDeOficina).not.toHaveBeenCalled();
  });

  test("a person already applied to the offer is a conflict the operator sees", async () => {
    dal.leerPerfilPostulanteAdmin.mockResolvedValue(postulanteDePrueba);
    dal.leerOfertaParaOficina.mockResolvedValue(oferta({ estado: "publicada", publicadaEl: "2026-09-29T13:00:00.000Z" }));
    dal.crearPostulacionDeOficina.mockResolvedValue(false);

    const resultado = await asociarPostulanteAOferta(oficina, "postulante-1", "oferta-1");

    expect(resultado).toEqual({ ok: false, falla: "conflict", mensaje: "Esta persona ya está postulada a esa oferta." });
  });

  test("links the applicant to a published offer", async () => {
    dal.leerPerfilPostulanteAdmin.mockResolvedValue(postulanteDePrueba);
    dal.leerOfertaParaOficina.mockResolvedValue(oferta({ estado: "publicada", publicadaEl: "2026-09-29T13:00:00.000Z" }));
    dal.crearPostulacionDeOficina.mockResolvedValue(true);

    const resultado = await asociarPostulanteAOferta(oficina, "postulante-1", "oferta-1");

    expect(dal.crearPostulacionDeOficina).toHaveBeenCalledWith("postulante-1", "oferta-1");
    expect(resultado.ok).toBe(true);
  });
});

describe("verSeguimientoPostulante (RF1.6.5, D-046)", () => {
  test("counts rejections only from the company's 'No contrata'", async () => {
    dal.leerPerfilPostulanteAdmin.mockResolvedValue(postulanteDePrueba);
    dal.listarPostulacionesAdmin.mockResolvedValue([
      postulacion({ id: "p-1", estado: "derivado", derivadaEl: "2026-10-01T12:00:00.000Z", decisionEmpresa: "no_contratado", motivoNoContratacion: "Sin experiencia" }),
      postulacion({ id: "p-2", estado: "derivado", derivadaEl: "2026-10-02T12:00:00.000Z", decisionEmpresa: "contratado" }),
      postulacion({ id: "p-3", estado: "derivado", derivadaEl: "2026-10-03T12:00:00.000Z" }),
      postulacion({ id: "p-4", estado: "preseleccionado" }),
      postulacion({ id: "p-5", estado: "no_apto" }),
      postulacion({ id: "p-6" }),
    ]);
    dal.listarDerivacionesCurso.mockResolvedValue([{ id: "c-1", curso: "Curso (ejemplo)", fecha: "2026-10-05", notas: null }]);

    const resultado = await verSeguimientoPostulante(oficina, "postulante-1");

    expect(dal.listarPostulacionesAdmin).toHaveBeenCalledWith("postulante-1");
    expect(resultado.ok && resultado.datos.resumen).toEqual({
      postulaciones: 6,
      preseleccionadas: 4,
      derivadas: 3,
      contrataciones: 1,
      rechazos: 1,
      noApto: 1,
      derivacionesCurso: 1,
    });
  });

  test("an applicant that does not exist is 'not found'", async () => {
    dal.leerPerfilPostulanteAdmin.mockResolvedValue(null);

    const resultado = await verSeguimientoPostulante(oficina, "postulante-1");

    expect(resultado.ok === false && resultado.falla).toBe("not_found");
    expect(dal.listarPostulacionesAdmin).not.toHaveBeenCalled();
  });
});

describe("registrarDerivacionCurso (RF1.6.6, D-047)", () => {
  test("saves the course, and empty notes as none", async () => {
    dal.leerPerfilPostulanteAdmin.mockResolvedValue(postulanteDePrueba);
    dal.crearDerivacionCurso.mockResolvedValue({ id: "c-1", curso: "Curso (ejemplo)", fecha: "2026-10-05", notas: null });

    const resultado = await registrarDerivacionCurso(oficina, "postulante-1", { curso: "Curso (ejemplo)", notas: "" });

    expect(dal.crearDerivacionCurso).toHaveBeenCalledWith("postulante-1", { curso: "Curso (ejemplo)", fecha: undefined, notas: null });
    expect(resultado.ok && resultado.datos.derivacion.curso).toBe("Curso (ejemplo)");
  });

  test("a company never registers course referrals", async () => {
    const resultado = await registrarDerivacionCurso(empresa, "postulante-1", { curso: "Curso (ejemplo)" });

    expect(resultado.ok === false && resultado.falla).toBe("forbidden");
    expect(dal.crearDerivacionCurso).not.toHaveBeenCalled();
  });
});

describe("panel indicators and queue (D-051, D-054)", () => {
  test("only the Office gets the indicators", async () => {
    const resultado = await verIndicadoresAdmin(empresa);

    expect(resultado.ok === false && resultado.falla).toBe("forbidden");
    expect(dal.contarPostulantes).not.toHaveBeenCalled();
  });

  test("rejections and hires are counted from the company's decisions", async () => {
    dal.contarPostulantes.mockResolvedValue(10);
    dal.contarOfertas.mockResolvedValue(4);
    dal.contarPostulaciones.mockResolvedValue(20);
    dal.contarDerivaciones.mockResolvedValue(6);
    dal.contarDecisiones.mockImplementation(async (decision: string) => (decision === "contratado" ? 2 : 3));
    dal.contarDerivacionesCurso.mockResolvedValue(1);
    dal.contarDerivadasSinDecision.mockResolvedValue(1);

    const resultado = await verIndicadoresAdmin(oficina);

    expect(dal.contarOfertas).toHaveBeenCalledWith("publicada");
    expect(resultado).toEqual({
      ok: true,
      datos: {
        postulantes: 10,
        ofertasActivas: 4,
        postulaciones: 20,
        derivaciones: 6,
        contrataciones: 2,
        rechazos: 3,
        derivacionesCurso: 1,
        sinRespuesta: 1,
      },
    });
  });

  test("only the Office sees the queue of referrals without an answer", async () => {
    const resultado = await verDerivadasSinRespuesta(empresa);

    expect(resultado.ok === false && resultado.falla).toBe("forbidden");
    expect(dal.listarDerivadasSinDecision).not.toHaveBeenCalled();
  });
});
