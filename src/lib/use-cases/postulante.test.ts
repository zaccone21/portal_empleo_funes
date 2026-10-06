import { beforeEach, describe, expect, test, vi } from "vitest";

import type { CurrentUser } from "@/lib/dal/auth";
import type { Oferta } from "@/lib/dal/ofertas";

vi.mock("server-only", () => ({}));

const dal = vi.hoisted(() => ({
  leerOferta: vi.fn(),
  listarOfertasPublicadas: vi.fn(),
  crearPostulacion: vi.fn(),
  idsDeOfertasPostuladas: vi.fn(),
  listarPostulacionesPropias: vi.fn(),
  leerCv: vi.fn(),
  guardarCv: vi.fn(),
  crearUrlFirmadaCv: vi.fn(),
  leerPerfilPostulante: vi.fn(),
  guardarPerfilPostulante: vi.fn(),
  perfilCompletoPostulante: vi.fn(),
}));
vi.mock("@/lib/dal/ofertas", () => ({
  leerOferta: dal.leerOferta,
  listarOfertasPublicadas: dal.listarOfertasPublicadas,
}));
vi.mock("@/lib/dal/postulaciones", () => ({
  crearPostulacion: dal.crearPostulacion,
  idsDeOfertasPostuladas: dal.idsDeOfertasPostuladas,
  listarPostulacionesPropias: dal.listarPostulacionesPropias,
}));
vi.mock("@/lib/dal/cv", () => ({
  leerCv: dal.leerCv,
  guardarCv: dal.guardarCv,
  crearUrlFirmadaCv: dal.crearUrlFirmadaCv,
}));
vi.mock("@/lib/dal/postulantes", () => ({
  leerPerfilPostulante: dal.leerPerfilPostulante,
  guardarPerfilPostulante: dal.guardarPerfilPostulante,
  perfilCompletoPostulante: dal.perfilCompletoPostulante,
}));

import {
  abrirMiCv,
  obtenerPerfilPostulante,
  postularme,
  subirMiCv,
  verMisPostulaciones,
  verOfertasPublicadas,
} from "./postulante";

const postulante: CurrentUser = { id: "postulante-1", rol: "postulante", email: "persona@ejemplo.com" };
const empresa: CurrentUser = { id: "empresa-1", rol: "empresa", email: "empresa@ejemplo.com" };
const cv = { nombre: "cv.pdf", tamanoBytes: 1000, subidoEl: "2026-09-29T12:00:00.000Z" };

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
    estado: "publicada",
    motivoRechazo: null,
    cierreSolicitado: false,
    creadaEl: "2026-09-29T12:00:00.000Z",
    publicadaEl: "2026-09-29T13:00:00.000Z",
    ...datos,
  };
}

beforeEach(() => {
  for (const fn of Object.values(dal)) fn.mockReset();
});

describe("verOfertasPublicadas", () => {
  test("marks the offers the logged-in applicant already applied to (D-028)", async () => {
    dal.listarOfertasPublicadas.mockResolvedValue([oferta({ id: "a" }), oferta({ id: "b" })]);
    dal.idsDeOfertasPostuladas.mockResolvedValue(new Set(["b"]));

    const resultado = await verOfertasPublicadas(postulante);

    expect(resultado.ok && resultado.datos.map((o) => o.yaTePostulaste)).toEqual([false, true]);
  });

  test("works without a session and never shows the company or the status (RF1.4.1)", async () => {
    dal.listarOfertasPublicadas.mockResolvedValue([oferta({})]);

    const resultado = await verOfertasPublicadas(null);

    expect(dal.idsDeOfertasPostuladas).not.toHaveBeenCalled();
    const publica = resultado.ok ? resultado.datos[0] : null;
    expect(publica).not.toHaveProperty("estado");
    expect(publica).not.toHaveProperty("empresaId");
  });

  test("a company looking at the catalog has no 'ya te postulaste'", async () => {
    dal.listarOfertasPublicadas.mockResolvedValue([oferta({})]);

    await verOfertasPublicadas(empresa);

    expect(dal.idsDeOfertasPostuladas).not.toHaveBeenCalled();
  });
});

describe("postularme (RF1.4.3, RF1.4.4)", () => {
  test("only applicants can apply", async () => {
    const resultado = await postularme(empresa, "oferta-1");

    expect(resultado.ok === false && resultado.falla).toBe("forbidden");
  });

  test("an offer that is not published is 'not found'", async () => {
    dal.leerOferta.mockResolvedValue(oferta({ estado: "cerrada" }));

    const resultado = await postularme(postulante, "oferta-1");

    expect(resultado.ok === false && resultado.falla).toBe("not_found");
    expect(dal.crearPostulacion).not.toHaveBeenCalled();
  });

  test("without a complete profile it asks to complete it (409)", async () => {
    dal.leerOferta.mockResolvedValue(oferta({}));
    dal.perfilCompletoPostulante.mockResolvedValue(false);

    const resultado = await postularme(postulante, "oferta-1");

    expect(resultado.ok === false && resultado.falla).toBe("conflict");
    expect(dal.crearPostulacion).not.toHaveBeenCalled();
  });

  test("without a CV it asks to upload one (409)", async () => {
    dal.leerOferta.mockResolvedValue(oferta({}));
    dal.perfilCompletoPostulante.mockResolvedValue(true);
    dal.leerCv.mockResolvedValue(null);

    const resultado = await postularme(postulante, "oferta-1");

    expect(resultado.ok === false && resultado.falla).toBe("conflict");
    expect(dal.crearPostulacion).not.toHaveBeenCalled();
  });

  test("with a complete profile and CV it saves the application for the session's applicant", async () => {
    dal.leerOferta.mockResolvedValue(oferta({}));
    dal.perfilCompletoPostulante.mockResolvedValue(true);
    dal.leerCv.mockResolvedValue(cv);

    const resultado = await postularme(postulante, "oferta-1");

    expect(resultado).toEqual({ ok: true, datos: undefined });
    expect(dal.crearPostulacion).toHaveBeenCalledWith("postulante-1", "oferta-1");
  });
});

test("'Mis postulaciones' never carries the Office's status (RF1.2.4)", async () => {
  dal.listarPostulacionesPropias.mockResolvedValue([
    { id: "p-1", creadaEl: "2026-09-29T14:00:00.000Z", oferta: { id: "oferta-1", titulo: "Puesto", lugar: "Centro" } },
  ]);

  const resultado = await verMisPostulaciones(postulante);

  expect(resultado).toEqual({
    ok: true,
    datos: [{ id: "p-1", postuladoEl: "2026-09-29T14:00:00.000Z", oferta: { id: "oferta-1", titulo: "Puesto", lugar: "Centro" } }],
  });
});

test("only applicants upload a CV", async () => {
  const resultado = await subirMiCv(empresa, new File(["%PDF-"], "cv.pdf", { type: "application/pdf" }));

  expect(resultado.ok === false && resultado.falla).toBe("forbidden");
  expect(dal.guardarCv).not.toHaveBeenCalled();
});

describe("obtenerPerfilPostulante", () => {
  test("returns applicant profile including session email", async () => {
    dal.leerPerfilPostulante.mockResolvedValue({
      nombre: "Juan",
      apellido: "Pérez",
      telefono: "3411234567",
      dni: "12345678",
      rubros: [{ slug: "comercio", nombre: "Comercio" }],
      tieneCv: true,
    });

    const resultado = await obtenerPerfilPostulante(postulante);

    expect(resultado).toEqual({
      ok: true,
      datos: {
        nombre: "Juan",
        apellido: "Pérez",
        telefono: "3411234567",
        dni: "12345678",
        rubros: [{ slug: "comercio", nombre: "Comercio" }],
        tieneCv: true,
        email: "persona@ejemplo.com",
      },
    });
  });

  test("forbidden for non-applicants", async () => {
    const resultado = await obtenerPerfilPostulante(empresa);

    expect(resultado.ok === false && resultado.falla).toBe("forbidden");
  });
});

describe("abrirMiCv", () => {
  test("returns signed URL for the applicant's CV", async () => {
    dal.leerCv.mockResolvedValue(cv);
    dal.crearUrlFirmadaCv.mockResolvedValue("https://ejemplo.supabase.co/firmada.pdf");

    const resultado = await abrirMiCv(postulante);

    expect(resultado).toEqual({
      ok: true,
      datos: { url: "https://ejemplo.supabase.co/firmada.pdf" },
    });
    expect(dal.crearUrlFirmadaCv).toHaveBeenCalledWith("postulante-1/cv.pdf");
  });

  test("returns not_found if applicant has no CV", async () => {
    dal.leerCv.mockResolvedValue(null);

    const resultado = await abrirMiCv(postulante);

    expect(resultado.ok === false && resultado.falla).toBe("not_found");
    expect(dal.crearUrlFirmadaCv).not.toHaveBeenCalled();
  });

  test("forbidden for non-applicants", async () => {
    const resultado = await abrirMiCv(empresa);

    expect(resultado.ok === false && resultado.falla).toBe("forbidden");
  });
});
