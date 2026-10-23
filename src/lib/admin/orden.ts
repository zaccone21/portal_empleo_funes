import { leerParam, type ParamsBusqueda } from "@/lib/admin/url";

/*
 * Sorting of the Office tables by a column (D-063). The order lives in the URL
 * (?orden=<column>&dir=asc|desc), like the filters, so it survives the back
 * arrow of a record's page. Sorting runs on the server, before paginating, so
 * it covers every row and not only the visible page.
 */

export type Direccion = "asc" | "desc";
export type OrdenTabla = { columna: string; direccion: Direccion };

/** The value a column sorts by. Null (a missing value) always goes last. */
export type ClavesOrden<T> = Record<string, (fila: T) => string | number | null>;

/** The order asked in the URL, or undefined when there is none or it names a column that cannot be sorted. */
export function leerOrden<T>(params: ParamsBusqueda, claves: ClavesOrden<T>): OrdenTabla | undefined {
  const columna = leerParam(params, "orden");
  if (!columna || !Object.hasOwn(claves, columna)) return undefined;
  return { columna, direccion: leerParam(params, "dir") === "desc" ? "desc" : "asc" };
}

const comparador = new Intl.Collator("es-AR", { sensitivity: "base", numeric: true });

/** A sorted copy of the rows; rows with the same value keep their incoming order. */
export function ordenarFilas<T>(filas: T[], claves: ClavesOrden<T>, orden: OrdenTabla): T[] {
  const clave = claves[orden.columna];
  const signo = orden.direccion === "asc" ? 1 : -1;
  return [...filas].sort((a, b) => {
    const va = clave(a);
    const vb = clave(b);
    if (va === null || vb === null) return va === vb ? 0 : va === null ? 1 : -1;
    const diferencia = typeof va === "number" && typeof vb === "number" ? va - vb : comparador.compare(String(va), String(vb));
    return diferencia * signo;
  });
}

/**
 * The rows in the order the URL asks for, or as they came when it asks for
 * none (each screen already brings them in its default order).
 */
export function aplicarOrden<T>(filas: T[], params: ParamsBusqueda, claves: ClavesOrden<T>): T[] {
  const orden = leerOrden(params, claves);
  return orden ? ordenarFilas(filas, claves, orden) : filas;
}
