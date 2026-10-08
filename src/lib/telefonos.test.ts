import { describe, it, expect } from "vitest";
import { normalizarTelefonoAR, formatearTelefonoAR, enlaceWhatsApp, enlaceLlamada } from "./telefonos";

describe("telefonos", () => {
  describe("normalizarTelefonoAR", () => {
    it("debería normalizar varios formatos al número de 10 dígitos", () => {
      expect(normalizarTelefonoAR("341 271 9319")).toBe("3412719319");
      expect(normalizarTelefonoAR("+543412719319")).toBe("3412719319");
      expect(normalizarTelefonoAR("+5493412719319")).toBe("3412719319");
      expect(normalizarTelefonoAR("0341 271-9319")).toBe("3412719319");
    });
    
    it("debería devolver null para números inválidos", () => {
      expect(normalizarTelefonoAR("12345")).toBeNull();
      expect(normalizarTelefonoAR("")).toBeNull();
      expect(normalizarTelefonoAR(null)).toBeNull();
      expect(normalizarTelefonoAR(undefined)).toBeNull();
    });
  });

  describe("enlaceWhatsApp", () => {
    it("debería generar enlace wa.me correcto", () => {
      expect(enlaceWhatsApp("341 271 9319")).toBe("https://wa.me/5493412719319");
      expect(enlaceWhatsApp("+543412719319")).toBe("https://wa.me/5493412719319");
      expect(enlaceWhatsApp("+5493412719319")).toBe("https://wa.me/5493412719319");
      expect(enlaceWhatsApp("0341 271-9319")).toBe("https://wa.me/5493412719319");
    });

    it("debería devolver null para números inválidos", () => {
      expect(enlaceWhatsApp("12345")).toBeNull();
    });
  });

  describe("formatearTelefonoAR", () => {
    it("debería formatear correctamente un número válido", () => {
      expect(formatearTelefonoAR("+5493412719319")).toBe("341 271 9319");
    });

    it("debería devolver el crudo si es inválido", () => {
      expect(formatearTelefonoAR("12345")).toBe("12345");
    });
  });
  
  describe("enlaceLlamada", () => {
    it("debería armar tel: con +54 para normalizables", () => {
      expect(enlaceLlamada("0341 271-9319")).toBe("tel:+543412719319");
    });
    
    it("debería armar tel: básico para crudos", () => {
      expect(enlaceLlamada("123456")).toBe("tel:123456");
    });
  });
});
