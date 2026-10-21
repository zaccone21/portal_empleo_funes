import { describe, expect, test } from "vitest";

import { itemsNavegacion } from "./itemsNavegacion";

function textos(items: { texto: string }[]) {
  return items.map((item) => item.texto);
}

const empresa = { rol: "empresa" as const, email: "empresa@ejemplo.com" };
const postulante = { rol: "postulante" as const, email: "postulante@ejemplo.com" };
const oficina = { rol: "admin" as const, email: "oficina@ejemplo.com" };

describe("itemsNavegacion", () => {
  test("shows nothing while the session loads, so no wrong menu flashes", () => {
    expect(itemsNavegacion(undefined, "postulante", true)).toEqual([]);
  });

  test("a logged-in person gets their role's menu wherever they are, with the profile and help on desktop", () => {
    expect(textos(itemsNavegacion(empresa, "postulante", false))).toEqual([
      "Inicio",
      "Mis ofertas",
      "Publicar",
      "Mi empresa",
      "Ayuda",
    ]);
    expect(textos(itemsNavegacion(postulante, "postulante", false))).toEqual([
      "Inicio",
      "Ofertas",
      "Postulaciones",
      "Mi perfil",
      "Ayuda",
    ]);
  });

  test("the phone bar keeps four items for each role", () => {
    expect(textos(itemsNavegacion(postulante, "postulante", true))).toEqual([
      "Ofertas",
      "Postulaciones",
      "Mi perfil",
      "Ayuda",
    ]);
    expect(textos(itemsNavegacion(empresa, "empresa", true))).toEqual(["Inicio", "Mis ofertas", "Publicar", "Mi empresa"]);
  });

  test("the company's main action stands out", () => {
    expect(itemsNavegacion(empresa, "empresa", true).find((item) => item.destacado)?.texto).toBe("Publicar");
  });

  test("without a session, phones also get the way in (the bottom bar is their only menu)", () => {
    expect(textos(itemsNavegacion(null, "postulante", true))).toEqual(["Ofertas", "Ingresar", "Crear cuenta", "Ayuda"]);
    expect(textos(itemsNavegacion(null, "postulante", false))).toEqual(["Inicio", "Ofertas", "Para empresas", "Ayuda"]);
    expect(textos(itemsNavegacion(null, "empresa", true))).toEqual(["Ingresar", "Registrarse", "Ayuda"]);
  });

  test("the Office has no self-registration (RF1.1.4) and no help guides", () => {
    expect(textos(itemsNavegacion(null, "admin", true))).toEqual(["Ingresar"]);
    expect(textos(itemsNavegacion(oficina, "postulante", false))).toEqual(["Panel"]);
  });
});
