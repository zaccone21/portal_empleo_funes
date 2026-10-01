import { existsSync } from "node:fs";

import { expect, test, type APIRequestContext, type Page, type PlaywrightWorkerArgs } from "@playwright/test";
import { z } from "zod";

/*
 * Shared steps for the e2e specs. They run against the Supabase TESTING
 * project configured in .env.local, with three test accounts created by hand
 * (docs/como_probar.md). The accounts' credentials come from environment
 * variables (loaded from .env.local when it exists) and are never written in
 * the code:
 *   E2E_POSTULANTE_EMAIL, E2E_POSTULANTE_PASSWORD
 *   E2E_EMPRESA_EMAIL,    E2E_EMPRESA_PASSWORD
 *   E2E_OFICINA_EMAIL,    E2E_OFICINA_PASSWORD
 *
 * Each test creates the offers it needs through the API, with a unique title,
 * and takes them out of the public catalog when it ends (retirarOferta).
 */

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

export type Rol = "postulante" | "empresa" | "oficina";

type Playwright = PlaywrightWorkerArgs["playwright"];

const INGRESO: Record<Rol, string> = {
  postulante: "/postulante/ingresar",
  empresa: "/empresa/ingresar",
  oficina: "/admin/ingresar",
};

const PREFIJO: Record<Rol, string> = {
  postulante: "E2E_POSTULANTE",
  empresa: "E2E_EMPRESA",
  oficina: "E2E_OFICINA",
};

/** The test account of a role. Fails with a clear message when the variables are missing. */
export function credenciales(rol: Rol): { email: string; password: string } {
  const email = process.env[`${PREFIJO[rol]}_EMAIL`];
  const password = process.env[`${PREFIJO[rol]}_PASSWORD`];
  if (!email || !password) {
    throw new Error(`Faltan ${PREFIJO[rol]}_EMAIL y ${PREFIJO[rol]}_PASSWORD en .env.local (ver docs/como_probar.md).`);
  }
  return { email, password };
}

/** Fills and sends the login form that is on screen, with the role's test account. */
export async function completarIngreso(page: Page, rol: Rol) {
  const { email, password } = credenciales(rol);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Ingresar" }).click();
}

/**
 * Logs in through the real login screen and waits until it leaves it. The
 * generous timeout covers the dev server compiling a route the first time.
 */
export async function ingresarComo(page: Page, rol: Rol) {
  await page.goto(INGRESO[rol]);
  await completarIngreso(page, rol);
  await expect(page).not.toHaveURL(new RegExp(`${INGRESO[rol]}$`), { timeout: 20_000 });
}

/** An API client logged in as the role's test account, to prepare data without clicking through screens. */
export async function sesionApi(playwright: Playwright, rol: Rol): Promise<APIRequestContext> {
  const api = await playwright.request.newContext({ baseURL: test.info().project.use.baseURL });
  const respuesta = await api.post("/api/auth/ingreso", { data: credenciales(rol) });
  expect(respuesta.ok(), `login of the ${rol} test account`).toBe(true);
  return api;
}

export type OfertaDePrueba = { id: string; titulo: string };

/**
 * Creates an offer as the test company. It starts pending (D-007). The title
 * is unique, so each test finds exactly its own offer.
 */
export async function crearOfertaPendiente(
  playwright: Playwright,
  datos: { titulo?: string; rubros?: string[] } = {},
): Promise<OfertaDePrueba> {
  const titulo = `${datos.titulo ?? "Prueba automática"} ${Date.now()}${Math.floor(Math.random() * 1000)} (e2e)`;
  const empresa = await sesionApi(playwright, "empresa");
  const respuesta = await empresa.post("/api/empresa/ofertas", {
    data: {
      titulo,
      descripcion: "Oferta creada por un test automático.",
      requisitos: "Ninguno.",
      lugar: "Funes (prueba)",
      jornada: "Lunes a viernes de 9 a 13",
      sueldo: "",
      rubros: datos.rubros ?? ["otros"],
    },
  });
  expect(respuesta.status(), "create the test offer").toBe(201);
  const { oferta } = z.object({ oferta: z.object({ id: z.string() }) }).parse(await respuesta.json());
  await empresa.dispose();
  return { id: oferta.id, titulo };
}

/** Creates an offer and has the test Office account publish it. */
export async function crearOfertaPublicada(
  playwright: Playwright,
  datos: { titulo?: string; rubros?: string[] } = {},
): Promise<OfertaDePrueba> {
  const oferta = await crearOfertaPendiente(playwright, datos);
  const oficina = await sesionApi(playwright, "oficina");
  const respuesta = await oficina.post(`/api/admin/ofertas/${oferta.id}/publicacion`);
  expect(respuesta.ok(), "publish the test offer").toBe(true);
  await oficina.dispose();
  return oferta;
}

/**
 * Takes a test offer out of the public catalog, so the testing database does
 * not fill up with them. Offers are never deleted (Q-002): a pending one is
 * rejected, and a published one is closed (the company asks, the Office
 * closes). Rejected or closed ones are left as they are.
 */
export async function retirarOferta(playwright: Playwright, id: string) {
  const oficina = await sesionApi(playwright, "oficina");
  const ofertas = z
    .array(z.object({ id: z.string(), estado: z.string() }))
    .parse(await (await oficina.get("/api/admin/ofertas")).json());
  const estado = ofertas.find((oferta) => oferta.id === id)?.estado;

  if (estado === "pendiente") {
    const rechazo = await oficina.post(`/api/admin/ofertas/${id}/rechazo`, {
      data: { motivo: "Oferta de un test automático." },
    });
    expect(rechazo.ok(), "reject the test offer").toBe(true);
  }
  if (estado === "publicada") {
    const empresa = await sesionApi(playwright, "empresa");
    expect((await empresa.post(`/api/empresa/ofertas/${id}/solicitud-cierre`)).ok(), "ask to close").toBe(true);
    await empresa.dispose();
    expect((await oficina.post(`/api/admin/ofertas/${id}/cierre`)).ok(), "close the test offer").toBe(true);
  }
  await oficina.dispose();
}

/** A tiny valid PDF (it starts with %PDF-, which the server checks). */
export const PDF_DE_PRUEBA = {
  name: "cv-e2e.pdf",
  mimeType: "application/pdf",
  buffer: Buffer.from("%PDF-1.4\n% e2e\n"),
};
