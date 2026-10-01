import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";

import { FormularioCv } from "./FormularioCv";

afterEach(cleanup);

function renderFormulario(onSubir = vi.fn().mockResolvedValue(true)) {
  render(<FormularioCv tieneCv={false} onSubir={onSubir} subiendo={false} error={null} />);
  return onSubir;
}

function elegir(archivo: File) {
  fireEvent.change(screen.getByLabelText(/Elegí tu CV en PDF/), { target: { files: [archivo] } });
}

test("asks to choose a file before uploading", () => {
  const onSubir = renderFormulario();

  fireEvent.click(screen.getByRole("button", { name: "Subir CV" }));

  expect(screen.getByText("Elegí un archivo PDF.")).toBeDefined();
  expect(onSubir).not.toHaveBeenCalled();
});

test("rejects a file that is not a PDF as soon as it is chosen", async () => {
  const onSubir = renderFormulario();

  elegir(new File(["foto"], "foto.jpg", { type: "image/jpeg" }));

  expect(await screen.findByText("Tiene que ser un archivo PDF.")).toBeDefined();
  fireEvent.click(screen.getByRole("button", { name: "Subir CV" }));
  expect(onSubir).not.toHaveBeenCalled();
});

test("uploads a valid PDF", async () => {
  const onSubir = renderFormulario();
  const pdf = new File(["%PDF-1.7 contenido"], "mi-cv.pdf", { type: "application/pdf" });

  elegir(pdf);
  expect(await screen.findByText("mi-cv.pdf")).toBeDefined();
  fireEvent.click(screen.getByRole("button", { name: "Subir CV" }));

  await waitFor(() => expect(onSubir).toHaveBeenCalledWith(pdf));
});

test("talks about replacing when there is a CV already", () => {
  render(<FormularioCv tieneCv onSubir={vi.fn()} subiendo={false} error={null} />);

  expect(screen.getByRole("heading", { name: "Reemplazar tu CV" })).toBeDefined();
  expect(screen.getByRole("button", { name: "Reemplazar CV" })).toBeDefined();
});
