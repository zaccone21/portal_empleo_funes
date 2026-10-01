import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import type { CvPropio } from "@/lib/validation/cv";

import { MiCv } from "./MiCv";

const mocks = vi.hoisted(() => ({
  subir: vi.fn(),
  recargar: vi.fn(),
  toastSuccess: vi.fn(),
  estado: {
    cv: null as CvPropio | null | undefined,
    loading: false,
    error: null as string | null,
    subiendo: false,
    errorSubida: null as string | null,
  },
}));

vi.mock("@/hooks/useMiCv", () => ({
  useMiCv: () => ({ ...mocks.estado, subir: mocks.subir, recargar: mocks.recargar }),
}));

vi.mock("sonner", () => ({ toast: { success: mocks.toastSuccess } }));

beforeEach(() => {
  mocks.subir.mockReset();
  mocks.toastSuccess.mockReset();
  mocks.estado = { cv: null, loading: false, error: null, subiendo: false, errorSubida: null };
});

afterEach(cleanup);

test("shows the current CV without any link to open it (RNF1)", () => {
  mocks.estado = {
    ...mocks.estado,
    cv: { nombre: "mi-cv.pdf", tamanoBytes: 245760, subidoEl: "2026-09-27T10:00:00-03:00" },
  };
  render(<MiCv />);

  expect(screen.getByText("mi-cv.pdf")).toBeDefined();
  expect(screen.getByText("PDF de 240 KB. Lo subiste el 27 de septiembre.")).toBeDefined();
  expect(screen.queryByRole("link", { name: /ver|descargar/i })).toBeNull();
});

test("coming from an offer, explains why and offers the way back after uploading (RF1.4.4)", async () => {
  mocks.subir.mockResolvedValue(true);
  render(<MiCv ofertaId="ejemplo-2" />);

  expect(screen.getByText("Para postularte necesitás tu CV")).toBeDefined();

  fireEvent.change(screen.getByLabelText(/Elegí tu CV en PDF/), {
    target: { files: [new File(["%PDF-1.7"], "cv.pdf", { type: "application/pdf" })] },
  });
  await screen.findByText("cv.pdf");
  fireEvent.click(screen.getByRole("button", { name: "Subir CV" }));

  const volver = await screen.findByRole("link", { name: "Volver a la oferta" });
  expect(volver.getAttribute("href")).toBe("/ofertas?oferta=ejemplo-2");
  expect(mocks.toastSuccess).toHaveBeenCalledWith("Listo, subiste tu CV.");
});

test("on a load error, offers to retry", () => {
  mocks.estado = { ...mocks.estado, cv: undefined, error: "Falló" };
  render(<MiCv />);

  fireEvent.click(screen.getByRole("button", { name: "Probar de nuevo" }));

  expect(mocks.recargar).toHaveBeenCalled();
});
