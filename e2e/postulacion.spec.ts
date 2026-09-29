import { expect, test } from "@playwright/test";

import { ingresarComo } from "./ayudas";

// Critical flow "apply to an offer" (AGENTS §11), against the simulated API
// (DT-003, D-026, D-028) with the test applicant. The simulated store is
// shared by the whole dev server, so the test uploads a CV first instead of
// assuming the store is empty; the "no CV" branch is covered by unit tests.

test("an applicant uploads a CV, applies to an offer and sees it in their applications", async ({ page }) => {
  await ingresarComo(page, "postulante");

  await page.goto("/postulante/cv");
  await page.locator("#archivo-cv").setInputFiles({
    name: "cv-e2e.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4\n% e2e\n"),
  });
  await page.getByRole("button", { name: /^(Subir|Reemplazar) CV$/ }).click();
  await expect(page.getByText("Listo, subiste tu CV.")).toBeVisible();
  await expect(page.getByRole("region", { name: "Tu CV" })).toContainText("cv-e2e.pdf");

  await page.goto("/ofertas");
  await page.getByRole("link", { name: /Chofer de reparto \(ejemplo\)/ }).click();
  await expect(page).toHaveURL("/ofertas?oferta=ejemplo-5");
  await expect(page.getByRole("dialog")).toHaveCount(0);

  const detalle = page.getByRole("article", { name: "Chofer de reparto (ejemplo)" });
  const postularme = detalle.getByRole("button", { name: "Postularme" });
  // The shared store may already have this application from another run.
  if (await postularme.isVisible()) {
    await postularme.click();
  }
  await expect(detalle.getByText("Te postulaste a esta oferta")).toBeVisible();

  await detalle.getByRole("link", { name: "Ver mis postulaciones" }).click();
  await expect(page).toHaveURL("/postulante/postulaciones");
  await expect(page.getByRole("heading", { name: "Chofer de reparto (ejemplo)" })).toBeVisible();
});

test("on a phone, the detail replaces the list and 'Volver' returns to it", async ({ page, isMobile }) => {
  test.skip(!isMobile, "phone layout only");

  await page.goto("/ofertas");
  await page.getByRole("link", { name: /Jardinero o jardinera \(ejemplo\)/ }).click();

  await expect(page.getByRole("heading", { level: 2, name: "Jardinero o jardinera (ejemplo)" })).toBeVisible();
  await expect(page.getByText(/^Hay \d+ ofertas publicadas\.$/)).toBeHidden();

  await page.getByRole("link", { name: "Volver a las ofertas" }).click();
  await expect(page.getByText(/^Hay \d+ ofertas publicadas\.$/)).toBeVisible();
});

test("without an account, 'Postularme' asks to log in and brings the person back to the offer", async ({ page }) => {
  await page.goto("/ofertas?oferta=ejemplo-3");
  const detalle = page.getByRole("article", { name: "Electricista matriculado (ejemplo)" });

  await detalle.getByRole("button", { name: "Postularme" }).click();
  await expect(detalle.getByText("Para postularte, ingresá con tu cuenta")).toBeVisible();

  await detalle.getByRole("link", { name: "Ingresar" }).click();
  await page.getByLabel("Email").fill("postulante@ejemplo.com");
  await page.getByLabel("Contraseña", { exact: true }).fill("contrasena-de-prueba");
  await page.getByRole("button", { name: "Ingresar" }).click();

  await expect(page).toHaveURL("/ofertas?oferta=ejemplo-3");
});
