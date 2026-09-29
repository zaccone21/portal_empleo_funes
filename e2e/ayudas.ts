import { expect, type Page } from "@playwright/test";

/*
 * Shared steps for the e2e specs. They log in with the test users of the
 * simulated API (src/mocks/sesion.ts, D-028), which accept any password.
 * When Supabase Auth is connected, these users must exist in the test project.
 */

export const USUARIOS = {
  postulante: { email: "postulante@ejemplo.com", ingreso: "/postulante/ingresar" },
  empresa: { email: "empresa@ejemplo.com", ingreso: "/empresa/ingresar" },
  oficina: { email: "oficina@ejemplo.com", ingreso: "/admin/ingresar" },
} as const;

/**
 * Logs in through the real login screen and waits until it leaves it. The
 * generous timeout covers the dev server compiling a route the first time.
 */
export async function ingresarComo(page: Page, quien: keyof typeof USUARIOS) {
  const { email, ingreso } = USUARIOS[quien];
  await page.goto(ingreso);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill("contrasena-de-prueba");
  await page.getByRole("button", { name: "Ingresar" }).click();
  await expect(page).not.toHaveURL(new RegExp(`${ingreso}$`), { timeout: 20_000 });
}
