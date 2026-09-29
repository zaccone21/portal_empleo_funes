import { expect, test } from "@playwright/test";

import { ingresarComo } from "./ayudas";

// The Employment Office (P14, P15; D-030) against the simulated API, logged in
// as the test Office account. The simulated store is shared by the whole dev
// server, so the tests look for what they need instead of assuming counts.

test.beforeEach(async ({ page }) => {
  await ingresarComo(page, "oficina");
});

test("the panel's indicators lead to the offers to review", async ({ page }) => {
  await expect(page).toHaveURL("/admin");

  await page.getByRole("link", { name: /ofertas? para revisar/ }).click();
  await expect(page).toHaveURL("/admin/ofertas?estado=pending");
  await expect(page.getByRole("navigation", { name: "Ofertas por estado" }).getByRole("link", { name: /Pendientes/ })).toHaveAttribute(
    "aria-current",
    "page",
  );
});

test("rejecting an offer requires a reason", async ({ page }) => {
  await page.goto("/admin/ofertas?estado=pending");
  // Wait until the tab loaded: either the first pending offer or the "nothing to review" message.
  const primera = page.getByRole("main").getByRole("link", { name: /\(ejemplo\)/ }).first();
  await expect(primera.or(page.getByText("No hay ofertas para revisar"))).toBeVisible({ timeout: 20_000 });
  test.skip(!(await primera.isVisible()), "no pending offers left");

  // On phones only the list shows until an offer is picked (D-025).
  await primera.click();
  const detalle = page.getByRole("article");
  await detalle.getByRole("button", { name: "Rechazar" }).click();
  await detalle.getByRole("button", { name: "Rechazar la oferta" }).click();
  await expect(detalle.getByText("Escribí el motivo: la empresa lo va a leer")).toBeVisible();
});

test("a published offer shows its applicants with their CV and status", async ({ page }) => {
  await page.goto("/admin/ofertas?estado=published&oferta=ejemplo-1");
  const detalle = page.getByRole("article", { name: "Ayudante de cocina (ejemplo)" });

  await expect(detalle.getByRole("link", { name: "ana.ejemplo@ejemplo.com" })).toBeVisible({ timeout: 20_000 });
  const verCv = detalle.getByRole("link", { name: "Ver CV" }).first();
  await expect(verCv).toHaveAttribute("target", "_blank");

  const respuesta = await page.request.get(String(await verCv.getAttribute("href")));
  expect(respuesta.headers()["content-type"]).toContain("application/pdf");
});

test("the company's contact data is one tap away", async ({ page }) => {
  await page.goto("/admin/ofertas?estado=published&oferta=ejemplo-2");
  const detalle = page.getByRole("article", { name: "Jardinero o jardinera (ejemplo)" });

  await expect(detalle.getByRole("link", { name: "341 555-0102" })).toHaveAttribute("href", "tel:3415550102");
});
