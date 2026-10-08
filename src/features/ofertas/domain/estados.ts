import type { EstadoOferta } from "@/lib/validation/ofertas";

/** Acciones posibles sobre una oferta desde la Oficina de Empleo */
export type AccionOferta = "aprobar" | "rechazar" | "cerrar" | "ver";

export const ESTADOS_OFERTA: Record<EstadoOferta, {
  etiqueta: string;
  tono: "neutral" | "warning" | "success" | "danger";
  descripcion: string;
  acciones: AccionOferta[];
}> = {
  pendiente: {
    etiqueta: "Pendiente",
    tono: "warning",
    descripcion: "Esperando revisión de la Oficina",
    acciones: ["aprobar", "rechazar", "ver"],
  },
  publicada: {
    etiqueta: "Publicada",
    tono: "success",
    descripcion: "Visible para los postulantes",
    acciones: ["cerrar", "ver"],
  },
  rechazada: {
    etiqueta: "Rechazada",
    tono: "danger",
    descripcion: "No cumple los requisitos y fue devuelta a la empresa",
    acciones: ["ver"],
  },
  cerrada: {
    etiqueta: "Cerrada",
    tono: "neutral",
    descripcion: "La búsqueda finalizó",
    acciones: ["ver"],
  },
};

/**
 * Transiciones válidas de un estado a otro en la máquina de estados de ofertas.
 * Clave: estado actual, Valor: lista de estados a los que puede pasar.
 */
export const TRANSICIONES_OFERTA: Record<EstadoOferta, EstadoOferta[]> = {
  pendiente: ["publicada", "rechazada"],
  publicada: ["cerrada"],
  rechazada: ["pendiente"], // Según Q-002, editar una rechazada la vuelve a pendiente
  cerrada: [],
};

/**
 * Verifica si es posible transicionar una oferta del estado actual a un nuevo estado.
 */
export function puedeTransicionarOferta(desde: EstadoOferta, hacia: EstadoOferta): boolean {
  return TRANSICIONES_OFERTA[desde].includes(hacia);
}
