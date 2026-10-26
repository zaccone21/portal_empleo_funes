import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";

import { ConfirmDialog } from "./confirm-dialog";

const MOTIVOS = [
  { codigo: "datos_incompletos", etiqueta: "Faltan datos de la empresa" },
  { codigo: "otro", etiqueta: "Otro motivo" },
];

afterEach(cleanup);

function abrir(onConfirmar = vi.fn().mockResolvedValue(undefined)) {
  render(
    <ConfirmDialog
      trigger={<button type="button">Rechazar</button>}
      titulo="¿Rechazar esta empresa?"
      descripcion="Elegí el motivo."
      textoConfirmar="Rechazar empresa"
      motivos={MOTIVOS}
      onConfirmar={onConfirmar}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Rechazar" }));
  return onConfirmar;
}

test("lists the fixed reasons and keeps the confirm button off until one is picked (D-069)", async () => {
  abrir();

  const confirmar = await screen.findByRole("button", { name: "Rechazar empresa" });
  expect(screen.getAllByRole("radio")).toHaveLength(2);
  expect(confirmar).toHaveProperty("disabled", true);

  fireEvent.click(screen.getByRole("radio", { name: "Faltan datos de la empresa" }));
  expect(confirmar).toHaveProperty("disabled", false);
});

test("sends the chosen reason with the optional note", async () => {
  const onConfirmar = abrir();

  fireEvent.click(await screen.findByRole("radio", { name: "Otro motivo" }));
  fireEvent.change(screen.getByLabelText("Observación (opcional)"), { target: { value: "Revisá el CUIT" } });
  fireEvent.click(screen.getByRole("button", { name: "Rechazar empresa" }));

  await waitFor(() => expect(onConfirmar).toHaveBeenCalledWith({ codigo: "otro", observacion: "Revisá el CUIT" }));
});

test("the note is not required", async () => {
  const onConfirmar = abrir();

  fireEvent.click(await screen.findByRole("radio", { name: "Faltan datos de la empresa" }));
  fireEvent.click(screen.getByRole("button", { name: "Rechazar empresa" }));

  await waitFor(() => expect(onConfirmar).toHaveBeenCalledWith({ codigo: "datos_incompletos", observacion: "" }));
});
