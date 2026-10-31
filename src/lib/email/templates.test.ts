import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  escaparHtml,
  plantillaCandidatoDerivadoEmpresa,
  plantillaDerivacionCurso,
  plantillaEmpresaAprobada,
  plantillaEmpresaRechazada,
  plantillaOfertaAprobadaEmpresa,
  plantillaPostulacionDerivadaPostulante,
  plantillaPreentrevista,
} from "./templates";

describe("Email templates", () => {
  it("escapes special HTML characters to prevent XSS", () => {
    const raw = '<script>alert("hack & run")</script>';
    const escaped = escaparHtml(raw);
    expect(escaped).toBe("&lt;script&gt;alert(&quot;hack &amp; run&quot;)&lt;/script&gt;");
  });

  it("generates offer approved email with correct subject and escaped title", () => {
    const { asunto, html } = plantillaOfertaAprobadaEmpresa({
      razonSocial: "Panadería & Café S.A.",
      tituloOferta: "Cajero <Turno Tarde>",
    });

    expect(asunto).toBe('Tu oferta laboral "Cajero <Turno Tarde>" fue aprobada - Portal de Empleo');
    expect(html).toContain("Panadería &amp; Café S.A.");
    expect(html).toContain("Cajero &lt;Turno Tarde&gt;");
    expect(html).toContain("Municipalidad de Funes");
  });

  it("generates candidate referred email for company", () => {
    const { asunto, html } = plantillaCandidatoDerivadoEmpresa({
      razonSocial: "Logística Funes",
      tituloOferta: "Chofer",
    });

    expect(asunto).toBe('Nuevo candidato derivado para "Chofer" - Portal de Empleo');
    expect(html).toContain("Logística Funes");
    expect(html).toContain("Revisar candidatos");
  });

  it("generates application referred email for applicant", () => {
    const { asunto, html } = plantillaPostulacionDerivadaPostulante({
      nombrePostulante: "María González",
      tituloOferta: "Administrativo",
    });

    expect(asunto).toBe('Novedades sobre tu postulación a "Administrativo" - Portal de Empleo');
    expect(html).toContain("María González");
    expect(html).toContain("derivada a la empresa");
  });

  it("generates pre-interview notification email with date and notes", () => {
    const { asunto, html } = plantillaPreentrevista({
      nombrePostulante: "Carlos Gómez",
      fechaHora: "Lunes 10 de Noviembre a las 10:00 hs",
      notas: "Traer DNI físico a la Oficina de Empleo",
    });

    expect(asunto).toContain("preentrevista");
    expect(html).toContain("Carlos Gómez");
    expect(html).toContain("Lunes 10 de Noviembre a las 10:00 hs");
    expect(html).toContain("Traer DNI físico");
  });

  it("generates course referral notification email", () => {
    const { asunto, html } = plantillaDerivacionCurso({
      nombrePostulante: "Ana López",
      nombreCurso: "Curso de Soldadura Básica",
      notas: "Inicio: 15 de Noviembre",
    });

    expect(asunto).toContain("Curso de Soldadura Básica");
    expect(html).toContain("Ana López");
    expect(html).toContain("Inicio: 15 de Noviembre");
  });

  it("generates company approved email with dashboard button", () => {
    const { asunto, html } = plantillaEmpresaAprobada({
      razonSocial: "Heladería & Café Funes",
    });

    expect(asunto).toBe("Tu empresa fue aprobada - Portal de Empleo de Funes");
    expect(html).toContain("Heladería &amp; Café Funes");
    expect(html).toContain("¡Tu cuenta de empresa está activa!");
    expect(html).toContain("Publicar una oferta");
  });

  it("generates company rejected email with observation reason", () => {
    const { asunto, html } = plantillaEmpresaRechazada({
      razonSocial: "Construcciones Sur",
      motivo: "El CUIT ingresado no coincide con la constancia de AFIP adjunta.",
    });

    expect(asunto).toBe("Observaciones sobre tu registro de empresa - Portal de Empleo de Funes");
    expect(html).toContain("Construcciones Sur");
    expect(html).toContain("El CUIT ingresado no coincide con la constancia de AFIP adjunta.");
    expect(html).toContain("Corregir mis datos");
  });
});
