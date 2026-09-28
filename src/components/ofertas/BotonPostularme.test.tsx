import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import type { ResultadoPostulacion } from "@/hooks/usePostularme";

import { BotonPostularme } from "./BotonPostularme";

const mocks = vi.hoisted(() => ({
  postularme: vi.fn(),
  estado: { loading: false, resultado: null as ResultadoPostulacion | null },
}));

vi.mock("@/hooks/usePostularme", () => ({
  usePostularme: () => ({ postularme: mocks.postularme, ...mocks.estado }),
}));

beforeEach(() => {
  mocks.postularme.mockReset();
  mocks.estado = { loading: false, resultado: null };
});

afterEach(cleanup);

test("applies to the given offer", () => {
  render(<BotonPostularme ofertaId="o-9" />);

  fireEvent.click(screen.getByRole("button", { name: "Postularme" }));

  expect(mocks.postularme).toHaveBeenCalledWith("o-9");
});

test("is disabled while sending", () => {
  mocks.estado = { loading: true, resultado: null };
  render(<BotonPostularme ofertaId="o-9" />);

  expect(screen.getByRole("button", { name: /Enviando postulación/ }).hasAttribute("disabled")).toBe(true);
});

test("after applying, shows the confirmation without any status and hides the button", () => {
  mocks.estado = { loading: false, resultado: { tipo: "postulado" } };
  render(<BotonPostularme ofertaId="o-9" />);

  expect(screen.getByRole("status").textContent).toContain("Te postulaste a esta oferta");
  expect(screen.queryByRole("button", { name: "Postularme" })).toBeNull();
});

test("without a session, offers to log in", () => {
  mocks.estado = { loading: false, resultado: { tipo: "sin_sesion" } };
  render(<BotonPostularme ofertaId="o-9" />);

  expect(screen.getByRole("link", { name: "Ingresar" }).getAttribute("href")).toBe("/postulante/ingresar");
});

test("without a CV, links to the upload (RF1.4.4)", () => {
  mocks.estado = { loading: false, resultado: { tipo: "falta_cv", mensaje: "Subí tu CV." } };
  render(<BotonPostularme ofertaId="o-9" />);

  expect(screen.getByText("Subí tu CV.")).toBeDefined();
  expect(screen.getByRole("link", { name: "Subir mi CV" }).getAttribute("href")).toBe(
    "/postulante/cv?oferta=o-9",
  );
});

test("on another error, shows the message and keeps the button to retry", () => {
  mocks.estado = { loading: false, resultado: { tipo: "error", mensaje: "Falló" } };
  render(<BotonPostularme ofertaId="o-9" />);

  expect(screen.getByRole("alert").textContent).toContain("Falló");
  expect(screen.getByRole("button", { name: "Postularme" })).toBeDefined();
});
