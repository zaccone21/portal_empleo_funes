import { expect, test, vi } from "vitest";

vi.mock("server-only", () => ({}));

const dal = vi.hoisted(() => ({ contarEstadisticasPublicas: vi.fn() }));
vi.mock("@/lib/dal/estadisticas", () => ({ contarEstadisticasPublicas: dal.contarEstadisticasPublicas }));

import { CONTRATACIONES_ANTES_DEL_PORTAL, verEstadisticasPublicas } from "./inicio";

test("the hires add the Office's placements before the portal to the ones counted in it (D-067)", async () => {
  dal.contarEstadisticasPublicas.mockResolvedValue({
    ofertasPublicadas: 4,
    empresas: 2,
    postulantes: 30,
    derivaciones: 7,
    contrataciones: 3,
  });

  const resultado = await verEstadisticasPublicas();

  expect(resultado).toEqual({
    ok: true,
    datos: { ofertasPublicadas: 4, empresas: 2, postulantes: 30, derivaciones: 7, contrataciones: 853 },
  });
  expect(CONTRATACIONES_ANTES_DEL_PORTAL).toBe(850);
});
