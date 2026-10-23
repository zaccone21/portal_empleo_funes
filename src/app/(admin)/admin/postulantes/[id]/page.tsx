import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FichaPostulante } from "@/components/admin/ficha-postulante";
import { operadorActual } from "@/lib/admin/datos";
import { ofertasParaAsociar } from "@/lib/admin/postulantes";
import { leerDesde, urlCon, type ParamsBusqueda } from "@/lib/admin/url";
import { verOfertas, verSeguimientoPostulante } from "@/lib/use-cases/oficina";

export const metadata: Metadata = { title: "Postulante · Oficina de Empleo" };

/**
 * Full page of one applicant (D-062): data, follow-up with the rejections
 * (P18), applications, linking to an offer (P16) and course referrals (P19).
 */
export default async function AdminPostulanteDetallePage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<ParamsBusqueda>;
}) {
  const { id } = await props.params;
  const params = await props.searchParams;
  const usuario = await operadorActual();

  const [resSeguimiento, resOfertas] = await Promise.all([verSeguimientoPostulante(usuario, id), verOfertas(usuario)]);

  if (!resSeguimiento.ok) notFound();

  const { postulante, postulaciones, derivacionesCurso, resumen } = resSeguimiento.datos;

  return (
    <FichaPostulante
      postulante={{ ...postulante, cantidadPostulaciones: postulaciones.length }}
      postulaciones={postulaciones}
      seguimiento={{ resumen, derivacionesCurso }}
      ofertasParaAsociar={resOfertas.ok ? ofertasParaAsociar(resOfertas.datos, postulaciones) : []}
      volver={leerDesde(params) ?? "/admin/postulantes"}
      aqui={urlCon(`/admin/postulantes/${id}`, params, {})}
    />
  );
}
