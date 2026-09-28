import { postularseSchema } from "@/lib/validation/postulaciones";
import { almacen } from "@/mocks/almacen";
import { OFERTAS_DE_EJEMPLO } from "@/mocks/datos-ejemplo";
import { bloquearEnProduccion } from "@/mocks/respuestas";

/*
 * /api/postulaciones (D-024).
 *
 * TEMPORARY (DT-003, D-026): works on the in-memory store of src/mocks, as a
 * single applicant who is always logged in. It follows the real contract so
 * the screens behave as they will with the database. With the real backend:
 * getCurrentUser() (401 without session) → use case → DAL.
 */

/** GET: the applicant's applications, newest first, without status (RF1.2.4). */
export async function GET() {
  const bloqueo = bloquearEnProduccion();
  if (bloqueo) return bloqueo;

  const recientesPrimero = [...almacen.postulaciones].sort((a, b) =>
    b.postuladoEl.localeCompare(a.postuladoEl),
  );
  return Response.json(recientesPrimero);
}

/**
 * POST: applies to an offer. Same rules the use case will have:
 * 1. 400 if the body is not `{ ofertaId }`.
 * 2. 404 if the offer does not exist or is not published.
 * 3. 409 if the applicant has no CV (RF1.4.4).
 * 4. 201 if it worked, also when they had already applied (idempotent).
 */
export async function POST(request: Request) {
  const bloqueo = bloquearEnProduccion();
  if (bloqueo) return bloqueo;

  const datos = postularseSchema.safeParse(await request.json().catch(() => null));
  if (!datos.success) {
    return Response.json({ error: "Falta la oferta." }, { status: 400 });
  }

  const oferta = OFERTAS_DE_EJEMPLO.find((o) => o.id === datos.data.ofertaId);
  if (!oferta) {
    return Response.json({ error: "Esta oferta ya no está publicada." }, { status: 404 });
  }

  if (!almacen.cv) {
    return Response.json(
      { error: "Para postularte tenés que subir tu CV en PDF. Lleva un minuto." },
      { status: 409 },
    );
  }

  const yaPostulado = almacen.postulaciones.some((p) => p.oferta.id === oferta.id);
  if (!yaPostulado) {
    almacen.postulaciones.push({
      id: `postulacion-${oferta.id}`,
      postuladoEl: new Date().toISOString(),
      oferta: { id: oferta.id, titulo: oferta.titulo, lugar: oferta.lugar },
    });
  }

  return new Response(null, { status: 201 });
}
