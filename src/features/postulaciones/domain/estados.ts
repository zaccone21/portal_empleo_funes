import type { EstadoPostulacion } from "@/lib/validation/postulaciones";

/** Acciones posibles sobre una postulación desde la Oficina de Empleo */
export type AccionPostulacion = "preseleccionar" | "derivar" | "descartar" | "ver";

export const ESTADOS_POSTULACION: Record<EstadoPostulacion, {
  etiqueta: string;
  tono: "neutral" | "warning" | "success" | "danger";
  descripcion: string;
  acciones: AccionPostulacion[];
}> = {
  postulado: {
    etiqueta: "Postulado",
    tono: "neutral",
    descripcion: "Aplicación recibida, pendiente de evaluar",
    acciones: ["preseleccionar", "descartar", "ver"],
  },
  preseleccionado: {
    etiqueta: "Pre-seleccionado",
    tono: "warning",
    descripcion: "Perfil compatible, en proceso de contacto/evaluación",
    acciones: ["derivar", "descartar", "ver"],
  },
  derivado: {
    etiqueta: "Derivado",
    tono: "success",
    descripcion: "Candidato apto, derivado a la empresa",
    acciones: ["ver"], // Podría volverse atrás o registrar algo más si hubiera más flujo
  },
  no_apto: {
    etiqueta: "No apto",
    tono: "danger",
    descripcion: "El perfil no encajó para este puesto",
    acciones: ["ver"],
  },
};

/**
 * Transiciones válidas de un estado a otro.
 * Flujo adaptado a los estados reales: postulado -> preseleccionado -> derivado.
 * Se puede ir a no_apto desde postulado y desde preseleccionado.
 */
export const TRANSICIONES_POSTULACION: Record<EstadoPostulacion, EstadoPostulacion[]> = {
  postulado: ["preseleccionado", "no_apto"],
  preseleccionado: ["derivado", "no_apto"],
  derivado: [],
  no_apto: [],
};

/**
 * Verifica si es posible transicionar una postulación del estado actual a un nuevo estado.
 */
export function puedeTransicionarPostulacion(desde: EstadoPostulacion, hacia: EstadoPostulacion): boolean {
  return TRANSICIONES_POSTULACION[desde].includes(hacia);
}
