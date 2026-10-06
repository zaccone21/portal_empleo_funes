import { useDatos } from "@/hooks/useDatos";
import { z } from "zod";

const busquedaPostulanteSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string().nullable(),
  apellido: z.string().nullable(),
  telefono: z.string().nullable().optional(),
  dni: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  rubros: z.array(z.string()),
  cvSubidoEl: z.string().nullable(),
});

const listaBusquedaPostulantesSchema = z.array(busquedaPostulanteSchema);

export type PostulanteEnBusqueda = z.infer<typeof busquedaPostulanteSchema>;

/**
 * Applicants of the register for the Office's search (P16, RF1.5.7), from
 * GET /api/admin/postulantes. `q` filters by name, surname or DNI; `rubros`
 * keeps whoever has any of those trades. Another `q` or `rubros` loads again
 * (useDatos). Returns { datos, loading, error, sinAcceso, recargar }.
 */
export function useBusquedaPostulantes(q: string, rubros: string[]) {
  const params = new URLSearchParams();
  if (q.trim()) params.set("q", q.trim());
  rubros.forEach((r) => params.append("rubro", r));

  const qs = params.toString();
  const url = `/api/admin/postulantes${qs ? `?${qs}` : ""}`;

  return useDatos(url, listaBusquedaPostulantesSchema);
}
