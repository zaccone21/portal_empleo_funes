import { nuevaOfertaSchema } from "@/lib/validation/ofertas";
import { almacen } from "@/mocks/almacen";
import type { OfertaGuardada } from "@/mocks/datos-ejemplo";
import { aOfertaEmpresa } from "@/mocks/dto";
import { bloquearEnProduccion } from "@/mocks/respuestas";
import { exigirRol } from "@/mocks/sesion";

/*
 * /api/empresa/ofertas: the logged-in company's offers (P11, P12, D-027).
 *
 * TEMPORARY (DT-003): works on the simulated store with the simulated session
 * (D-028). With the real backend: getCurrentUser() → use case (role company,
 * only its own offers) → DAL, with RLS enforcing the ownership again.
 */

/** GET: the company's own offers, newest first, with status, rejection reason and close request. */
export async function GET() {
  const bloqueo = bloquearEnProduccion();
  if (bloqueo) return bloqueo;
  const usuario = await exigirRol("company");
  if (usuario instanceof Response) return usuario;

  const propias = almacen.ofertas
    .filter((oferta) => oferta.emailEmpresa === usuario.email)
    .sort((a, b) => b.creadaEl.localeCompare(a.creadaEl));
  return Response.json(propias.map(aOfertaEmpresa));
}

/**
 * POST: creates an offer (RF1.3.3). It always starts as "pending": there are
 * no drafts (D-007) and the Office reviews it before it is published.
 * 400 if a field is missing; 201 `{ oferta }` with the created offer.
 */
export async function POST(request: Request) {
  const bloqueo = bloquearEnProduccion();
  if (bloqueo) return bloqueo;
  const usuario = await exigirRol("company");
  if (usuario instanceof Response) return usuario;

  const datos = nuevaOfertaSchema.safeParse(await request.json().catch(() => null));
  if (!datos.success) {
    return Response.json({ error: datos.error.issues[0].message }, { status: 400 });
  }

  const oferta: OfertaGuardada = {
    ...datos.data,
    id: `empresa-oferta-${Date.now()}`,
    estado: "pending",
    motivoRechazo: null,
    cierreSolicitado: false,
    creadaEl: new Date().toISOString(),
    publicadaEl: null,
    emailEmpresa: usuario.email,
  };
  almacen.ofertas.push(oferta);
  return Response.json({ oferta: aOfertaEmpresa(oferta) }, { status: 201 });
}
