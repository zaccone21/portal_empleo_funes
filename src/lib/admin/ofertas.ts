import { coincideBusqueda, type ParamsBusqueda, leerParam } from "@/lib/admin/url";
import { diasDesde } from "@/lib/admin/fechas";
import type { OfertaOficina } from "@/lib/validation/oficina";
import type { EstadoOferta } from "@/lib/validation/ofertas";

/*
 * Filtering and ordering of offers for the Office screens (D-042). Pure
 * functions, so they are easy to test. The screens read their state from the URL.
 */

export type ModoOfertas = "registro" | "por-revisar" | "cierres";

export const OPCIONES_FECHA = [
  { valor: "hoy", etiqueta: "Hoy" },
  { valor: "7d", etiqueta: "Últimos 7 días" },
  { valor: "30d", etiqueta: "Últimos 30 días" },
];

const LIMITE_FECHA: Record<string, number> = { hoy: 0, "7d": 7, "30d": 30 };

/** Offers a mode shows before the user's filters: the queues are fixed subsets. */
export function ofertasDelModo(ofertas: OfertaOficina[], modo: ModoOfertas): OfertaOficina[] {
  if (modo === "por-revisar") return ofertas.filter((o) => o.estado === "pendiente");
  if (modo === "cierres") return ofertas.filter((o) => o.estado === "publicada" && o.cierreSolicitado);
  return ofertas;
}

/** Applies search, company, trade, date and (in the register) status filters from the URL. */
export function filtrarOfertas(
  ofertas: OfertaOficina[],
  params: ParamsBusqueda,
  modo: ModoOfertas,
  ahora: Date = new Date(),
): OfertaOficina[] {
  const q = leerParam(params, "q");
  const empresa = leerParam(params, "empresa");
  const rubro = leerParam(params, "rubro");
  const fecha = leerParam(params, "fecha");
  const estado = modo === "registro" ? leerParam(params, "estado") : undefined;
  const limite = fecha ? LIMITE_FECHA[fecha] : undefined;

  const filtradas = ofertas.filter(
    (o) =>
      (!estado || o.estado === (estado as EstadoOferta)) &&
      (!empresa || o.empresaId === empresa) &&
      (!rubro || o.rubros.includes(rubro as OfertaOficina["rubros"][number])) &&
      (limite === undefined || diasDesde(o.creadaEl, ahora) <= limite) &&
      coincideBusqueda(q, [o.titulo, o.empresa?.razonSocial]),
  );

  // Queues: the oldest first, so nothing waits forever. Register: the newest first.
  return [...filtradas].sort((a, b) => (modo === "registro" ? b.creadaEl.localeCompare(a.creadaEl) : a.creadaEl.localeCompare(b.creadaEl)));
}

/** Companies that appear in the offers, for the "Empresa" filter. */
export function empresasDeOfertas(ofertas: OfertaOficina[]): Array<{ valor: string; etiqueta: string }> {
  const vistas = new Map<string, string>();
  for (const o of ofertas) vistas.set(o.empresaId, o.empresa?.razonSocial ?? "Sin nombre");
  return [...vistas.entries()].map(([valor, etiqueta]) => ({ valor, etiqueta })).sort((a, b) => a.etiqueta.localeCompare(b.etiqueta, "es"));
}

/** Count of offers per status, for the strip (it ignores the other filters on purpose). */
export function contarPorEstado(ofertas: OfertaOficina[]): Record<EstadoOferta | "todas", number> {
  const conteo = { todas: ofertas.length, pendiente: 0, publicada: 0, rechazada: 0, cerrada: 0 };
  for (const o of ofertas) conteo[o.estado] += 1;
  return conteo;
}
