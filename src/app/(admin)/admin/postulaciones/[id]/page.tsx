import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EvaluacionPostulacion } from "@/components/admin/evaluacion-postulacion";
import { operadorActual } from "@/lib/admin/datos";
import { postulacionesDelModo } from "@/lib/admin/postulaciones";
import { conDesde, leerDesde, urlCon, type ParamsBusqueda } from "@/lib/admin/url";
import { verPostulacionAdmin, verPostulacionesAdmin } from "@/lib/use-cases/oficina";

export const metadata: Metadata = { title: "Evaluación de postulación · Oficina de Empleo" };

export default async function AdminPostulacionDetallePage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<ParamsBusqueda>;
}) {
  const { id } = await props.params;
  const params = await props.searchParams;
  const desde = leerDesde(params);
  const usuario = await operadorActual();
  // J/K and "next" keep where the evaluation was opened from, so the back arrow still leads there.
  const enlace = (otraId: string) =>
    desde ? conDesde(`/admin/postulaciones/${otraId}`, desde) : `/admin/postulaciones/${otraId}`;

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

  let hrefAnterior: string | undefined;
  let hrefSiguiente: string | undefined;
  let posicionEnCola: { actual: number; total: number } | undefined;

  if (indiceEnCola !== -1) {
    if (indiceEnCola > 0) hrefAnterior = enlace(colaPorEvaluar[indiceEnCola - 1].id);
    if (indiceEnCola < colaPorEvaluar.length - 1) hrefSiguiente = enlace(colaPorEvaluar[indiceEnCola + 1].id);
    posicionEnCola = { actual: indiceEnCola + 1, total: colaPorEvaluar.length };
  }

  // D-054: referrals of the same offer still waiting for the company, for the non-blocking warning.
  const sinRespuestaEnOferta = todas.filter(
    (p) =>
      p.id !== id && p.oferta.id === postulacion.oferta.id && p.estado === "derivado" && p.decisionEmpresa === null,
  ).length;

  // Context for the decision: how the offer is going and whether the person applied elsewhere.
  const deLaOferta = todas.filter((p) => p.oferta.id === postulacion.oferta.id);
  const resumenOferta = resTodas.ok
    ? {
        postulaciones: deLaOferta.length,
        derivadas: deLaOferta.filter((p) => p.estado === "derivado").length,
        contratadas: deLaOferta.filter((p) => p.decisionEmpresa === "contratado").length,
      }
    : undefined;
  const otrasPostulaciones = todas.filter(
    (p) => p.id !== id && p.postulante.id === postulacion.postulante.id,
  ).length;

  return (
    <EvaluacionPostulacion
      postulacion={postulacion}
      volver={desde ?? "/admin/postulaciones/por-evaluar"}
      aqui={urlCon(`/admin/postulaciones/${id}`, params, {})}
      hrefAnterior={hrefAnterior}
      hrefSiguiente={hrefSiguiente}
      posicionEnCola={posicionEnCola}
      sinRespuestaEnOferta={sinRespuestaEnOferta}
      resumenOferta={resumenOferta}
      otrasPostulaciones={otrasPostulaciones}
    />
  );
}
