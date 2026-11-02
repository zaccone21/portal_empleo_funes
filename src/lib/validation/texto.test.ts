import { describe, expect, it } from "vitest";

import { esRutaInterna } from "@/lib/rutas";
import { limpiarFiltroPostgrest } from "@/lib/validation/texto";

describe("limpiarFiltroPostgrest", () => {
  it("strips PostgREST filter syntax characters and collapses whitespace", () => {
    expect(limpiarFiltroPostgrest("  soldador,id.neq.0000(admin)%*'\"\\  ")).toBe("soldador id neq 0000 admin");
  });

  it("returns empty string for undefined, empty or only-punctuation inputs", () => {
    expect(limpiarFiltroPostgrest(undefined)).toBe("");
    expect(limpiarFiltroPostgrest("   ")).toBe("");
    expect(limpiarFiltroPostgrest(",().*%\\'\"")).toBe("");
  });

  it("caps the output length at 100 characters", () => {
    const largo = "a".repeat(150);
    expect(limpiarFiltroPostgrest(largo)).toHaveLength(100);
  });
});

describe("esRutaInterna", () => {
  it("accepts internal paths starting with a single slash", () => {
    expect(esRutaInterna("/ofertas")).toBe(true);
    expect(esRutaInterna("/empresa/ofertas?id=1")).toBe(true);
  });

  it("rejects protocol-relative URLs, backslash URLs, and external URLs", () => {
    expect(esRutaInterna("//evil.com")).toBe(false);
    expect(esRutaInterna("/\\evil.com")).toBe(false);
    expect(esRutaInterna("https://evil.com")).toBe(false);
    expect(esRutaInterna(undefined)).toBe(false);
  });
});
