import { describe, expect, it } from "vitest";

import type { OfertaOficina } from "@/lib/validation/oficina";

import { destinoEnCola } from "./ofertas";

function oferta(id: string, cambios: Partial<OfertaOficina> = {}): OfertaOficina {
  return {
    id,
    titulo: `Puesto ${id}`,
    descripcion: "Tareas de prueba",
    requisitos: "Requisitos de prueba",
    lugar: "Funes",
    jornada: "Lunes a viernes",
    sueldo: null,
    rubros: ["gastronomia"],
    estado: "pendiente",
    motivoRechazo: null,
    cierreSolicitado: false,
    creadaEl: "2026-10-01T10:00:00-03:00",
    publicadaEl: null,
    empresaId: "empresa-1",
    emailEmpresa: "empresa@example.com",
    empresa: null,
    cantidadPostulaciones: 0,
    ...cambios,
  };
}

const COLA = "/admin/ofertas/por-revisar";

describe("destinoEnCola", () => {
  const ofertas = [
    oferta("a", { creadaEl: "2026-10-01T10:00:00-03:00" }),
    oferta("b", { creadaEl: "2026-10-02T10:00:00-03:00" }),
    oferta("c", { creadaEl: "2026-10-03T10:00:00-03:00" }),
    oferta("publicada", { estado: "publicada" }),
  ];

  it("goes to the next offer of the queue, keeping where it came from", () => {
    expect(destinoEnCola(ofertas, "a", COLA)).toBe(`/admin/ofertas/b?desde=${encodeURIComponent(COLA)}`);
  });

  it("goes to the previous one when it was the last, and to the queue when it was the only one", () => {
    expect(destinoEnCola(ofertas, "c", COLA)).toBe(`/admin/ofertas/b?desde=${encodeURIComponent(COLA)}`);
    expect(destinoEnCola([oferta("a")], "a", COLA)).toBe(COLA);
  });

  it("uses the same filters the operator had in the queue", () => {
    const filtrada = `${COLA}?q=puesto%20c`;
    expect(destinoEnCola(ofertas, "a", filtrada)).toBe(filtrada);
  });

  it("stays on the page when it was not opened from a queue", () => {
    expect(destinoEnCola(ofertas, "a", undefined)).toBeUndefined();
    expect(destinoEnCola(ofertas, "a", "/admin/ofertas")).toBeUndefined();
  });
});
