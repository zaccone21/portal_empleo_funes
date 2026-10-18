import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EvaluacionPostulacion } from "@/components/admin/evaluacion-postulacion";
import { operadorActual } from "@/lib/admin/datos";
import { postulacionesDelModo } from "@/lib/admin/postulaciones";
import {
  abrirCvPostulante,
  verPostulacionAdmin,
  verPostulacionesAdmin,
} from "@/lib/use-cases/oficina";

export const metadata: Metadata = { title: "Evaluación de postulación · Oficina de Empleo" };

export default async function AdminPostulacionDetallePage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const usuario = await operadorActual();

  const [resPostulacion, resTodas] = await Promise.all([
    verPostulacionAdmin(usuario, id),
    verPostulacionesAdmin(usuario),
  ]);

  if (!resPostulacion.ok) notFound();

  const postulacion = resPostulacion.datos;

  // Queue of applications waiting for evaluation (oldest first)
  const todas = resTodas.ok ? resTodas.datos : [];
  const colaPorEvaluar = postulacionesDelModo(todas, "por-evaluar");
  const indiceEnCola = colaPorEvaluar.findIndex((p) => p.id === id);

  let anteriorId: string | undefined;
  let siguienteId: string | undefined;
  let posicionEnCola: { actual: number; total: number } | undefined;

  if (indiceEnCola !== -1) {
    if (indiceEnCola > 0) anteriorId = colaPorEvaluar[indiceEnCola - 1].id;
    if (indiceEnCola < colaPorEvaluar.length - 1) siguienteId = colaPorEvaluar[indiceEnCola + 1].id;
    posicionEnCola = { actual: indiceEnCola + 1, total: colaPorEvaluar.length };
  }

  // Pre-generate CV signed URL if the applicant uploaded one
  let urlCv: string | undefined;
  if (postulacion.postulante.cvNombre) {
    const resCv = await abrirCvPostulante(usuario, postulacion.postulante.id);
    if (resCv.ok) urlCv = resCv.datos.url;
  }

  return (
    <EvaluacionPostulacion
      postulacion={postulacion}
      urlCv={urlCv}
      anteriorId={anteriorId}
      siguienteId={siguienteId}
      posicionEnCola={posicionEnCola}
    />
  );
}
