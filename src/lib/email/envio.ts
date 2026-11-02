import "server-only";

import { enviarCorreo } from "./resend";

export type OpcionesCorreo = {
  para: string;
  asunto: string;
  html: string;
};

/**
 * Sends an HTML email through Resend using native fetch.
 * Delegates to `enviarCorreo` in `./resend` so all platform emails
 * share the same verified sender (no-reply@zaccone.dev), logging, and error handling.
 */
export async function enviarCorreoPortal({ para, asunto, html }: OpcionesCorreo): Promise<{ enviado: boolean }> {
  const resultado = await enviarCorreo({ para, asunto, html });
  return { enviado: resultado.ok };
}
