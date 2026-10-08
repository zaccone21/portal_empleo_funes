import { describe, expect, it } from "vitest";
import { puedeTransicionarOferta } from "./estados";

describe("puedeTransicionarOferta", () => {
  it("permite transicionar de pendiente a publicada", () => {
    expect(puedeTransicionarOferta("pendiente", "publicada")).toBe(true);
  });

  it("permite transicionar de pendiente a rechazada", () => {
    expect(puedeTransicionarOferta("pendiente", "rechazada")).toBe(true);
  });

  it("no permite transicionar de pendiente a cerrada directo", () => {
    expect(puedeTransicionarOferta("pendiente", "cerrada")).toBe(false);
  });

  it("permite transicionar de publicada a cerrada", () => {
    expect(puedeTransicionarOferta("publicada", "cerrada")).toBe(true);
  });

  it("permite que una oferta rechazada vuelva a pendiente (edición)", () => {
    expect(puedeTransicionarOferta("rechazada", "pendiente")).toBe(true);
  });

  it("no permite reabrir una oferta cerrada", () => {
    expect(puedeTransicionarOferta("cerrada", "publicada")).toBe(false);
  });
});
