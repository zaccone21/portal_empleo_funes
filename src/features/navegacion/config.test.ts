import { describe, expect, it } from "vitest";

import { etiquetaVolver } from "./config";

describe("etiquetaVolver", () => {
  it("names the menu item the arrow goes back to, ignoring the filters", () => {
    expect(etiquetaVolver("/admin/ofertas/por-revisar?q=mozo")).toBe("Volver a Ofertas por revisar");
    expect(etiquetaVolver("/admin/postulantes")).toBe("Volver a Postulantes");
    expect(etiquetaVolver("/admin")).toBe("Volver al Dashboard");
  });

  it("names the record page it goes back to", () => {
    expect(etiquetaVolver("/admin/postulaciones/abc?desde=%2Fadmin")).toBe("Volver a la evaluación");
    expect(etiquetaVolver("/admin/empresas/abc")).toBe("Volver a la empresa");
    expect(etiquetaVolver("/admin/ofertas/abc")).toBe("Volver a la oferta");
    expect(etiquetaVolver("/admin/postulantes/abc")).toBe("Volver al postulante");
  });
});
