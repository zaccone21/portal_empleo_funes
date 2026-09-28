import { act, renderHook } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";

import { usePostularme } from "./usePostularme";

function mockFetch(status: number, cuerpo?: unknown) {
  const response =
    cuerpo === undefined
      ? new Response(null, { status })
      : new Response(JSON.stringify(cuerpo), { status, headers: { "content-type": "application/json" } });
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

async function postularse(ofertaId = "o-1") {
  const { result } = renderHook(() => usePostularme());
  await act(() => result.current.postularme(ofertaId));
  return result.current;
}

test("sends only the offer id and reports success on 201", async () => {
  const fetchMock = mockFetch(201);

  const estado = await postularse("o-7");

  expect(fetchMock.mock.calls[0][1].body).toBe(JSON.stringify({ ofertaId: "o-7" }));
  expect(estado.resultado).toEqual({ tipo: "postulado" });
  expect(estado.loading).toBe(false);
});

test("401 means nobody is logged in", async () => {
  mockFetch(401, { error: "Ingresá con tu cuenta" });

  expect((await postularse()).resultado).toEqual({ tipo: "sin_sesion" });
});

test("409 means the CV is missing and keeps the server's message (RF1.4.4)", async () => {
  mockFetch(409, { error: "Para postularte tenés que subir tu CV." });

  expect((await postularse()).resultado).toEqual({
    tipo: "falta_cv",
    mensaje: "Para postularte tenés que subir tu CV.",
  });
});

test("any other failure is a generic error with its message", async () => {
  mockFetch(500, { error: "Algo falló" });

  expect((await postularse()).resultado).toEqual({ tipo: "error", mensaje: "Algo falló" });
});
