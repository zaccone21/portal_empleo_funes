import { describe, expect, it } from "vitest";

import { coincideBusqueda, conDesde, leerDesde, leerLista, paginar, siguienteId, urlCon } from "./url";

describe("url del admin", () => {
  it("builds a URL changing and removing parameters", () => {
    expect(urlCon("/admin/ofertas", { estado: "pendiente", q: "qa" }, { q: undefined, sel: "1" })).toBe(
      "/admin/ofertas?estado=pendiente&sel=1",
    );
    expect(urlCon("/admin/ofertas", { q: "qa" }, { q: undefined })).toBe("/admin/ofertas");
  });

  it("reads list parameters", () => {
    expect(leerLista({ rubros: "a,b" }, "rubros")).toEqual(["a", "b"]);
    expect(leerLista({}, "rubros")).toEqual([]);
  });

  it("paginates and clamps the page", () => {
    const items = Array.from({ length: 120 }, (_, i) => i);
    expect(paginar(items, 3)).toMatchObject({ desde: 101, hasta: 120, total: 120, paginas: 3 });
    expect(paginar(items, 99).pagina).toBe(3);
    expect(paginar([], 1)).toMatchObject({ desde: 0, hasta: 0, total: 0 });
  });

  it("picks the next row, or the previous one when it was the last", () => {
    expect(siguienteId(["a", "b", "c"], "b")).toBe("c");
    expect(siguienteId(["a", "b", "c"], "c")).toBe("b");
    expect(siguienteId(["a"], "a")).toBeUndefined();
    expect(siguienteId(["a"], "x")).toBeUndefined();
  });

  it("only accepts an Office path as the page to go back to", () => {
    expect(leerDesde({ desde: "/admin/ofertas/por-revisar?q=mozo" })).toBe("/admin/ofertas/por-revisar?q=mozo");
    expect(leerDesde({ desde: "/admin" })).toBe("/admin");
    expect(leerDesde({ desde: "https://example.com/admin" })).toBeUndefined();
    expect(leerDesde({ desde: "//example.com/admin" })).toBeUndefined();
    expect(leerDesde({ desde: "/administrar" })).toBeUndefined();
    expect(leerDesde({ desde: "/postulante/perfil" })).toBeUndefined();
    expect(leerDesde({})).toBeUndefined();
  });

  it("links to a detail page remembering the list", () => {
    expect(conDesde("/admin/ofertas/1", "/admin/ofertas?estado=pendiente")).toBe(
      "/admin/ofertas/1?desde=%2Fadmin%2Fofertas%3Festado%3Dpendiente",
    );
  });

  it("searches ignoring accents and word order", () => {
    expect(coincideBusqueda("jose perez", ["José", "Pérez"])).toBe(true);
    expect(coincideBusqueda("maria", ["José"])).toBe(false);
    expect(coincideBusqueda(undefined, [])).toBe(true);
  });
});
