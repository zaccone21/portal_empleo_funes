import { expect, test } from "@playwright/test";

import { crearOfertaPublicada, retirarOferta } from "./ayudas";

// The offer catalog (P05, D-029): trade filter, search and order, all in the URL.

test("filtering by trade narrows the list and keeps the filter when opening an offer", async ({ page, playwright }) => {
  const oferta = await crearOfertaPublicada(playwright, { rubros: ["jardineria"] });
  try {
    await page.goto("/ofertas");
    await page.getByRole("navigation", { name: "Rubros" }).getByRole("link", { name: "Jardinería y mantenimiento" }).click();

    await expect(page).toHaveURL("/ofertas?rubro=jardineria");
    await expect(page.getByText(/^Hay \d+ ofertas? de Jardinería y mantenimiento\.$/)).toBeVisible();

    await page.getByRole("link", { name: oferta.titulo }).click();
    await expect(page).toHaveURL(`/ofertas?rubro=jardineria&oferta=${oferta.id}`);
  } finally {
    await retirarOferta(playwright, oferta.id);
  }
});

test("the search ignores accents and says when nothing matches", async ({ page, playwright }) => {
  const oferta = await crearOfertaPublicada(playwright, { titulo: "Técnico electricista" });
  const numero = oferta.titulo.match(/\d+/)?.[0] ?? "";
  try {
    await page.goto("/ofertas");
    // Typed without the accent, as on a phone keyboard.
    await page.getByLabel("Buscá por puesto, tarea o barrio").fill(`tecnico ${numero}`);
    await page.getByRole("search").getByRole("button", { name: "Buscar" }).click();
    await expect(page.getByRole("link", { name: oferta.titulo })).toBeVisible();

    await page.getByLabel("Buscá por puesto, tarea o barrio").fill("astronauta submarino");
    await page.getByRole("search").getByRole("button", { name: "Buscar" }).click();
    await expect(page.getByText("No encontramos ofertas con esa búsqueda")).toBeVisible();
  } finally {
    await retirarOferta(playwright, oferta.id);
  }
});

test("the order can be changed from the phone's own picker", async ({ page }) => {
  await page.goto("/ofertas");
  await page.getByLabel("Ordenar").selectOption("antiguas");

  await expect(page).toHaveURL("/ofertas?orden=antiguas");
});
