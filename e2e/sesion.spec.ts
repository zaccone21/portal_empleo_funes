import { expect, test } from "@playwright/test";

import { completarIngreso, credenciales, ingresarComo } from "./ayudas";

// Session-aware navigation (D-028) with Supabase Auth and the test accounts.

test("a company lands on its home, sees its menu and can log out", async ({ page, isMobile }) => {
  await ingresarComo(page, "empresa");
  await expect(page).toHaveURL("/empresa");

  // On phones the menu is the bottom bar; on desktop, the top bar. Only one is visible.
  await expect(page.getByRole("link", { name: "Publicar", exact: true }).filter({ visible: true })).toHaveCount(1);
  if (!isMobile) {
    await expect(page.getByText(credenciales("empresa").email)).toBeVisible();
  }

  await page.getByRole("button", { name: "Salir" }).click();
  await expect(page).toHaveURL("/empresa/ingresar");
  await expect(page.getByText("Saliste de tu cuenta.")).toBeVisible();
});

test("a private screen without a session asks to log in and comes back afterwards", async ({ page }) => {
  await page.goto("/postulante/cv");
  await expect(page.getByText("Ingresá para subir tu CV")).toBeVisible();

  await page.getByRole("main").getByRole("link", { name: "Ingresar" }).click();
  await expect(page).toHaveURL(/\/postulante\/ingresar\?volver=/);

  await completarIngreso(page, "postulante");

  await expect(page).toHaveURL("/postulante/cv");
  await expect(page.getByRole("heading", { name: /Subí tu CV|Reemplazar tu CV/ })).toBeVisible();
});

test("a wrong email is rejected without saying whether the account exists", async ({ page }) => {
  await page.goto("/postulante/ingresar");
  await page.getByLabel("Email").fill(`nadie-${Date.now()}@ejemplo.com`);
  await page.getByLabel("Contraseña", { exact: true }).fill("una-contrasena-cualquiera");
  await page.getByRole("button", { name: "Ingresar" }).click();

  await expect(page.getByText("Email o contraseña incorrectos")).toBeVisible();
});
