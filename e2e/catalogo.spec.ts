import { expect, test } from "@playwright/test";

// The offer catalog (P05, D-029): trade filter, search and order, all in the URL.

test("filtering by trade narrows the list and keeps the filter when opening an offer", async ({ page }) => {
  await page.goto("/ofertas");
  await page.getByRole("navigation", { name: "Rubros" }).getByRole("link", { name: "Jardinería y mantenimiento" }).click();

  await expect(page).toHaveURL("/ofertas?rubro=jardineria");
  await expect(page.getByText("Hay 1 oferta de Jardinería y mantenimiento.")).toBeVisible();

  await page.getByRole("link", { name: /Jardinero o jardinera \(ejemplo\)/ }).click();
  await expect(page).toHaveURL("/ofertas?rubro=jardineria&oferta=ejemplo-2");
});

test("the search ignores accents and says when nothing matches", async ({ page }) => {
  await page.goto("/ofertas");
  const buscador = page.getByLabel("Buscá por puesto, tarea o barrio");

  await buscador.fill("electricista");
  await page.getByRole("search").getByRole("button", { name: "Buscar" }).click();
  await expect(page).toHaveURL("/ofertas?q=electricista");
  await expect(page.getByRole("link", { name: /Electricista matriculado \(ejemplo\)/ })).toBeVisible();

  await page.getByLabel("Buscá por puesto, tarea o barrio").fill("astronauta");
  await page.getByRole("search").getByRole("button", { name: "Buscar" }).click();
  await expect(page.getByText("No encontramos ofertas con esa búsqueda")).toBeVisible();
});

test("the order can be changed from the phone's own picker", async ({ page }) => {
  await page.goto("/ofertas");
  await page.getByLabel("Ordenar").selectOption("antiguas");

  await expect(page).toHaveURL("/ofertas?orden=antiguas");
});
