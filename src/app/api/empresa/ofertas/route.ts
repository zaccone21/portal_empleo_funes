import { getCurrentUser } from "@/lib/dal/auth";
import { datosInvalidos, leerCuerpo, responder, sinSesion } from "@/lib/respuestas-api";
import { publicarOferta, verMisOfertas } from "@/lib/use-cases/empresa";
import { nuevaOfertaSchema } from "@/lib/validation/ofertas";

/** GET /api/empresa/ofertas (D-027): the company's own offers, newest first, with status, rejection reason and close request. */
export async function GET() {
  const usuario = await getCurrentUser();
  if (!usuario) return sinSesion();

  return responder(await verMisOfertas(usuario));
}

/** POST /api/empresa/ofertas (D-027, D-032): creates an offer "pendiente" (no drafts, D-007). 201 `{ oferta }`. */
export async function POST(request: Request) {
  const usuario = await getCurrentUser();
  if (!usuario) return sinSesion();

  const datos = nuevaOfertaSchema.safeParse(await leerCuerpo(request));
  if (!datos.success) return datosInvalidos(datos.error);

  return responder(await publicarOferta(usuario, datos.data), 201);
}
