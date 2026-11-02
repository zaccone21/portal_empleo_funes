import "server-only";

export type ParametrosCorreo = {
  para: string | string[];
  asunto: string;
  html: string;
};

export type ResultadoEnvio = {
  ok: boolean;
  id?: string;
  error?: string;
};

const RESEND_API_URL = "https://api.resend.com/emails";
const REMITENTE_POR_DEFECTO = "Oficina de Empleo Funes <no-reply@zaccone.dev>";

/**
 * Sends a transactional email using Resend's REST API via native fetch.
 * Server-only: reads RESEND_API_KEY and RESEND_FROM_EMAIL from process.env.
 * Non-blocking: if unconfigured or if Resend responds with an error, it returns
 * { ok: false, error } instead of throwing, so the main business flow can continue.
 */
export async function enviarCorreo({ para, asunto, html }: ParametrosCorreo): Promise<ResultadoEnvio> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const remitente = process.env.RESEND_FROM_EMAIL?.trim() || REMITENTE_POR_DEFECTO;

  if (!apiKey) {
    if (process.env.NODE_ENV !== "test") {
      console.warn(
        `[email] ATENCIÓN: RESEND_API_KEY no está configurada en .env.local. No se envió el correo a: ${
          Array.isArray(para) ? para.join(", ") : para
        }`,
      );
    }
    return { ok: false, error: "RESEND_API_KEY no configurada" };
  }

  // Ensure recipients are valid non-empty values
  const destinatarios = (Array.isArray(para) ? para : [para]).map((d) => d.trim()).filter(Boolean);
  if (destinatarios.length === 0) {
    if (process.env.NODE_ENV !== "test") {
      console.warn(`[email] Destinatario vacío para el asunto: "${asunto}". No se envió.`);
    }
    return { ok: false, error: "No se especificó ningún destinatario válido" };
  }

  if (process.env.NODE_ENV !== "test") {
    console.log(`[email] Enviando correo a: ${destinatarios.join(", ")} | Asunto: "${asunto}" | Remitente: ${remitente}`);
  }

  try {
    const respuesta = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: remitente,
        to: destinatarios,
        subject: asunto,
        html,
      }),
    });

    if (!respuesta.ok) {
      const cuerpoError = await respuesta.json().catch(() => ({}));
      const detalle =
        cuerpoError && typeof cuerpoError === "object" && "message" in cuerpoError && typeof cuerpoError.message === "string"
          ? cuerpoError.message
          : `HTTP ${respuesta.status}`;
      console.error(`[email] Error de Resend (${respuesta.status}) al enviar a ${destinatarios.join(", ")}: ${detalle}`);
      return { ok: false, error: detalle };
    }

    const datos = (await respuesta.json()) as { id?: string };
    if (process.env.NODE_ENV !== "test") {
      console.log(`[email] Correo enviado exitosamente (ID de Resend: ${datos.id})`);
    }
    return { ok: true, id: datos.id };
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : "Error desconocido de red";
    console.error(`[email] Excepción al conectar con Resend: ${mensaje}`);
    return { ok: false, error: mensaje };
  }
}
