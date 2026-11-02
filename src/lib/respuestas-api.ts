import { NextResponse } from "next/server";
import { z, type ZodError } from "zod";

import type { Resultado, TipoDeFalla } from "@/lib/use-cases/resultado";

/*
 * Helpers for the Route Handlers in src/app/api/ (AGENTS §6). They turn a use
 * case result into the HTTP answer every hook expects (lib/http.ts): 2xx with
 * the data, or 4xx/5xx with `{ error: "message" }`.
 */

const STATUS_POR_FALLA: Record<TipoDeFalla, number> = {
  invalid: 400,
  unauthenticated: 401,
  forbidden: 403,
  not_found: 404,
  conflict: 409,
  unavailable: 503,
};

const CABECERAS_NO_STORE = {
  "Cache-Control": "private, no-store",
} as const;

/**
 * The answer for a use case result: `status` (200 by default) with the data as
 * JSON, or no body when the data is undefined (for example 204); on a failure,
 * its status with `{ error }`. Includes `Cache-Control: private, no-store` so
 * personal data is never stored in shared caches (OWASP ASVS 5.0.0 V14.2.2).
 */
export function responder<T>(resultado: Resultado<T>, status = 200): Response {
  if (!resultado.ok) {
    return Response.json(
      { error: resultado.mensaje },
      { status: STATUS_POR_FALLA[resultado.falla], headers: CABECERAS_NO_STORE },
    );
  }
  if (resultado.datos === undefined) {
    return new Response(null, { status, headers: CABECERAS_NO_STORE });
  }
  return Response.json(resultado.datos, { status, headers: CABECERAS_NO_STORE });
}

/** 401 for a private route without a session. Screens show "Ingresá" for it (D-028). */
export function sinSesion(): Response {
  return Response.json(
    { error: "Ingresá con tu cuenta para ver esto." },
    { status: 401, headers: CABECERAS_NO_STORE },
  );
}

/** 400 with the first validation message, which is already written for the person (lib/validation). */
export function datosInvalidos(error: ZodError): Response {
  return Response.json(
    { error: error.issues[0]?.message ?? "Revisá los datos." },
    { status: 400, headers: CABECERAS_NO_STORE },
  );
}

/**
 * True for an id with the database's format (uuid). A URL can carry anything;
 * checking first turns a malformed id into a plain 404 instead of a database error.
 */
export function esIdValido(id: string): boolean {
  return z.uuid().safeParse(id).success;
}

/** 404 with the message for the kind of thing that was not found. */
export function noEncontrado(mensaje: string): Response {
  return Response.json({ error: mensaje }, { status: 404, headers: CABECERAS_NO_STORE });
}

/** The JSON body, or null when it is missing or broken (the schema then answers 400). */
export async function leerCuerpo(request: Request): Promise<unknown> {
  return request.json().catch(() => null);
}

/**
 * Verifies that a state-changing request (`POST`, `PUT`, `PATCH`, `DELETE`)
 * originates from the same origin when the browser includes an `Origin` header
 * (OWASP ASVS 5.0.0 V3.5.1 CSRF defense for bodyless POST routes).
 */
export function esOrigenValido(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const urlPedido = new URL(request.url);
    const urlOrigen = new URL(origin);
    return urlOrigen.host === urlPedido.host;
  } catch {
    return false;
  }
}

/** 403 when a cross-origin request attempts a state-changing operation. */
export function origenInvalido(): Response {
  return Response.json(
    { error: "Solicitud no permitida desde un origen externo." },
    { status: 403, headers: CABECERAS_NO_STORE },
  );
}

/**
 * 307 redirect to a short-lived signed CV URL with `Referrer-Policy: no-referrer`
 * and `Cache-Control: private, no-store` so the temporary token never leaks via
 * `Referer` or proxy caches (OWASP ASVS 5.0.0 V3.4.5, V14.2.1).
 */
export function redirigirUrlFirmada(url: string): Response {
  return NextResponse.redirect(url, {
    status: 307,
    headers: {
      "Referrer-Policy": "no-referrer",
      "Cache-Control": "private, no-store",
    },
  });
}
