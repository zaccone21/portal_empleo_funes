import { expect, test } from "@playwright/test";

import { crearOfertaPendiente, ingresarComo, retirarOferta, sesionApi } from "./ayudas";

// Company screens on the testing database, logged in as the test company.

test.beforeEach(async ({ page }) => {
  await ingresarComo(page, "empresa");
});

test("a company publishes an offer and finds it pending in 'Mis ofertas'", async ({ page, playwright }) => {
  const puesto = `Ayudante de depósito ${Date.now()} (e2e)`;

  await page.goto("/empresa/ofertas/nueva");
  await page.getByLabel("Puesto").fill(puesto);
  await page.getByRole("checkbox", { name: "Comercio y ventas" }).check();
  await page.getByLabel("Qué va a hacer la persona").fill("Ordenar mercadería.");
  await page.getByLabel("Qué tiene que tener").fill("Ganas de trabajar.");
  await page.getByLabel("Dónde es el trabajo").fill("Parque industrial (prueba)");
  await page.getByLabel("Días y horario").fill("Lunes a viernes de 8 a 16");
  await page.getByRole("button", { name: "Enviar oferta" }).click();

  await expect(page).toHaveURL(/\/empresa\/ofertas\?oferta=/);
  const id = new URL(page.url()).searchParams.get("oferta") ?? "";
  try {
    const detalle = page.getByRole("article", { name: puesto });
    await expect(detalle).toBeVisible();
    await expect(detalle.getByText("Pendiente")).toBeVisible();
  } finally {
    await retirarOferta(playwright, id);
  }
});

test("a rejected offer shows the Office's reason (RF1.3.5)", async ({ page, playwright }) => {
  const oferta = await crearOfertaPendiente(playwright);
  const oficina = await sesionApi(playwright, "oficina");
  const rechazo = await oficina.post(`/api/admin/ofertas/${oferta.id}/rechazo`, {
    data: { motivo: "Falta el horario (prueba)." },
  });
  expect(rechazo.ok(), "reject the test offer").toBe(true);
  await oficina.dispose();

  await page.goto(`/empresa/ofertas?oferta=${oferta.id}`);
  const detalle = page.getByRole("article", { name: oferta.titulo });
  await expect(detalle.getByText("Motivo del rechazo")).toBeVisible();
  await expect(detalle.getByText("Falta el horario (prueba).")).toBeVisible();
});

test("the form explains missing fields next to each one", async ({ page }) => {
  await page.goto("/empresa/ofertas/nueva");
  await page.getByRole("button", { name: "Enviar oferta" }).click();

  await expect(page.getByText("Ingresá el puesto que buscás")).toBeVisible();
  await expect(page.getByText("Indicá dónde es el trabajo")).toBeVisible();
  await expect(page.getByText("Elegí al menos un rubro")).toBeVisible();
});
