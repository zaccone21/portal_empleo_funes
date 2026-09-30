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

/**
 * The answer for a use case result: `status` (200 by default) with the data as
 * JSON, or no body when the data is undefined (for example 204); on a failure,
 * its status with `{ error }`.
 */
export function responder<T>(resultado: Resultado<T>, status = 200): Response {
  if (!resultado.ok) {
    return Response.json({ error: resultado.mensaje }, { status: STATUS_POR_FALLA[resultado.falla] });
  }
  if (resultado.datos === undefined) {
    return new Response(null, { status });
  }
  return Response.json(resultado.datos, { status });
}

/** 401 for a private route without a session. Screens show "Ingresá" for it (D-028). */
export function sinSesion(): Response {
  return Response.json({ error: "Ingresá con tu cuenta para ver esto." }, { status: 401 });
}

/** 400 with the first validation message, which is already written for the person (lib/validation). */
export function datosInvalidos(error: ZodError): Response {
  return Response.json({ error: error.issues[0]?.message ?? "Revisá los datos." }, { status: 400 });
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
  return Response.json({ error: mensaje }, { status: 404 });
}

/** The JSON body, or null when it is missing or broken (the schema then answers 400). */
export async function leerCuerpo(request: Request): Promise<unknown> {
  return request.json().catch(() => null);
}
