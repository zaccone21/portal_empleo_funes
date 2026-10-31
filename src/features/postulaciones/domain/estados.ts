import type { DecisionEmpresa } from "@/lib/validation/candidatos";
import type { EstadoPostulacion } from "@/lib/validation/postulaciones";

/**
 * The company's answer about a referred application (D-044), as the Office
 * sees it. "Sin respuesta" is a referral the company has not answered yet:
 * the Office follows it up (D-054).
 */
export const DECISIONES_EMPRESA: Record<DecisionEmpresa | "sin_respuesta", {
  etiqueta: string;
  tono: "neutral" | "attention" | "success" | "danger";
}> = {
  contratado: { etiqueta: "Contratado", tono: "success" },
  no_contratado: { etiqueta: "No contratado", tono: "danger" },
  sin_respuesta: { etiqueta: "Sin respuesta de la empresa", tono: "attention" },
};

/** Acciones posibles sobre una postulación desde la Oficina de Empleo */
export type AccionPostulacion = "preseleccionar" | "derivar" | "descartar" | "ver";

export const ESTADOS_POSTULACION: Record<EstadoPostulacion, {
  etiqueta: string;
  tono: "neutral" | "attention" | "success" | "danger";
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
    tono: "success",
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
