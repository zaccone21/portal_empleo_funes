import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";

import { useMisPostulaciones } from "./useMisPostulaciones";

function respuesta(status: number, cuerpo: unknown) {
  return new Response(JSON.stringify(cuerpo), {
    status,
    headers: { "content-type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

test("loads the applicant's applications", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      respuesta(200, [
        {
          id: "p-1",
          postuladoEl: "2026-09-20T10:00:00-03:00",
          oferta: { id: "o-1", titulo: "Ayudante de cocina", lugar: "Centro" },
        },
      ]),
    ),
  );

  const { result } = renderHook(() => useMisPostulaciones());

  expect(result.current.loading).toBe(true);
  await waitFor(() => expect(result.current.postulaciones).toHaveLength(1));
  expect(result.current.loading).toBe(false);
});

test("a 401 is 'no access', not an error", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(respuesta(401, { error: "Sin sesión" })));

  const { result } = renderHook(() => useMisPostulaciones());

  await waitFor(() => expect(result.current.sinAcceso).toBe(true));
  expect(result.current.error).toBeNull();
  expect(result.current.loading).toBe(false);
});

test("recargar tries again after an error", async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce(respuesta(500, { error: "Falló" }))
    .mockResolvedValueOnce(respuesta(200, []));
  vi.stubGlobal("fetch", fetchMock);

  const { result } = renderHook(() => useMisPostulaciones());
  await waitFor(() => expect(result.current.error).toBe("Falló"));

  act(() => result.current.recargar());

  await waitFor(() => expect(result.current.postulaciones).toEqual([]));
  expect(fetchMock).toHaveBeenCalledTimes(2);
});
