import { expect, test } from "@playwright/test";

import {
  PDF_DE_PRUEBA,
  credenciales,
  crearOfertaPendiente,
  crearOfertaPublicada,
  ingresarComo,
  retirarOferta,
  sesionApi,
} from "./ayudas";

// The Employment Office (P14, P15; D-030) on the testing database, logged in
// as the test Office account. Each test prepares its own offer.

test.beforeEach(async ({ page }) => {
  await ingresarComo(page, "oficina");
});

test("the panel's indicators lead to the offers to review", async ({ page }) => {
  await expect(page).toHaveURL("/admin");

  await page.getByRole("link", { name: /ofertas? para revisar/ }).click();
  await expect(page).toHaveURL("/admin/ofertas?estado=pendiente");
  await expect(page.getByRole("navigation", { name: "Ofertas por estado" }).getByRole("link", { name: /Pendientes/ })).toHaveAttribute(
    "aria-current",
    "page",
  );
});

test("rejecting an offer requires a reason", async ({ page, playwright }) => {
  const oferta = await crearOfertaPendiente(playwright);
  try {
    await page.goto(`/admin/ofertas?estado=pendiente&oferta=${oferta.id}`);
    const detalle = page.getByRole("article", { name: oferta.titulo });
    await detalle.getByRole("button", { name: "Rechazar" }).click();
    await detalle.getByRole("button", { name: "Rechazar la oferta" }).click();
    await expect(detalle.getByText("Escribí el motivo: la empresa lo va a leer")).toBeVisible();
  } finally {
    await retirarOferta(playwright, oferta.id);
  }
});

test("a published offer shows its applicants with their CV and status", async ({ page, playwright }) => {
  const oferta = await crearOfertaPublicada(playwright);
  try {
    const postulante = await sesionApi(playwright, "postulante");
    expect((await postulante.put("/api/cv", { multipart: { archivo: PDF_DE_PRUEBA } })).ok(), "upload the CV").toBe(true);
    expect((await postulante.post("/api/postulaciones", { data: { ofertaId: oferta.id } })).status(), "apply").toBe(201);
    await postulante.dispose();

    await page.goto(`/admin/ofertas?estado=publicada&oferta=${oferta.id}`);
    const detalle = page.getByRole("article", { name: oferta.titulo });
    await expect(detalle.getByRole("link", { name: credenciales("postulante").email })).toBeVisible({ timeout: 20_000 });

    const verCv = detalle.getByRole("link", { name: "Ver CV" }).first();
    await expect(verCv).toHaveAttribute("target", "_blank");
    // The route redirects to a short-lived signed link of the private bucket (RNF1).
    const respuesta = await page.request.get(String(await verCv.getAttribute("href")));
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
    await page.goto(`/admin/ofertas?estado=publicada&oferta=${oferta.id}`);
    const detalle = page.getByRole("article", { name: oferta.titulo });
    await expect(detalle.getByRole("link", { name: "341 555-0102" })).toHaveAttribute("href", "tel:3415550102");
  } finally {
    await retirarOferta(playwright, oferta.id);
  }
});
