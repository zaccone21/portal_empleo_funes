import { expect, test } from "@playwright/test";

// Critical flow "apply to an offer" (AGENTS §11), against the simulated API
// (DT-003, D-026). The simulated store is shared by the whole dev server, so
// the test uploads a CV first instead of assuming the store is empty; the
// "no CV" branch is covered by unit tests. When the real backend exists this
// spec needs a logged-in applicant.

test("an applicant uploads a CV, applies to an offer and sees it in their applications", async ({ page }) => {
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

  await page.getByRole("button", { name: "Postularme" }).click();
  await expect(page.getByText("Te postulaste a esta oferta")).toBeVisible();

  await page.getByRole("link", { name: "Ver mis postulaciones" }).click();
  await expect(page).toHaveURL("/postulante/postulaciones");
  await expect(page.getByRole("heading", { name: "Chofer de reparto (ejemplo)" })).toBeVisible();
});

test("on a phone, the detail replaces the list and 'Volver' returns to it", async ({ page, isMobile }) => {
  test.skip(!isMobile, "phone layout only");

  await page.goto("/ofertas");
  await page.getByRole("link", { name: /Jardinero o jardinera \(ejemplo\)/ }).click();

  await expect(page.getByRole("heading", { level: 2, name: "Jardinero o jardinera (ejemplo)" })).toBeVisible();
  await expect(page.getByText("Hay 5 ofertas publicadas.")).toBeHidden();

  await page.getByRole("link", { name: "Volver a las ofertas" }).click();
  await expect(page.getByText("Hay 5 ofertas publicadas.")).toBeVisible();
});
