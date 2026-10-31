import "server-only";

/*
 * Transactional email sender via Resend HTTP API (`RESEND_API_KEY`).
 * Never throws or logs personal data (AGENTS §7): if the API key is missing
 * or the provider fails, it returns `{ enviado: false }` so the calling use
 * case always completes its database transaction cleanly.
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const REMITENTE_POR_DEFECTO = "Portal de Empleo Funes <onboarding@resend.dev>";

export type OpcionesCorreo = {
  para: string;
  asunto: string;
  html: string;
};

/**
 * Sends an HTML email through Resend using native `fetch`.
 * Returns `{ enviado: true }` when Resend accepts the message (2xx), or
 * `{ enviado: false }` if `RESEND_API_KEY` is not set or the request fails.
 */
export async function enviarCorreoPortal({ para, asunto, html }: OpcionesCorreo): Promise<{ enviado: boolean }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const destino = para.trim();

  if (!apiKey || !destino) {
    return { enviado: false };
  }

  const remitente = process.env.RESEND_FROM_EMAIL?.trim() || REMITENTE_POR_DEFECTO;

  try {
    const respuesta = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: remitente,
        to: [destino],
        subject: asunto,
        html,
      }),
      signal: AbortSignal.timeout(6000),
    });

    return { enviado: respuesta.ok };
  } catch {
    return { enviado: false };
  }
}
