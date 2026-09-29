import { almacen } from "@/mocks/almacen";
import { bloquearEnProduccion } from "@/mocks/respuestas";
import { exigirRol } from "@/mocks/sesion";

/**
 * GET /api/admin/postulaciones/[id]/cv: opens the CV of the applicant of an
 * application (RF1.5.5, RNF1, D-030). Only the Office can open CVs.
 *
 * The screen links here directly (a plain link that opens a new tab), so the
 * browser never blocks it as a popup. The real version answers a redirect
 * (302) to a short-lived signed URL of the private bucket; this simulated one
 * sends the PDF itself.
 * 404 if the application or the CV does not exist.
 *
 * TEMPORARY (DT-003): reads the PDF from the simulated store.
 */
export async function GET(_request: Request, ctx: RouteContext<"/api/admin/postulaciones/[id]/cv">) {
  const bloqueo = bloquearEnProduccion();
  if (bloqueo) return bloqueo;
  const usuario = await exigirRol("admin");
  if (usuario instanceof Response) return usuario;

  const { id } = await ctx.params;
  const postulacion = almacen.postulaciones.find((p) => p.id === id);
  const cv = postulacion ? almacen.cvs[postulacion.emailPostulante] : undefined;
  if (!cv) {
    return Response.json({ error: "Esta persona todavía no subió su CV." }, { status: 404 });
  }

  return new Response(new Blob([new Uint8Array(cv.contenido)], { type: "application/pdf" }), {
    headers: {
      "Content-Disposition": `inline; filename="${cv.nombre.replace(/"/g, "")}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
