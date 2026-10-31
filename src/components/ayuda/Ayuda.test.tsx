import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { PREGUNTAS } from "./contenido";
import { PreguntasFrecuentes } from "./PreguntasFrecuentes";
import { SelectorPublico } from "./SelectorPublico";

afterEach(cleanup);

describe("SelectorPublico", () => {
  test("marks the chosen audience and keeps the choice in the URL", () => {
    render(<SelectorPublico elegido="empresa" />);

    const empresa = screen.getByRole("link", { name: /Tengo una empresa/ });
    expect(empresa.getAttribute("aria-current")).toBe("page");
    expect(empresa.getAttribute("href")).toBe("/ayuda?para=empresa");
    expect(screen.getByRole("link", { name: /Busco trabajo/ }).getAttribute("aria-current")).toBeNull();
  });
});

describe("PreguntasFrecuentes", () => {
  test("lists every question and opens an answer in place", () => {
    const preguntas = PREGUNTAS.postulante;
    render(<PreguntasFrecuentes preguntas={preguntas} />);

    expect(screen.getAllByRole("button")).toHaveLength(preguntas.length);
    fireEvent.click(screen.getByRole("button", { name: preguntas[0].pregunta }));
    expect(screen.getByText(preguntas[0].respuesta)).toBeDefined();
  });
});
