import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import type { PostulanteEnBusqueda } from "@/hooks/useBusquedaPostulantes";

import { BusquedaPostulantes } from "./BusquedaPostulantes";

// The hook talks to the server and the router changes the URL: both are
// dependencies of the screen, so they are replaced with fakes.
const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  recargar: vi.fn(),
  hook: vi.fn(),
  estado: {
    datos: undefined as unknown,
    loading: false,
    error: null as string | null,
    sinAcceso: false,
  },
}));

vi.mock("@/hooks/useBusquedaPostulantes", () => ({
  useBusquedaPostulantes: (q: string, rubros: string[]) => {
    mocks.hook(q, rubros);
    return { ...mocks.estado, recargar: mocks.recargar };
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
  usePathname: () => "/admin/postulantes",
}));

beforeEach(() => {
  mocks.push.mockReset();
  mocks.recargar.mockReset();
  mocks.hook.mockReset();
  mocks.estado = { datos: undefined, loading: false, error: null, sinAcceso: false };
});

afterEach(cleanup);

const ana: PostulanteEnBusqueda = {
  id: "00000000-0000-4000-8000-000000000001",
  nombre: "Ana",
  apellido: "Ejemplo",
  telefono: "(341) 555-0101",
  dni: "30111222",
  email: "ana@ejemplo.com",
  rubros: ["gastronomia", "limpieza"],
  cvSubidoEl: "2026-09-25T10:00:00-03:00",
};

const sinPerfil: PostulanteEnBusqueda = {
  id: "00000000-0000-4000-8000-000000000002",
  nombre: null,
  apellido: null,
  telefono: null,
  dni: null,
  email: "nuevo@ejemplo.com",
  rubros: [],
  cvSubidoEl: null,
};

const vacios = { q: "", rubros: [] };

test("asks the hook for the filters of the URL", () => {
  mocks.estado.datos = [ana];

  render(<BusquedaPostulantes filtros={{ q: "ejemplo", rubros: ["limpieza"] }} />);

  expect(mocks.hook).toHaveBeenCalledWith("ejemplo", ["limpieza"]);
});

test("while loading, announces it and shows no results", () => {
  mocks.estado.loading = true;

  render(<BusquedaPostulantes filtros={vacios} />);

  expect(screen.getByRole("status").textContent).toBe("Buscando postulantes…");
  expect(screen.queryByText(/Hay \d+ postulante/)).toBeNull();
});

test("shows each person with their data, contact links, trades and CV (RF1.5.7)", () => {
  mocks.estado.datos = [ana, sinPerfil];

  render(<BusquedaPostulantes filtros={vacios} />);

  const tarjetas = screen.getByRole("list", { name: "Hay 2 postulantes registrados." });
  const deAna = within(tarjetas).getAllByRole("listitem")[0];
  expect(within(deAna).getByRole("heading", { level: 2 }).textContent).toBe("Ana Ejemplo");
  expect(within(deAna).getByText("DNI 30111222")).toBeDefined();
  expect(within(deAna).getByRole("link", { name: "ana@ejemplo.com" }).getAttribute("href")).toBe("mailto:ana@ejemplo.com");
  expect(within(deAna).getByRole("link", { name: "(341) 555-0101" }).getAttribute("href")).toBe("tel:3415550101");
  expect(within(deAna).getByText("Gastronomía")).toBeDefined();
  expect(within(deAna).getByText("Limpieza")).toBeDefined();
  expect(within(deAna).getByText("CV cargado")).toBeDefined();
});

test("a person who did not fill the profile is still listed, by email, and says what is missing", () => {
  mocks.estado.datos = [sinPerfil];

  render(<BusquedaPostulantes filtros={vacios} />);

  const tarjeta = within(screen.getByRole("list", { name: "Hay 1 postulante registrado." })).getByRole("listitem");
  expect(within(tarjeta).getByText("Todavía no cargó su nombre")).toBeDefined();
  expect(within(tarjeta).getByRole("link", { name: "nuevo@ejemplo.com" })).toBeDefined();
  expect(within(tarjeta).getByText("Todavía no eligió rubros")).toBeDefined();
  expect(within(tarjeta).getByText("Sin CV")).toBeDefined();
});

test("the table has a column per thing the Office looks for", () => {
  mocks.estado.datos = [ana];

  render(<BusquedaPostulantes filtros={vacios} />);

  const tabla = screen.getByRole("table", { hidden: true, name: "Hay 1 postulante registrado." });
  const columnas = within(tabla)
    .getAllByRole("columnheader", { hidden: true })
    .map((columna) => columna.textContent);
  expect(columnas).toEqual(["Postulante", "Contacto", "Rubros", "CV"]);
});

test("counts the results, the ones with a CV and the ones without", () => {
  mocks.estado.datos = [ana, sinPerfil, { ...ana, id: "00000000-0000-4000-8000-000000000003" }];

  render(<BusquedaPostulantes filtros={vacios} />);

  const cifras = screen.getAllByRole("definition").map((cifra) => cifra.textContent);
  expect(cifras).toEqual(["3", "2", "1"]);
});

test("the filters are in the URL: a trade chip toggles it and keeps the text", () => {
  mocks.estado.datos = [ana];

  render(<BusquedaPostulantes filtros={{ q: "ana", rubros: ["limpieza"] }} />);

  const limpieza = screen.getByRole("link", { name: "Limpieza", current: true });
  expect(limpieza.getAttribute("href")).toBe("/admin/postulantes?q=ana");
  expect(screen.getByRole("link", { name: "Gastronomía" }).getAttribute("href")).toBe(
    "/admin/postulantes?q=ana&rubro=gastronomia&rubro=limpieza",
  );
  expect(screen.getByRole("link", { name: "Todos" }).getAttribute("href")).toBe("/admin/postulantes?q=ana");
});

test("with no trade chosen, 'Todos' is the current one and there is nothing to clear", () => {
  mocks.estado.datos = [ana];

  render(<BusquedaPostulantes filtros={vacios} />);

  expect(screen.getByRole("link", { name: "Todos", current: true })).toBeDefined();
  expect(screen.queryByRole("link", { name: "Limpiar filtros" })).toBeNull();
});

test("searching changes the URL, keeping the trades", () => {
  mocks.estado.datos = [ana];

  render(<BusquedaPostulantes filtros={{ q: "", rubros: ["limpieza"] }} />);

  fireEvent.change(screen.getByLabelText("Buscá por nombre, apellido o DNI"), { target: { value: "  perez " } });
  fireEvent.click(screen.getByRole("button", { name: "Buscar" }));

  expect(mocks.push).toHaveBeenCalledWith("/admin/postulantes?q=perez&rubro=limpieza", { scroll: false });
});

test("when nothing matches, says so and offers the whole register", () => {
  mocks.estado.datos = [];

  render(<BusquedaPostulantes filtros={{ q: "astronauta", rubros: [] }} />);

  expect(screen.getByText("No encontramos postulantes con esa búsqueda")).toBeDefined();
  const todos = screen.getAllByRole("link", { name: "Ver todos los postulantes" });
  expect(todos[0].getAttribute("href")).toBe("/admin/postulantes");
  expect(screen.getByRole("link", { name: "Limpiar filtros" })).toBeDefined();
});

test("an empty register explains when people will appear, without a button", () => {
  mocks.estado.datos = [];

  render(<BusquedaPostulantes filtros={vacios} />);

  expect(screen.getByText("Todavía no hay postulantes")).toBeDefined();
  expect(screen.queryByRole("link", { name: "Ver todos los postulantes" })).toBeNull();
});

test("on error, says what failed and offers to try again", () => {
  mocks.estado.error = "Falló la conexión.";

  render(<BusquedaPostulantes filtros={vacios} />);

  expect(screen.getByText("No pudimos cargar los postulantes")).toBeDefined();
  expect(screen.getByText("Falló la conexión.")).toBeDefined();
  fireEvent.click(screen.getByRole("button", { name: "Probar de nuevo" }));
  expect(mocks.recargar).toHaveBeenCalledTimes(1);
});

test("without access, asks to log in as the Office instead of showing an empty screen", () => {
  mocks.estado.sinAcceso = true;

  render(<BusquedaPostulantes filtros={vacios} />);

  expect(screen.getByText("Ingresá con tu cuenta de la Oficina")).toBeDefined();
  expect(screen.getByRole("link", { name: "Ingresar" }).getAttribute("href")).toBe(
    "/admin/ingresar?volver=%2Fadmin%2Fpostulantes",
  );
  expect(screen.queryByRole("search")).toBeNull();
});
