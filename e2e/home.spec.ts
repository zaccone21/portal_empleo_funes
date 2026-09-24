import { expect, test } from "@playwright/test";

test("home renders in Spanish with the portal heading", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("html")).toHaveAttribute("lang", "es-AR");
  await expect(page.getByRole("heading", { level: 1, name: "Portal de Empleo" })).toBeVisible();
});
