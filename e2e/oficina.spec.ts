import { expect, test } from "@playwright/test";

import { PDF_DE_PRUEBA, crearOfertaPendiente, crearOfertaPublicada, ingresarComo, retirarOferta, sesionApi } from "./ayudas";

// The Employment Office (P14, P15; D-042) on the testing database,
// logged in as the test Office account. Each test prepares its own offer and
// uses the full page of the offer (/admin/ofertas/<id>), which shows the same
// detail as the side panel at every screen width.

test.beforeEach(async ({ page }) => {
  await ingresarComo(page, "oficina");
});

test("the dashboard's tiles lead to the offers to review", async ({ page }) => {
  await expect(page).toHaveURL("/admin");

  await page.getByRole("main").getByRole("link", { name: /ofertas por revisar/i }).click();
  await expect(page).toHaveURL("/admin/ofertas/por-revisar");
  await expect(page.getByRole("heading", { name: "Ofertas por revisar" })).toBeVisible();
});

test("an admin page without a session sends to the Office login", async ({ browser }) => {
  const contexto = await browser.newContext();
  const anonima = await contexto.newPage();
  await anonima.goto("/admin/ofertas");
  await expect(anonima).toHaveURL("/admin/ingresar");
  await contexto.close();
});

test("rejecting an offer requires a reason", async ({ page, playwright }) => {
  const oferta = await crearOfertaPendiente(playwright);
  try {
    await page.goto(`/admin/ofertas/${oferta.id}`);
    await expect(page.getByRole("heading", { name: oferta.titulo })).toBeVisible({ timeout: 20_000 });

    await page.getByRole("button", { name: "Rechazar" }).click();
    const dialogo = page.getByRole("alertdialog");
    const confirmar = dialogo.getByRole("button", { name: "Rechazar oferta" });
    await expect(confirmar).toBeDisabled();

    await dialogo.getByLabel("Motivo del rechazo").fill("Faltan los requisitos (e2e).");
    await expect(confirmar).toBeEnabled();
    await confirmar.click();
    await expect(page.getByText(/Rechazad[ao]/).first()).toBeVisible();
  } finally {
    await retirarOferta(playwright, oferta.id);
  }
});

test("a published offer lists its applicants and the evaluation opens their CV", async ({ page, playwright }) => {
  const oferta = await crearOfertaPublicada(playwright);
  try {
    const postulante = await sesionApi(playwright, "postulante");
    expect((await postulante.put("/api/cv", { multipart: { archivo: PDF_DE_PRUEBA } })).ok(), "upload the CV").toBe(true);
    expect((await postulante.post("/api/postulaciones", { data: { ofertaId: oferta.id } })).status(), "apply").toBe(201);
    await postulante.dispose();

    await page.goto(`/admin/ofertas/${oferta.id}?tab=postulaciones`);
    await page.getByRole("link", { name: "Ver", exact: true }).first().click();
    await expect(page.getByRole("heading", { name: "Evaluación de postulación" })).toBeVisible({ timeout: 20_000 });

    // The route redirects to a short-lived signed link of the private bucket (RNF1).
    const descargar = page.getByRole("link", { name: "Descargar PDF" });
    const respuesta = await page.request.get(String(await descargar.getAttribute("href")));
    expect(respuesta.headers()["content-type"]).toContain("application/pdf");
  } finally {
    await retirarOferta(playwright, oferta.id);
  }
});

test("the company's contact data is one tap away", async ({ page, playwright }) => {
  const empresa = await sesionApi(playwright, "empresa");
  const perfil = await empresa.put("/api/empresa/perfil", {
    data: {
      razonSocial: "Empresa de prueba (e2e)",
      cuit: "30-71234567-1",
      descripcion: "",
      contactoNombre: "Persona de prueba",
      contactoTelefono: "341 555-0102",
      contactoEmail: "contacto@ejemplo.com",
    },
  });
  expect(perfil.ok(), "save the test company's data").toBe(true);
  await empresa.dispose();

  const oferta = await crearOfertaPublicada(playwright);
  try {
    await page.goto(`/admin/ofertas/${oferta.id}`);
    await expect(page.getByRole("link", { name: "Llamar · 341 555 0102" })).toHaveAttribute("href", "tel:+543415550102");
  } finally {
    await retirarOferta(playwright, oferta.id);
  }
});
