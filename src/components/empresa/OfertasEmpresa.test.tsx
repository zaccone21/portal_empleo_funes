import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import type { OfertaEmpresa } from "@/lib/validation/ofertas";

import { OfertasEmpresa } from "./OfertasEmpresa";

const mocks = vi.hoisted(() => ({
  ofertas: [] as OfertaEmpresa[],
  loading: false,
  error: null as string | null,
  sinAcceso: false,
  recargar: vi.fn(),
  reemplazar: vi.fn(),
}));

vi.mock("@/hooks/useOfertasEmpresa", () => ({
  useOfertasEmpresa: () => ({
    ofertas: mocks.ofertas,
    loading: mocks.loading,
    error: mocks.error,
    sinAcceso: mocks.sinAcceso,
    recargar: mocks.recargar,
    reemplazar: mocks.reemplazar,
  }),
}));

vi.mock("./DetalleOfertaEmpresa", () => ({
  DetalleOfertaEmpresa: () => <div>Detalle de oferta</div>,
}));

vi.mock("./TarjetaOfertaEmpresa", () => ({
  TarjetaOfertaEmpresa: ({ oferta }: { oferta: OfertaEmpresa }) => (
    <div>Tarjeta: {oferta.titulo} ({oferta.estado})</div>
  ),
}));

afterEach(cleanup);

const OFERTAS_EJEMPLO: OfertaEmpresa[] = [
  {
    id: "oferta-1",
    titulo: "Cajero de Comercio",
    estado: "publicada",
    motivoRechazo: null,
    cierreSolicitado: false,
    creadaEl: "2026-10-25T10:00:00Z",
    rubros: ["comercio"],
    jornada: "Completa",
    lugar: "Funes",
    descripcion: "Atención al cliente",
    requisitos: "Experiencia previa",
    sueldo: null,
  },
  {
    id: "oferta-2",
    titulo: "Ayudante de Cocina",
    estado: "pendiente",
    motivoRechazo: null,
    cierreSolicitado: false,
    creadaEl: "2026-10-26T10:00:00Z",
    rubros: ["gastronomia"],
    jornada: "Turno tarde",
    lugar: "Funes",
    descripcion: "Cocina",
    requisitos: "Manipulación de alimentos",
    sueldo: null,
  },
  {
    id: "oferta-3",
    titulo: "Cadete",
    estado: "rechazada",
    motivoRechazo: "Perfil incompleto",
    cierreSolicitado: false,
    creadaEl: "2026-10-27T10:00:00Z",
    rubros: ["administracion"],
    jornada: "Part time",
    lugar: "Funes",
    descripcion: "Trámites",
    requisitos: "Mayor de edad",
    sueldo: null,
  },
];

beforeEach(() => {
  mocks.ofertas = OFERTAS_EJEMPLO;
  mocks.loading = false;
  mocks.error = null;
  mocks.sinAcceso = false;
});

describe("OfertasEmpresa (filtros por estado)", () => {
  test("renders all quick filter buttons with their counts", () => {
    render(<OfertasEmpresa />);

    expect(screen.getByRole("button", { name: /Todas.*3/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /Publicadas.*1/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /Pendientes.*1/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /Rechazadas.*1/i })).toBeDefined();
  });

  test("shows all offers by default and filters when clicking a status button", () => {
    render(<OfertasEmpresa />);

    expect(screen.getByText("Tarjeta: Cajero de Comercio (publicada)")).toBeDefined();
    expect(screen.getByText("Tarjeta: Ayudante de Cocina (pendiente)")).toBeDefined();
    expect(screen.getByText("Tarjeta: Cadete (rechazada)")).toBeDefined();

    // Click on 'Publicadas' filter
    fireEvent.click(screen.getByRole("button", { name: /Publicadas/i }));

    expect(screen.getByText("Tarjeta: Cajero de Comercio (publicada)")).toBeDefined();
    expect(screen.queryByText("Tarjeta: Ayudante de Cocina (pendiente)")).toBeNull();
    expect(screen.queryByText("Tarjeta: Cadete (rechazada)")).toBeNull();
  });

  test("shows empty feedback when no offers match the selected status", () => {
    mocks.ofertas = [OFERTAS_EJEMPLO[0]];
    render(<OfertasEmpresa />);

    // Click on 'Pendientes' filter (which has 0)
    fireEvent.click(screen.getByRole("button", { name: /Pendientes/i }));

    expect(screen.getByText(/No tenés ofertas en estado/i)).toBeDefined();
    expect(screen.queryByText("Tarjeta: Cajero de Comercio (publicada)")).toBeNull();
  });
});
