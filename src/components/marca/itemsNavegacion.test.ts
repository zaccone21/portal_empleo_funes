import { describe, expect, test } from "vitest";

import { itemsNavegacion } from "./itemsNavegacion";

function textos(items: { texto: string }[]) {
  return items.map((item) => item.texto);
}

describe("itemsNavegacion", () => {
  test("shows nothing while the session loads, so no wrong menu flashes", () => {
    expect(itemsNavegacion(undefined, "postulante", true)).toEqual([]);
  });

  test("a logged-in person gets their role's menu wherever they are", () => {
    const empresa = { rol: "empresa" as const, email: "empresa@ejemplo.com" };

    expect(textos(itemsNavegacion(empresa, "postulante", true))).toEqual([
      "Inicio",
      "Mis ofertas",
      "Publicar",
      "Empresa",
    ]);
  });

  test("the company's main action stands out", () => {
    const empresa = { rol: "empresa" as const, email: "empresa@ejemplo.com" };

    expect(itemsNavegacion(empresa, "empresa", true).find((item) => item.destacado)?.texto).toBe("Publicar");
  });

  test("without a session, phones also get the way in (the bottom bar is their only menu)", () => {
    expect(textos(itemsNavegacion(null, "postulante", true))).toEqual(["Ofertas", "Ingresar", "Crear cuenta"]);
    expect(textos(itemsNavegacion(null, "postulante", false))).toEqual(["Ofertas"]);
  });

  test("the Office has no self-registration (RF1.1.4)", () => {
    expect(textos(itemsNavegacion(null, "admin", true))).toEqual(["Ingresar"]);
  });
});
