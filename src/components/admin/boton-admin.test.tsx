import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { BotonAdmin } from "./boton-admin";

afterEach(cleanup);

describe("BotonAdmin", () => {
  it("renders a native button when no render prop is passed", () => {
    render(<BotonAdmin>Acción</BotonAdmin>);
    const boton = screen.getByRole("button", { name: "Acción" });
    expect(boton).toBeDefined();
    expect(boton.tagName).toBe("BUTTON");
  });

  it("renders a link without throwing Base UI nativeButton errors when render is an anchor", () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <BotonAdmin render={<a href="https://ejemplo.com" />}>
        Enlace externo
      </BotonAdmin>
    );

    const enlace = screen.getByRole("button", { name: "Enlace externo" });
    expect(enlace).toBeDefined();
    expect(enlace.tagName).toBe("A");
    expect(enlace.getAttribute("href")).toBe("https://ejemplo.com");

    // Must not trigger Base UI warning about nativeButton
    expect(consoleErrorSpy).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});
