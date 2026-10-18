import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";

import { SeccionCv } from "./SeccionCv";

const mocks = vi.hoisted(() => ({
  usuario: undefined as { rol: string } | null | undefined,
}));

vi.mock("@/hooks/useSesion", () => ({
  useSesion: () => ({ usuario: mocks.usuario, error: null }),
}));

vi.mock("@/components/cv/MiCv", () => ({
  MiCv: ({ ofertaId }: { ofertaId?: string }) => <p>MiCv {ofertaId ?? "sin oferta"}</p>,
}));

afterEach(cleanup);

test("shows the CV block to an applicant", () => {
  mocks.usuario = { rol: "postulante" };
  render(<SeccionCv ofertaId="o-1" />);

  expect(screen.getByRole("heading", { name: "Curriculum vitae" })).toBeDefined();
  expect(screen.getByText("MiCv o-1")).toBeDefined();
});

test.each([
  ["nobody is logged in", null],
  ["the session is still loading", undefined],
  ["another role is logged in", { rol: "empresa" }],
])("hides the CV block when %s, so the login prompt is not repeated", (_caso, usuario) => {
  mocks.usuario = usuario;
  const { container } = render(<SeccionCv />);

  expect(container.innerHTML).toBe("");
});
