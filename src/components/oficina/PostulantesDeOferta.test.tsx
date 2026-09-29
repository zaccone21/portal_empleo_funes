import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import type { PostulacionOficina } from "@/lib/validation/oficina";

import { PostulantesDeOferta } from "./PostulantesDeOferta";

const mocks = vi.hoisted(() => ({
  cambiarEstado: vi.fn(),
  toastSuccess: vi.fn(),
  postulaciones: [] as PostulacionOficina[],
}));

vi.mock("@/hooks/useOficina", () => ({
  usePostulacionesOficina: () => ({
    postulaciones: mocks.postulaciones,
    loading: false,
    error: null,
    recargar: vi.fn(),
    cambiarEstado: mocks.cambiarEstado,
    errorCambio: null,
  }),
}));
vi.mock("sonner", () => ({ toast: { success: mocks.toastSuccess } }));

beforeEach(() => {
  mocks.cambiarEstado.mockReset();
  mocks.postulaciones = [
    {
      id: "p-1",
      estado: "applied",
      postuladoEl: "2026-09-26T09:15:00-03:00",
      postulante: { email: "ana.ejemplo@ejemplo.com", cv: { nombre: "cv.pdf", tamanoBytes: 1000 } },
    },
    {
      id: "p-2",
      estado: "applied",
      postuladoEl: "2026-09-26T10:00:00-03:00",
      postulante: { email: "bruno.ejemplo@ejemplo.com", cv: null },
    },
  ];
});

afterEach(cleanup);

test("each applicant can be contacted and their CV opened in a new tab (RF1.5.5)", () => {
  render(<PostulantesDeOferta ofertaId="o-1" />);

  expect(screen.getByRole("link", { name: "ana.ejemplo@ejemplo.com" }).getAttribute("href")).toBe(
    "mailto:ana.ejemplo@ejemplo.com",
  );
  const cv = screen.getByRole("link", { name: "Ver CV" });
  expect(cv.getAttribute("href")).toBe("/api/admin/postulaciones/p-1/cv");
  expect(cv.getAttribute("target")).toBe("_blank");
  expect(screen.getByText("No subió CV")).toBeDefined();
});

test("changing the status saves it and confirms (RF1.5.6)", async () => {
  mocks.cambiarEstado.mockResolvedValue(true);
  render(<PostulantesDeOferta ofertaId="o-1" />);

  fireEvent.change(screen.getAllByLabelText("Estado")[0], { target: { value: "preselected" } });

  await waitFor(() => expect(mocks.cambiarEstado).toHaveBeenCalledWith("p-1", "preselected"));
  expect(mocks.toastSuccess).toHaveBeenCalledWith("Guardado: Pre-seleccionado.");
});
