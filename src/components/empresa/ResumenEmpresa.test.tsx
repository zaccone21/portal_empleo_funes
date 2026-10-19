import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import type { CandidatoDerivado } from "@/lib/validation/candidatos";
import type { PerfilEmpresa } from "@/lib/validation/empresa";
import type { OfertaEmpresa } from "@/lib/validation/ofertas";

import { ResumenEmpresa } from "./ResumenEmpresa";

const mocks = vi.hoisted(() => ({
  ofertas: [] as OfertaEmpresa[],
  perfil: null as PerfilEmpresa | null,
  candidatos: [] as CandidatoDerivado[],
}));

vi.mock("@/hooks/useOfertasEmpresa", () => ({
  useOfertasEmpresa: () => ({
    ofertas: mocks.ofertas,
    loading: false,
    error: null,
    recargar: vi.fn(),
    reemplazar: vi.fn(),
  }),
}));
vi.mock("@/hooks/usePerfilEmpresa", () => ({
  usePerfilEmpresa: () => ({ perfil: mocks.perfil, loading: false, error: null, recargar: vi.fn() }),
}));
vi.mock("@/hooks/useCandidatosDerivados", () => ({
  useCandidatosDerivados: () => ({
    candidatos: mocks.candidatos,
    loading: false,
    error: null,
    sinAcceso: false,
    recargar: vi.fn(),
    reemplazar: vi.fn(),
  }),
}));

beforeEach(() => {
  mocks.ofertas = [];
  mocks.perfil = null;
  mocks.candidatos = [];
});

afterEach(cleanup);

function oferta(id: string, estado: OfertaEmpresa["estado"]): OfertaEmpresa {
  return {
    id,
    titulo: `Oferta ${id} (ejemplo)`,
    descripcion: "",
    requisitos: "",
    lugar: "",
    jornada: "",
    sueldo: null,
    rubros: ["otros"],
    estado,
    motivoRechazo: null,
    cierreSolicitado: false,
    creadaEl: "2026-09-27T16:00:00-03:00",
  };
}

test("counts the offers in each status", () => {
  mocks.ofertas = [oferta("a", "publicada"), oferta("b", "publicada"), oferta("c", "pendiente")];
  render(<ResumenEmpresa />);

  const resumen = screen.getByRole("region", { name: "Tus ofertas" });
  const filas = within(resumen).getAllByRole("listitem").map((fila) => fila.textContent);
  expect(filas).toEqual(["Pendiente1", "Publicada2", "Rechazada0", "Cerrada0"]);
});

test("reminds to fill in the company data while there is none", () => {
  render(<ResumenEmpresa />);

  expect(screen.getByText("Completá los datos de la empresa")).toBeDefined();
  expect(screen.getByRole("link", { name: "Completar datos" }).getAttribute("href")).toBe("/empresa/perfil");
});

test("says how many referred applicants wait for an answer and links to the oldest one's offer", () => {
  const candidato = (id: string, ofertaId: string, decision: CandidatoDerivado["decision"]): CandidatoDerivado => ({
    postulacionId: id,
    oferta: { id: ofertaId, titulo: "Oferta (ejemplo)" },
    derivadoEl: "2026-10-10T12:00:00.000Z",
    nombre: null,
    apellido: null,
    telefono: null,
    email: null,
    rubros: [],
    tieneCv: false,
    decision,
    motivoNoContratacion: null,
  });
  mocks.candidatos = [candidato("p-1", "o-1", "contratado"), candidato("p-2", "o-2", null), candidato("p-3", "o-3", null)];
  render(<ResumenEmpresa />);

  expect(screen.getByText("2 personas esperan tu respuesta")).toBeDefined();
  expect(screen.getByRole("link", { name: "Ver candidatos" }).getAttribute("href")).toBe("/empresa/ofertas?oferta=o-2");
});

test("always offers to publish an offer", () => {
  render(<ResumenEmpresa />);

  expect(screen.getByRole("link", { name: "Publicar una oferta" }).getAttribute("href")).toBe(
    "/empresa/ofertas/nueva",
  );
});
