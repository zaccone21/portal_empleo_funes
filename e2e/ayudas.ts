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

/**
 * Runs `pasos` as the test Office account in a browser of its own. The Office
 * decides through its screens (Server Actions, D-042), like an operator does:
 * there is no API for it.
 */
async function comoOficina(playwright: Playwright, pasos: (page: Page) => Promise<void>) {
  const navegador = await playwright.chromium.launch();
  try {
    const contexto = await navegador.newContext({ baseURL: test.info().project.use.baseURL });
    const page = await contexto.newPage();
    await ingresarComo(page, "oficina");
    await pasos(page);
  } finally {
    await navegador.close();
  }
}

/** Opens the full page of an offer in the Office and waits until it shows its title. */
async function abrirOfertaEnOficina(page: Page, id: string) {
  await page.goto(`/admin/ofertas/${id}`);
  await expect(page.getByRole("heading", { level: 2 })).toBeVisible({ timeout: 20_000 });
}

/** The Office publishes a pending offer (RF1.5.3). */
export async function publicarComoOficina(playwright: Playwright, id: string) {
  await comoOficina(playwright, async (page) => {
    await abrirOfertaEnOficina(page, id);
    await page.getByRole("button", { name: "Aprobar" }).click();
    await expect(page.getByText(/Publicad[ao]/).first()).toBeVisible();
  });
}

/** The Office rejects a pending offer with a reason the company will read (RF1.3.5, RF1.5.3). */
export async function rechazarComoOficina(playwright: Playwright, id: string, motivo: string) {
  await comoOficina(playwright, async (page) => {
    await abrirOfertaEnOficina(page, id);
    await page.getByRole("button", { name: "Rechazar" }).click();
    const dialogo = page.getByRole("alertdialog");
    // One of the fixed reasons (D-069), plus the note the company will read after it.
    await dialogo.getByRole("radio", { name: "Falta información en la oferta" }).click();
    await dialogo.getByLabel("Observación (opcional)").fill(motivo);
    await dialogo.getByRole("button", { name: "Rechazar oferta" }).click();
    await expect(page.getByText(/Rechazad[ao]/).first()).toBeVisible();
  });
}

/** The Office closes a published offer whose company asked for it (RF1.5.4). */
async function cerrarComoOficina(playwright: Playwright, id: string) {
  await comoOficina(playwright, async (page) => {
    await abrirOfertaEnOficina(page, id);
    await page.getByRole("button", { name: "Cerrar oferta" }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Cerrar oferta" }).click();
    await expect(page.getByText(/Cerrad[ao]/).first()).toBeVisible();
  });
}

/** Creates an offer and has the test Office account publish it. */
export async function crearOfertaPublicada(
  playwright: Playwright,
  datos: { titulo?: string; rubros?: string[] } = {},
): Promise<OfertaDePrueba> {
  const oferta = await crearOfertaPendiente(playwright, datos);
  await publicarComoOficina(playwright, oferta.id);
  return oferta;
}

/**
 * Takes a test offer out of the public catalog, so the testing database does
 * not fill up with them. Offers are never deleted (Q-002): a pending one is
 * rejected, and a published one is closed (the company asks, the Office
 * closes). Rejected or closed ones are left as they are.
 */
export async function retirarOferta(playwright: Playwright, id: string) {
  const empresa = await sesionApi(playwright, "empresa");
  const ofertas = z
    .array(z.object({ id: z.string(), estado: z.string() }))
    .parse(await (await empresa.get("/api/empresa/ofertas")).json());
  const estado = ofertas.find((oferta) => oferta.id === id)?.estado;

  if (estado === "publicada") {
    expect((await empresa.post(`/api/empresa/ofertas/${id}/solicitud-cierre`)).ok(), "ask to close").toBe(true);
  }
  await empresa.dispose();

  if (estado === "pendiente") await rechazarComoOficina(playwright, id, "Oferta de un test automático.");
  if (estado === "publicada") await cerrarComoOficina(playwright, id);
}

/** A tiny valid PDF (it starts with %PDF-, which the server checks). */
export const PDF_DE_PRUEBA = {
  name: "cv-e2e.pdf",
  mimeType: "application/pdf",
  buffer: Buffer.from("%PDF-1.4\n% e2e\n"),
};
