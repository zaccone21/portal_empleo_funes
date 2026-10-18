/*
 * Reading and building the URL state of the Office screens (D-037): filters,
 * search, page, tab and selection (?sel=<id>) live in the URL, so a screen can
 * be shared, refreshed and reached with the back button.
 */

export type ParamsBusqueda = Record<string, string | string[] | undefined>;

/** First value of a query parameter, or undefined when missing or empty. */
export function leerParam(params: ParamsBusqueda, clave: string): string | undefined {
  const valor = params[clave];
  const texto = Array.isArray(valor) ? valor[0] : valor;
  return texto ? texto : undefined;
}

/** Comma-separated list parameter (`?rubros=a,b`) as an array. */
export function leerLista(params: ParamsBusqueda, clave: string): string[] {
  return (leerParam(params, clave) ?? "").split(",").filter(Boolean);
}

/**
 * The same URL with some parameters changed. A value of undefined removes the
 * parameter. Changing a filter, the search or the tab goes back to page 1 and
 * closes the panel unless the caller sets those explicitly.
 */
export function urlCon(ruta: string, params: ParamsBusqueda, cambios: Record<string, string | undefined>): string {
  const nuevo = new URLSearchParams();
  for (const [clave, valor] of Object.entries(params)) {
    const texto = Array.isArray(valor) ? valor[0] : valor;
    if (texto) nuevo.set(clave, texto);
  }
  for (const [clave, valor] of Object.entries(cambios)) {
    if (valor === undefined || valor === "") nuevo.delete(clave);
    else nuevo.set(clave, valor);
  }
  const query = nuevo.toString();
  return query ? `${ruta}?${query}` : ruta;
}

/** Rows shown per page in every register (the pager says so). */
export const FILAS_POR_PAGINA = 50;

/** One page of a list, with the numbers the pager shows ("1–8 de 8"). */
export function paginar<T>(items: T[], pagina: number, limite: number = FILAS_POR_PAGINA) {
  const total = items.length;
  const paginas = Math.max(1, Math.ceil(total / limite));
  const actual = Math.min(Math.max(1, Math.floor(pagina) || 1), paginas);
  const inicio = (actual - 1) * limite;
  const filas = items.slice(inicio, inicio + limite);
  return { filas, total, pagina: actual, paginas, desde: total === 0 ? 0 : inicio + 1, hasta: inicio + filas.length };
}

/** Id of the row to select after resolving `id` in a queue: the next one, or the previous when it was the last. */
export function siguienteId(ids: string[], id: string): string | undefined {
  const indice = ids.indexOf(id);
  if (indice === -1) return undefined;
  return ids[indice + 1] ?? ids[indice - 1];
}

/** Lower-cases and strips accents, so searching "jose" finds "José". */
export function normalizarTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/** True when every word of `busqueda` appears somewhere in `campos`. */
export function coincideBusqueda(busqueda: string | undefined, campos: Array<string | null | undefined>): boolean {
  if (!busqueda) return true;
  const pajar = normalizarTexto(campos.filter(Boolean).join(" "));
  return normalizarTexto(busqueda)
    .split(/\s+/)
    .filter(Boolean)
    .every((palabra) => pajar.includes(palabra));
}
