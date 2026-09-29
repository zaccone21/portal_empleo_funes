import { expect, test } from "@playwright/test";

import { ingresarComo } from "./ayudas";

// Company screens against the simulated API (DT-003, D-026, D-028), logged in
// as the test company.

test.beforeEach(async ({ page }) => {
  await ingresarComo(page, "empresa");
});

test("a company publishes an offer and finds it pending in 'Mis ofertas'", async ({ page }) => {
  const puesto = `Ayudante de depósito ${Date.now()} (ejemplo)`;

  await page.goto("/empresa/ofertas/nueva");
  await page.getByLabel("Puesto").fill(puesto);
  await page.getByLabel("Rubro").selectOption("comercio");
  await page.getByLabel("Qué va a hacer la persona").fill("Ordenar mercadería.");
  await page.getByLabel("Qué tiene que tener").fill("Ganas de trabajar.");
  await page.getByLabel("Dónde es el trabajo").fill("Parque industrial de ejemplo");
  await page.getByLabel("Días y horario").fill("Lunes a viernes de 8 a 16");
  await page.getByRole("button", { name: "Enviar oferta" }).click();

  await expect(page).toHaveURL(/\/empresa\/ofertas\?oferta=/);
  const detalle = page.getByRole("article", { name: puesto });
  await expect(detalle).toBeVisible();
  await expect(detalle.getByText("Pendiente")).toBeVisible();
});

test("a rejected offer shows the Office's reason (RF1.3.5)", async ({ page }) => {
  await page.goto("/empresa/ofertas?oferta=empresa-ejemplo-4");

  const detalle = page.getByRole("article", { name: "Vendedor de mostrador (ejemplo)" });
  await expect(detalle.getByText("Motivo del rechazo")).toBeVisible();
});

test("the form explains missing fields next to each one", async ({ page }) => {
  await page.goto("/empresa/ofertas/nueva");
  await page.getByRole("button", { name: "Enviar oferta" }).click();

  await expect(page.getByText("Ingresá el puesto que buscás")).toBeVisible();
  await expect(page.getByText("Indicá dónde es el trabajo")).toBeVisible();
});
