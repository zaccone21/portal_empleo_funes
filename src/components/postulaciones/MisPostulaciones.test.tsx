import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import type { PostulacionPropia } from "@/lib/validation/postulaciones";

import { MisPostulaciones } from "./MisPostulaciones";

const mocks = vi.hoisted(() => ({
  recargar: vi.fn(),
  estado: {
    postulaciones: null as PostulacionPropia[] | null,
    loading: false,
    error: null as string | null,
    sinAcceso: false,
  },
}));

vi.mock("next/navigation", () => ({ usePathname: () => "/postulante/postulaciones" }));

vi.mock("@/hooks/useMisPostulaciones", () => ({
  useMisPostulaciones: () => ({ ...mocks.estado, recargar: mocks.recargar }),
}));

beforeEach(() => {
  mocks.recargar.mockReset();
  mocks.estado = { postulaciones: null, loading: false, error: null, sinAcceso: false };
});

afterEach(cleanup);

test("without access, invites to log in and come back here", () => {
  mocks.estado = { ...mocks.estado, sinAcceso: true };
  render(<MisPostulaciones />);

  expect(screen.getByText("Ingresá para ver tus postulaciones")).toBeDefined();
  expect(screen.getByRole("link", { name: "Ingresar" }).getAttribute("href")).toBe(
    "/postulante/ingresar?volver=%2Fpostulante%2Fpostulaciones",
  );
});

test("on error, retries when asked", () => {
  mocks.estado = { ...mocks.estado, error: "Falló" };
  render(<MisPostulaciones />);

  fireEvent.click(screen.getByRole("button", { name: "Probar de nuevo" }));

  expect(mocks.recargar).toHaveBeenCalled();
});

test("with no applications, links to the offers", () => {
  mocks.estado = { ...mocks.estado, postulaciones: [] };
  render(<MisPostulaciones />);

  expect(screen.getByRole("link", { name: "Ver ofertas" }).getAttribute("href")).toBe("/ofertas");
});

test("lists the applications with their date and no status (RF1.2.4)", () => {
  mocks.estado = {
    ...mocks.estado,
    postulaciones: [
      {
        id: "p-1",
        postuladoEl: "2026-09-20T10:00:00-03:00",
        oferta: { id: "o-1", titulo: "Ayudante de cocina (ejemplo)", lugar: "Centro" },
      },
    ],
  };
  render(<MisPostulaciones />);

  expect(screen.getByRole("heading", { name: "Ayudante de cocina (ejemplo)" })).toBeDefined();
  expect(screen.getByText("Te postulaste el 20 de septiembre")).toBeDefined();
  for (const estado of ["Postulado", "Pre-seleccionado", "Derivado", "No apto"]) {
    expect(screen.queryByText(estado)).toBeNull();
  }
});
