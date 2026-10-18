import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/admin/page-header";
import { PanelPostulante } from "@/components/admin/panel-postulante";
import { operadorActual } from "@/lib/admin/datos";
import { leerParam, urlCon, type ParamsBusqueda } from "@/lib/admin/url";
import { verPostulante, verPostulacionesAdmin } from "@/lib/use-cases/oficina";

export const metadata: Metadata = { title: "Postulante · Oficina de Empleo" };

/** Full page of one applicant: the same detail as the side panel. */
export default async function AdminPostulanteDetallePage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<ParamsBusqueda>;
}) {
  const { id } = await props.params;
  const params = await props.searchParams;
  const usuario = await operadorActual();

  const [resPostulante, resPostulaciones] = await Promise.all([
    verPostulante(usuario, id),
    verPostulacionesAdmin(usuario),
  ]);

  if (!resPostulante.ok) notFound();

  const postulaciones = resPostulaciones.ok
    ? resPostulaciones.datos.filter((p) => p.postulante.id === id)
    : [];

  const tab = leerParam(params, "tab") === "postulaciones" ? "postulaciones" : "resumen";
  const ruta = `/admin/postulantes/${id}`;

  const fila = {
    ...resPostulante.datos,
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
        />
      </section>
    </>
  );
}
