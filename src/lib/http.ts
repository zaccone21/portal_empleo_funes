import { z } from "zod";

/*
 * Client-side helpers for the hooks in src/hooks/ (D-012, D-017). This is the
 * only place that knows the contract every Route Handler follows (AGENTS §6):
 * - success: 2xx, with a JSON body or none (201/204);
 * - expected failure: 4xx/5xx with the body { error: "short message in Spanish" }.
 */

type Method = "POST" | "PATCH" | "PUT" | "DELETE";

type Opciones = {
  method?: Method;
  body?: unknown;
};

/** Shown when the server fails without a message of its own (for example Next's HTML 404 page). */
export const MENSAJE_ERROR_GENERICO =
  "No pudimos completar la operación. Probá de nuevo en unos minutos.";

const cuerpoDeErrorSchema = z.object({ error: z.string().min(1) });

/**
 * Error for a 4xx/5xx answer. Besides the message it keeps the HTTP status,
 * because some screens react differently to each one: for example, "Postularme"
 * sends the user to log in on 401 and asks for the CV on 409.
 */
export class ErrorHttp extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ErrorHttp";
    this.status = status;
  }
}

/**
 * Sends `body` as JSON to `url` and resolves when the server answers 2xx.
 *
 * - Without `responseSchema`, the response body is ignored and the promise
 *   resolves to `undefined` (endpoints that answer 201 or 204).
 * - With `responseSchema`, the JSON body is validated with it and returned
 *   typed. Validating instead of casting means a server that changes its
 *   answer fails here, loudly, and not later in a component.
 * - On 4xx/5xx it throws an ErrorHttp whose message is the server's `error`
 *   field, or MENSAJE_ERROR_GENERICO when the body is not the expected JSON.
 *   Hooks show that message as it comes (D-013).
 * - Network failures (no connection) are not caught: fetch's own error
 *   reaches the hook, which shows it (D-013, pending the final error handling).
 */
export async function sendJson(url: string, opciones: Opciones): Promise<undefined>;
export async function sendJson<T>(
  url: string,
  opciones: Opciones & { responseSchema: z.ZodType<T> },
): Promise<T>;
export async function sendJson<T>(
  url: string,
  { method = "POST", body, responseSchema }: Opciones & { responseSchema?: z.ZodType<T> },
): Promise<T | undefined> {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    throw new ErrorHttp(await leerMensajeDeError(response), response.status);
  }

  if (!responseSchema) {
    return undefined;
  }

  return responseSchema.parse(await response.json());
}

/**
 * Reads data with GET from `url` and returns it validated with `schema`.
 * Errors behave as in sendJson: ErrorHttp with the server's message and status.
 */
export async function getJson<T>(url: string, schema: z.ZodType<T>): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new ErrorHttp(await leerMensajeDeError(response), response.status);
  }

  return schema.parse(await response.json());
}

/**
 * Sends a file (or any form fields) as multipart/form-data and returns the
 * answer validated with `schema`. Used for the CV upload: a PDF cannot travel
 * inside JSON. The browser sets the Content-Type with its boundary itself, so
 * no header is set here. Errors behave as in sendJson.
 */
export async function sendFormData<T>(
  url: string,
  formulario: FormData,
  schema: z.ZodType<T>,
  method: Method = "PUT",
): Promise<T> {
  const response = await fetch(url, { method, body: formulario });

  if (!response.ok) {
    throw new ErrorHttp(await leerMensajeDeError(response), response.status);
  }

  return schema.parse(await response.json());
}

/**
 * True when the server said "you cannot see this": 401 (nobody logged in) or
 * 403 (logged in with another role). Screens show "Ingresá" instead of an
 * error for these, because they are a normal situation, not a failure.
 */
export function esSinAcceso(e: unknown): boolean {
  return e instanceof ErrorHttp && (e.status === 401 || e.status === 403);
}

/** Message to show for any error a hook catches: the Error's own message, or the value as text. */
export function mensajeDeError(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

/**
 * Reads the `{ error }` message of a failed response. Only JSON bodies are
 * parsed: a route that does not exist yet answers Next's HTML 404 page, and
 * parsing that as JSON would throw a confusing SyntaxError.
 */
async function leerMensajeDeError(response: Response): Promise<string> {
  const esJson = response.headers.get("content-type")?.includes("application/json");
  if (!esJson) {
    return MENSAJE_ERROR_GENERICO;
  }

  const cuerpo = cuerpoDeErrorSchema.safeParse(await response.json());
  return cuerpo.success ? cuerpo.data.error : MENSAJE_ERROR_GENERICO;
}
