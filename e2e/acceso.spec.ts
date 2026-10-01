import { expect, test } from "@playwright/test";

// Access screens without a backend: rendering, client-side validation and the
// links between screens. The real login/registration flow is added once the
// /api/auth/* Route Handlers exist.

test("applicant login shows field errors in Spanish when submitted empty", async ({ page }) => {
  await page.goto("/postulante/ingresar");

  await expect(page.getByRole("heading", { level: 1, name: "Ingresá a tu cuenta" })).toBeVisible();
  await page.getByRole("button", { name: "Ingresar" }).click();

  await expect(page.getByText("Ingresá tu email")).toBeVisible();
  await expect(page.getByText("Ingresá tu contraseña")).toBeVisible();
});

test("applicant screens link to each other", async ({ page }) => {
  await page.goto("/postulante/ingresar");

  await page.getByRole("link", { name: "¿No tenés cuenta? Registrate" }).click();
  await expect(page).toHaveURL("/postulante/registrarse");
  await expect(page.getByRole("heading", { level: 1, name: "Creá tu cuenta" })).toBeVisible();

  await page.getByRole("link", { name: "¿Ya tenés cuenta? Ingresá" }).click();
  await page.getByRole("link", { name: "Olvidé mi contraseña" }).click();
  await expect(page).toHaveURL("/postulante/recuperar-contrasena");
});

test("company screens link to each other", async ({ page }) => {
  await page.goto("/empresa/ingresar");

  await page.getByRole("link", { name: "¿Tu empresa no tiene cuenta? Registrala" }).click();
  await expect(page).toHaveURL("/empresa/registrarse");

  await page.getByRole("link", { name: "¿Tu empresa ya tiene cuenta? Ingresá" }).click();
  await page.getByRole("link", { name: "Olvidé mi contraseña" }).click();
  await expect(page).toHaveURL("/empresa/recuperar-contrasena");
});

test("admin login has no registration or recovery links (RF1.1.4)", async ({ page }) => {
  await page.goto("/admin/ingresar");

  await expect(page.getByRole("heading", { level: 1, name: "Ingreso de la Oficina de Empleo" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Registr/ })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Olvidé mi contraseña" })).toHaveCount(0);
});

test("registration checks that both passwords match", async ({ page }) => {
  await page.goto("/postulante/registrarse");

  await page.getByLabel("Email").fill("persona@ejemplo.com");
  await page.getByLabel("Contraseña", { exact: true }).fill("12345678");
  await page.getByLabel("Repetí la contraseña").fill("87654321");
  await page.getByRole("button", { name: "Crear cuenta" }).click();

  await expect(page.getByText("Las contraseñas no coinciden")).toBeVisible();
});
