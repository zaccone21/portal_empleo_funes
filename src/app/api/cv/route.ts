import { validarArchivoCv } from "@/lib/validation/cv";
import { almacen } from "@/mocks/almacen";
import { aCvPropio } from "@/mocks/dto";
import { bloquearEnProduccion } from "@/mocks/respuestas";
import { exigirRol } from "@/mocks/sesion";

/*
 * /api/cv: the logged-in applicant's CV (P04, RF1.2.3, D-026).
 *
 * TEMPORARY (DT-003): keeps the file in the simulated store's memory, so the
 * Office can open it. The real version validates the same way, then the use
 * case stores the PDF in the private bucket under {user_id}/ (RNF1) through
 * the DAL.
 */

/** GET: `{ cv }` (name, size, date), null while the applicant has not uploaded one. */
export async function GET() {
  const bloqueo = bloquearEnProduccion();
  if (bloqueo) return bloqueo;
  const usuario = await exigirRol("applicant");
  if (usuario instanceof Response) return usuario;

  return Response.json({ cv: aCvPropio(almacen.cvs[usuario.email]) });
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
  const usuario = await exigirRol("applicant");
  if (usuario instanceof Response) return usuario;

  const formulario = await request.formData().catch(() => null);
  const archivo = formulario?.get("archivo");
  if (!(archivo instanceof File)) {
    return Response.json({ error: "Elegí un archivo PDF." }, { status: 400 });
  }

  const problema = await validarArchivoCv(archivo);
  if (problema) {
    return Response.json({ error: problema }, { status: 400 });
  }

  almacen.cvs[usuario.email] = {
    nombre: archivo.name,
    tamanoBytes: archivo.size,
    subidoEl: new Date().toISOString(),
    contenido: new Uint8Array(await archivo.arrayBuffer()),
  };
  return Response.json({ cv: aCvPropio(almacen.cvs[usuario.email]) });
}
