import type { EstadoEmpresa } from "@/lib/validation/empresa";

/**
 * Cómo se muestra el estado de una empresa en la Oficina de Empleo (D-068).
 * Una empresa nueva queda "pendiente" y solo puede mandar ofertas cuando la
 * Oficina la aprueba.
 */
export const ESTADOS_EMPRESA: Record<
  EstadoEmpresa,
  { etiqueta: string; tono: "neutral" | "attention" | "success" | "danger"; descripcion: string }
> = {
  pendiente: {
    etiqueta: "Por aprobar",
    tono: "attention",
    descripcion: "Espera la revisión de la Oficina. Todavía no puede mandar ofertas.",
  },
  aprobada: {
    etiqueta: "Aprobada",
    tono: "success",
    descripcion: "Puede mandar ofertas.",
  },
  rechazada: {
    etiqueta: "Rechazada",
    tono: "danger",
    descripcion: "La Oficina no la aprobó. La empresa ve el motivo y puede corregir sus datos.",
  },
};
