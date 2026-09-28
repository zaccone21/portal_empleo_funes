import { validarArchivoCv } from "@/lib/validation/cv";
import { almacen } from "@/mocks/almacen";
import { bloquearEnProduccion } from "@/mocks/respuestas";

/*
 * /api/cv: the applicant's CV (P04, RF1.2.3, D-026).
 *
 * TEMPORARY (DT-003): keeps only the file's name, size and date in the
 * in-memory store; the file itself is discarded. The real version validates
 * the same way, then the use case stores the PDF in the private bucket under
 * {user_id}/ (RNF1) through the DAL.
 */

/** GET: `{ cv }`, null while the applicant has not uploaded one. */
export async function GET() {
  const bloqueo = bloquearEnProduccion();
  if (bloqueo) return bloqueo;

  return Response.json({ cv: almacen.cv });
}

/**
 * PUT: uploads the CV (multipart/form-data, field "archivo"). It replaces the
 * previous one: there is a single CV per applicant (RF1.2.3). The server
 * repeats the browser's checks (type, size and %PDF- bytes) because the
 * browser's can be skipped (AGENTS §7).
 */
export async function PUT(request: Request) {
  const bloqueo = bloquearEnProduccion();
  if (bloqueo) return bloqueo;

  const formulario = await request.formData().catch(() => null);
  const archivo = formulario?.get("archivo");
  if (!(archivo instanceof File)) {
    return Response.json({ error: "Elegí un archivo PDF." }, { status: 400 });
  }

  const problema = await validarArchivoCv(archivo);
  if (problema) {
    return Response.json({ error: problema }, { status: 400 });
  }

  almacen.cv = {
    nombre: archivo.name,
    tamanoBytes: archivo.size,
    subidoEl: new Date().toISOString(),
  };
  return Response.json({ cv: almacen.cv });
}
