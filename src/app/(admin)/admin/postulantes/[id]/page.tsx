import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/admin/page-header";
import { PanelPostulante, type TabPostulante } from "@/components/admin/panel-postulante";
import { operadorActual } from "@/lib/admin/datos";
import { ofertasParaAsociar } from "@/lib/admin/postulantes";
import { leerParam, urlCon, type ParamsBusqueda } from "@/lib/admin/url";
import { verOfertas, verSeguimientoPostulante } from "@/lib/use-cases/oficina";

export const metadata: Metadata = { title: "Postulante · Oficina de Empleo" };

const TABS: TabPostulante[] = ["resumen", "postulaciones", "cursos"];

/**
 * Full page of one applicant: the same detail as the side panel, plus the
 * follow-up with the rejections (P18) and the course referrals (P19, D-047).
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
  const pedida = leerParam(params, "tab");
  const tab = TABS.find((t) => t === pedida) ?? "resumen";
  const ruta = `/admin/postulantes/${id}`;

  const fila = {
    ...postulante,
    cantidadPostulaciones: postulaciones.length,
  };

  return (
    <>
      <PageHeader migas={["Gestión", "Postulantes"]} titulo="Postulante" />
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[10px] border border-border md:max-w-3xl">
        <PanelPostulante
          postulante={fila}
          postulaciones={postulaciones}
          tab={tab}
          hrefTab={(t) => urlCon(ruta, params, { tab: t === "resumen" ? undefined : t })}
          paginaCompleta
          seguimiento={{ resumen, derivacionesCurso }}
          ofertasParaAsociar={resOfertas.ok ? ofertasParaAsociar(resOfertas.datos, postulaciones) : undefined}
        />
      </section>
    </>
  );
}
