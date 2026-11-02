import { NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/dal/auth";
import { responder } from "@/lib/respuestas-api";
import { verOfertasPublicadas, verOfertasPublicadasPaginadas } from "@/lib/use-cases/postulante";
import { MODALIDADES_LABORALES, TIPOS_JORNADA, type ModalidadLaboral, type TipoJornada } from "@/lib/validation/estandarizacion";
import { esRubro, type Rubro } from "@/lib/validation/rubros";

/**
 * GET /api/ofertas (D-024, D-028): published offers, newest first. Public:
 * works with or without a session. `yaTePostulaste` marks the ones the
 * logged-in applicant already applied to.
 * Defaults to paginated server-side queries (12 per page) for real scalability.
 * Pass `?todas=true` for the unpaginated full list if ever needed.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const usuario = await getCurrentUser();

  if (searchParams.get("todas") === "true") {
    return responder(await verOfertasPublicadas(usuario));
  }

  const pagina = Math.max(1, Number(searchParams.get("pagina")) || 1);
  const porPagina = Math.min(100, Math.max(1, Number(searchParams.get("porPagina") || searchParams.get("limite")) || 12));

  const rubroParam = searchParams.get("rubro");
  const rubro: Rubro | null = rubroParam && esRubro(rubroParam) ? (rubroParam as Rubro) : null;

  const modParam = searchParams.get("modalidad");
  const modalidad: ModalidadLaboral | "" =
    modParam && (MODALIDADES_LABORALES as readonly string[]).includes(modParam)
      ? (modParam as ModalidadLaboral)
      : "";

  const jornadaParam = searchParams.get("tipoJornada");
  const tipoJornada: TipoJornada | "" =
    jornadaParam && (TIPOS_JORNADA as readonly string[]).includes(jornadaParam)
      ? (jornadaParam as TipoJornada)
      : "";

  const pagoParam = searchParams.get("pago");
  const pago = pagoParam === "con_sueldo" || pagoParam === "a_convenir" ? pagoParam : "todos";

  const ordenParam = searchParams.get("orden");
  const orden = ordenParam === "antiguas" ? "antiguas" : "recientes";

  const q = searchParams.get("q")?.trim() || undefined;

  return responder(
    await verOfertasPublicadasPaginadas(
      usuario,
      { pagina, porPagina },
      { q, rubro, modalidad, tipoJornada, pago, orden },
    ),
  );
}
