import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { AdminTable, type ColumnaAdmin } from "./admin-table";

const mocks = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
}));

vi.mock("@/hooks/useUrlAdmin", () => ({
  useUrlAdmin: () => ({ construir: () => "/admin" }),
}));

type Fila = { id: string; nombre: string };

const columnas: ColumnaAdmin<Fila>[] = [
  { id: "nombre", cabecera: "Nombre", celda: (f) => f.nombre },
  { id: "ver", cabecera: "", celda: (f) => <a href={`/detalle/${f.id}`}>Ver</a> },
];

const PAGER = { desde: 1, hasta: 1, total: 1, pagina: 1, paginas: 1 };
const VACIO = { titulo: "Nada", descripcion: "Nada" };

beforeEach(() => {
  mocks.push.mockReset();
});

afterEach(cleanup);

function renderTabla(hrefFila?: (f: Fila) => string) {
  render(
    <AdminTable
      columnas={columnas}
      filas={[{ id: "p-1", nombre: "Ana" }]}
      idDe={(f) => f.id}
      hrefFila={hrefFila}
      pager={PAGER}
      vacio={VACIO}
      etiquetaFila={(f) => f.nombre}
    />,
  );
}

// D-062: there is no side panel any more, so a row without a page to open does nothing.
test("without hrefFila, a row is not interactive", () => {
  renderTabla();
  const fila = screen.getByRole("row", { name: "Ana" });
  fireEvent.click(screen.getByText("Ana"));

  expect(fila.getAttribute("tabindex")).toBeNull();
  expect(mocks.push).not.toHaveBeenCalled();
});

test("with hrefFila, clicking a row or pressing Enter on it opens the page", () => {
  renderTabla((f) => `/admin/postulaciones/${f.id}`);

  fireEvent.click(screen.getByText("Ana"));
  fireEvent.keyDown(screen.getByRole("row", { name: "Ana" }), { key: "Enter" });

  expect(mocks.push).toHaveBeenCalledTimes(2);
  expect(mocks.push).toHaveBeenCalledWith("/admin/postulaciones/p-1");
});

test("with hrefFila, a link inside the row is left to do its own navigation", () => {
  renderTabla((f) => `/admin/postulaciones/${f.id}`);
  fireEvent.click(screen.getByRole("link", { name: "Ver" }));

  expect(mocks.push).not.toHaveBeenCalled();
});
