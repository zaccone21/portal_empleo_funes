import { expect, test } from "@playwright/test";

test("home renders in Spanish with the portal heading", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("html")).toHaveAttribute("lang", "es-AR");
  await expect(page.getByRole("heading", { level: 1, name: "Tu próximo trabajo está en Funes." })).toBeVisible();
});

test("the home search leads to the catalog with the results (D-029)", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("¿Qué trabajo buscás?").fill("cocina");
  await page.getByRole("button", { name: "Buscar" }).click();

  await expect(page).toHaveURL("/ofertas?q=cocina");
  await expect(page.getByRole("link", { name: /Ayudante de cocina \(ejemplo\)/ })).toBeVisible();
});

test("the home shows recent offers that open in the catalog", async ({ page }) => {
  await page.goto("/");
  const recientes = page.getByRole("region", { name: "Ofertas recientes" });

  await expect(recientes.getByRole("link").first()).toBeVisible();
  await recientes.getByRole("link", { name: "Ver todas las ofertas" }).click();
  await expect(page).toHaveURL("/ofertas");
});
