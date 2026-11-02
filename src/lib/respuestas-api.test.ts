import { describe, expect, it } from "vitest";

import { esOrigenValido, origenInvalido, redirigirUrlFirmada, responder } from "@/lib/respuestas-api";

describe("respuestas-api security controls", () => {
  it("sets Cache-Control: private, no-store on API responses", () => {
    const res = responder({ ok: true, datos: { hola: "mundo" } });
    expect(res.headers.get("Cache-Control")).toBe("private, no-store");
  });

  it("sets Referrer-Policy: no-referrer and Cache-Control: private, no-store on signed URL redirects", () => {
    const res = redirigirUrlFirmada("https://xyz.supabase.co/storage/v1/object/sign/cvs/u1/cv.pdf?token=secreto");
    expect(res.status).toBe(307);
    expect(res.headers.get("Referrer-Policy")).toBe("no-referrer");
    expect(res.headers.get("Cache-Control")).toBe("private, no-store");
  });

  it("validates Origin against Host for CSRF protection", () => {
    const reqMismoOrigen = new Request("https://empleos.funes.gob.ar/api/auth/salida", {
      method: "POST",
      headers: {
        origin: "https://empleos.funes.gob.ar",
        host: "empleos.funes.gob.ar",
      },
    });
    expect(esOrigenValido(reqMismoOrigen)).toBe(true);

    const reqCruzado = new Request("https://empleos.funes.gob.ar/api/auth/salida", {
      method: "POST",
      headers: {
        origin: "https://sitio-malicioso.com",
        host: "empleos.funes.gob.ar",
      },
    });
    expect(esOrigenValido(reqCruzado)).toBe(false);
    expect(origenInvalido().status).toBe(403);
  });
});
