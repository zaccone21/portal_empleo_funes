import { expect, test } from "@playwright/test";

import { PDF_DE_PRUEBA, completarIngreso, crearOfertaPublicada, ingresarComo, retirarOferta } from "./ayudas";

// Critical flow "apply to an offer" (AGENTS §11), on the testing database with
// the test applicant. Each test publishes its own offer and takes it out of
// the catalog at the end. The "no CV" branch is covered by unit tests.

test("an applicant uploads a CV, applies to an offer and sees it in their applications", async ({ page, playwright }) => {
  const oferta = await crearOfertaPublicada(playwright);
  try {
    await ingresarComo(page, "postulante");

    await page.goto("/postulante/cv");
    await page.locator("#archivo-cv").setInputFiles(PDF_DE_PRUEBA);
    await page.getByRole("button", { name: /^(Subir|Reemplazar) CV$/ }).click();
    await expect(page.getByText("Listo, subiste tu CV.")).toBeVisible();
    await expect(page.getByRole("region", { name: "Tu CV" })).toContainText("cv-e2e.pdf");

    await page.goto(`/ofertas?oferta=${oferta.id}`);
    const detalle = page.getByRole("article", { name: oferta.titulo });
    await detalle.getByRole("button", { name: "Postularme" }).click();
    await expect(detalle.getByText("Te postulaste a esta oferta")).toBeVisible();

    await detalle.getByRole("link", { name: "Ver mis postulaciones" }).click();
    await expect(page).toHaveURL("/postulante/postulaciones");
    await expect(page.getByRole("heading", { name: oferta.titulo })).toBeVisible();
  } finally {
    await retirarOferta(playwright, oferta.id);
  }
});

test("on a phone, the detail replaces the list and 'Volver' returns to it", async ({ page, playwright, isMobile }) => {
  test.skip(!isMobile, "phone layout only");

  const oferta = await crearOfertaPublicada(playwright);
  try {
    await page.goto("/ofertas");
    await page.getByRole("link", { name: oferta.titulo }).click();

    await expect(page.getByRole("heading", { level: 2, name: oferta.titulo })).toBeVisible();
    await expect(page.getByText(/^Hay \d+ ofertas? publicadas?\.$/)).toBeHidden();

    await page.getByRole("link", { name: "Volver a las ofertas" }).click();
    await expect(page.getByText(/^Hay \d+ ofertas? publicadas?\.$/)).toBeVisible();
  } finally {
    await retirarOferta(playwright, oferta.id);
  }
});

test("without an account, 'Postularme' asks to log in and brings the person back to the offer", async ({ page, playwright }) => {
  const oferta = await crearOfertaPublicada(playwright);
  try {
    await page.goto(`/ofertas?oferta=${oferta.id}`);
    const detalle = page.getByRole("article", { name: oferta.titulo });

    await detalle.getByRole("button", { name: "Postularme" }).click();
    await expect(detalle.getByText("Para postularte, ingresá con tu cuenta")).toBeVisible();

    await detalle.getByRole("link", { name: "Ingresar" }).click();
    await completarIngreso(page, "postulante");

    await expect(page).toHaveURL(`/ofertas?oferta=${oferta.id}`);
  } finally {
    await retirarOferta(playwright, oferta.id);
  }
});
