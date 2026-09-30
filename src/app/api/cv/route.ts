import { getCurrentUser } from "@/lib/dal/auth";
import { responder, sinSesion } from "@/lib/respuestas-api";
import { subirMiCv, verMiCv } from "@/lib/use-cases/postulante";
import { validarArchivoCv } from "@/lib/validation/cv";

/** GET /api/cv (D-026): `{ cv }` (name, size, date), null while the applicant has not uploaded one. */
export async function GET() {
  const usuario = await getCurrentUser();
  if (!usuario) return sinSesion();

  return responder(await verMiCv(usuario));
}

/**
 * PUT /api/cv (D-026): uploads the CV (multipart/form-data, field "archivo")
 * to the private bucket, replacing the previous one (RF1.2.3). The server
 * repeats the browser's checks (type, size and %PDF- bytes), because the
 * browser's can be skipped (AGENTS §7).
 */
export async function PUT(request: Request) {
  const usuario = await getCurrentUser();
  if (!usuario) return sinSesion();

  const formulario = await request.formData().catch(() => null);
  const archivo = formulario?.get("archivo");
  if (!(archivo instanceof File)) {
    return Response.json({ error: "Elegí un archivo PDF." }, { status: 400 });
  }
  const problema = await validarArchivoCv(archivo);
  if (problema) {
    return Response.json({ error: problema }, { status: 400 });
  }

  return responder(await subirMiCv(usuario, archivo));
}
