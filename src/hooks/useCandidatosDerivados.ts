import { useDatos } from "@/hooks/useDatos";
import { listaCandidatosSchema, type CandidatoDerivado } from "@/lib/validation/candidatos";

/**
 * The applicants the Office referred to the company's offers (P09, P17;
 * D-044), from GET /api/empresa/candidatos; with `ofertaId`, only those of
 * that offer. `reemplazar(candidato)` puts back one candidate after the
 * company answers, without loading the list again.
 */
export function useCandidatosDerivados(ofertaId?: string) {
  const url = ofertaId ? `/api/empresa/candidatos?oferta=${encodeURIComponent(ofertaId)}` : "/api/empresa/candidatos";
  const { datos, setDatos, loading, error, sinAcceso, recargar } = useDatos(url, listaCandidatosSchema);

  function reemplazar(actualizado: CandidatoDerivado) {
    setDatos((lista) => lista?.map((c) => (c.postulacionId === actualizado.postulacionId ? actualizado : c)));
  }

  return { candidatos: datos, loading, error, sinAcceso, recargar, reemplazar };
}
