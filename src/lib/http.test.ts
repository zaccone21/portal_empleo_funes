import { afterEach, describe, expect, test, vi } from "vitest";
import { z } from "zod";

import { ErrorHttp, MENSAJE_ERROR_GENERICO, getJson, sendJson } from "./http";

function respuestaJson(cuerpo: unknown, status: number) {
  return new Response(JSON.stringify(cuerpo), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function mockFetch(response: Response) {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("sendJson", () => {
  test("sends the body as JSON with the given method", async () => {
    const fetchMock = mockFetch(new Response(null, { status: 204 }));

    await sendJson("/api/ejemplo", { method: "PATCH", body: { campo: "valor" } });

    expect(fetchMock).toHaveBeenCalledWith("/api/ejemplo", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campo: "valor" }),
    });
  });

  test("defaults to POST", async () => {
    const fetchMock = mockFetch(new Response(null, { status: 204 }));

    await sendJson("/api/ejemplo", { body: {} });

    expect(fetchMock.mock.calls[0][1].method).toBe("POST");
  });

  test("returns the body validated by the response schema", async () => {
    mockFetch(respuestaJson({ destino: "/ofertas" }, 200));

    const datos = await sendJson("/api/ejemplo", {
      body: {},
      responseSchema: z.object({ destino: z.string() }),
    });

    expect(datos).toEqual({ destino: "/ofertas" });
  });

  test("fails when the body does not match the response schema", async () => {
    mockFetch(respuestaJson({ otro: 1 }, 200));

    await expect(
      sendJson("/api/ejemplo", { body: {}, responseSchema: z.object({ destino: z.string() }) }),
    ).rejects.toThrow();
  });

  test("resolves to undefined without a response schema (201 with no body)", async () => {
    mockFetch(new Response(null, { status: 201 }));

    await expect(sendJson("/api/ejemplo", { body: {} })).resolves.toBeUndefined();
  });

  test("throws the server's error message", async () => {
    mockFetch(respuestaJson({ error: "Email o contraseña incorrectos" }, 401));

    await expect(sendJson("/api/ejemplo", { body: {} })).rejects.toThrow(
      "Email o contraseña incorrectos",
    );
  });

  test("throws the generic message when the error body is not JSON", async () => {
    mockFetch(new Response("<html>404</html>", { status: 404, headers: { "content-type": "text/html" } }));

    await expect(sendJson("/api/ejemplo", { body: {} })).rejects.toThrow(MENSAJE_ERROR_GENERICO);
  });

  test("throws the generic message when the JSON has no error field", async () => {
    mockFetch(respuestaJson({ detalle: "x" }, 500));

    await expect(sendJson("/api/ejemplo", { body: {} })).rejects.toThrow(MENSAJE_ERROR_GENERICO);
  });
});

describe("ErrorHttp", () => {
  test("keeps the HTTP status of a failed request", async () => {
    mockFetch(respuestaJson({ error: "Para postularte tenés que subir tu CV" }, 409));

    const error = await sendJson("/api/ejemplo", { body: {} }).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ErrorHttp);
    expect(error).toMatchObject({ status: 409 });
  });
});

describe("getJson", () => {
  test("reads with GET and validates the body", async () => {
    const fetchMock = mockFetch(respuestaJson([{ id: "a" }], 200));

    const datos = await getJson("/api/ejemplo", z.array(z.object({ id: z.string() })));

    expect(fetchMock).toHaveBeenCalledWith("/api/ejemplo");
    expect(datos).toEqual([{ id: "a" }]);
  });

  test("throws ErrorHttp with the status on 401", async () => {
    mockFetch(respuestaJson({ error: "Ingresá para ver tus postulaciones" }, 401));

    await expect(getJson("/api/ejemplo", z.array(z.unknown()))).rejects.toMatchObject({
      status: 401,
      message: "Ingresá para ver tus postulaciones",
    });
  });
});
