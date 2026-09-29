import { postularseSchema } from "@/lib/validation/postulaciones";
import { almacen } from "@/mocks/almacen";
import { aPostulacionPropia } from "@/mocks/dto";
import { bloquearEnProduccion } from "@/mocks/respuestas";
import { exigirRol } from "@/mocks/sesion";

/*
 * /api/postulaciones: the logged-in applicant's applications (D-024).
 *
 * TEMPORARY (DT-003, D-026): works on the simulated store with the simulated
 * session (D-028). It follows the real contract, so the screens behave as
 * they will with the database.
 */

/** GET: the applicant's own applications, newest first, without status (RF1.2.4). */
export async function GET() {
  const bloqueo = bloquearEnProduccion();
  if (bloqueo) return bloqueo;
  const usuario = await exigirRol("applicant");
  if (usuario instanceof Response) return usuario;

  const propias = almacen.postulaciones
    .filter((p) => p.emailPostulante === usuario.email)
    .sort((a, b) => b.postuladoEl.localeCompare(a.postuladoEl));
  return Response.json(propias.map(aPostulacionPropia));
}

/**
 * POST: applies to an offer. Same rules the use case will have:
 * 1. 400 if the body is not `{ ofertaId }`.
 * 2. 404 if the offer does not exist or is not published.
 * 3. 409 if the applicant has no CV (RF1.4.4).
 * 4. 201 if it worked, also when they had already applied (idempotent).
 * New applications start as "Postulado" (applied) for the Office to review.
 */
export async function POST(request: Request) {
  const bloqueo = bloquearEnProduccion();
  if (bloqueo) return bloqueo;
  const usuario = await exigirRol("applicant");
  if (usuario instanceof Response) return usuario;

  const datos = postularseSchema.safeParse(await request.json().catch(() => null));
  if (!datos.success) {
    return Response.json({ error: "Falta la oferta." }, { status: 400 });
  }

  const oferta = almacen.ofertas.find((o) => o.id === datos.data.ofertaId && o.estado === "published");
  if (!oferta) {
    return Response.json({ error: "Esta oferta ya no está publicada." }, { status: 404 });
  }

  if (!almacen.cvs[usuario.email]) {
    return Response.json(
      { error: "Para postularte tenés que subir tu CV en PDF. Lleva un minuto." },
      { status: 409 },
    );
  }

  const yaPostulado = almacen.postulaciones.some(
    (p) => p.ofertaId === oferta.id && p.emailPostulante === usuario.email,
  );
  if (!yaPostulado) {
    almacen.postulaciones.push({
      id: `postulacion-${Date.now()}`,
      ofertaId: oferta.id,
      emailPostulante: usuario.email,
      estado: "applied",
      postuladoEl: new Date().toISOString(),
    });
  }

  return new Response(null, { status: 201 });
}
