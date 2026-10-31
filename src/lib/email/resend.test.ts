import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { enviarCorreo } from "./resend";

describe("enviarCorreo (Resend native fetch client)", () => {
  const envOriginal = process.env;

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...envOriginal, RESEND_API_KEY: "re_test_12345", RESEND_FROM_EMAIL: "Oficina <no-reply@funes.gob.ar>" };
  });

  afterEach(() => {
    process.env = envOriginal;
  });

  it("returns error gracefully if RESEND_API_KEY is not set", async () => {
    delete process.env.RESEND_API_KEY;
    const res = await enviarCorreo({ para: "test@ejemplo.com", asunto: "Hola", html: "<p>Test</p>" });
    expect(res.ok).toBe(false);
    expect(res.error).toContain("RESEND_API_KEY no configurada");
  });

  it("returns error if recipient list is empty or whitespace", async () => {
    const res = await enviarCorreo({ para: "   ", asunto: "Hola", html: "<p>Test</p>" });
    expect(res.ok).toBe(false);
    expect(res.error).toContain("No se especificó ningún destinatario");
  });

  it("sends POST request to Resend with authorization header and body", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "email-id-999" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const res = await enviarCorreo({
      para: "postulante@ejemplo.com",
      asunto: "Bienvenido",
      html: "<p>Contenido</p>",
    });

    expect(res.ok).toBe(true);
    expect(res.id).toBe("email-id-999");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.resend.com/emails",
      expect.objectContaining({
        method: "POST",
        headers: {
          Authorization: "Bearer re_test_12345",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Oficina <no-reply@funes.gob.ar>",
          to: ["postulante@ejemplo.com"],
          subject: "Bienvenido",
          html: "<p>Contenido</p>",
        }),
      }),
    );
  });

  it("handles Resend API error response without throwing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 422,
        json: async () => ({ message: "Domain not verified", name: "validation_error" }),
      }),
    );

    const res = await enviarCorreo({
      para: "otro@ejemplo.com",
      asunto: "Aviso",
      html: "<p>Test</p>",
    });

    expect(res.ok).toBe(false);
    expect(res.error).toBe("Domain not verified");
  });

  it("catches network errors gracefully", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Network timeout")),
    );

    const res = await enviarCorreo({
      para: "otro@ejemplo.com",
      asunto: "Aviso",
      html: "<p>Test</p>",
    });

    expect(res.ok).toBe(false);
    expect(res.error).toBe("Network timeout");
  });
});
