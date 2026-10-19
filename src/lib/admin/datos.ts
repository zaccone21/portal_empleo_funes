import "server-only";

import { redirect } from "next/navigation";

import { getCurrentUser, type CurrentUser } from "@/lib/dal/auth";
import { buscarEmpresas, buscarPostulantes, verOfertas, verPostulacionesAdmin } from "@/lib/use-cases/oficina";
import { leerParam, type ParamsBusqueda } from "@/lib/admin/url";
import type { FilaEmpresa } from "@/lib/admin/empresas";
import { ofertasParaAsociar, type FilaPostulante, type OfertaParaAsociar } from "@/lib/admin/postulantes";
import type { OfertaOficina, PostulacionAdmin } from "@/lib/validation/oficina";

/** The logged-in operator, or a redirect to the Office login (the layout already checks, this is the typed guard). */
export async function operadorActual(): Promise<CurrentUser> {
  const usuario = await getCurrentUser();
  if (!usuario || usuario.rol !== "admin") redirect("/admin/ingresar");
  return usuario;
}

/** Everything the offer screens need: the offers and, for the "Postulaciones" tab, those of the selected one. */
export async function datosOfertas(params: ParamsBusqueda): Promise<{
  ofertas: OfertaOficina[];
  postulacionesDeSel?: PostulacionAdmin[];
}> {
  const usuario = await operadorActual();
  const resultado = await verOfertas(usuario);
  const ofertas = resultado.ok ? resultado.datos : [];

  const sel = leerParam(params, "sel");
  if (sel && leerParam(params, "tab") === "postulaciones") {
    const todas = await verPostulacionesAdmin(usuario);
    if (todas.ok) return { ofertas, postulacionesDeSel: todas.datos.filter((p) => p.oferta.id === sel) };
  }
  return { ofertas };
}

/**
 * Everything the applicants screen needs: applicants with application counts,
 * and the history of the selected one with the published offers it can be
 * linked to (RF1.5.8).
 */
export async function datosPostulantes(params: ParamsBusqueda): Promise<{
  postulantes: FilaPostulante[];
  postulacionesDeSel: PostulacionAdmin[];
  ofertasParaAsociarSel: OfertaParaAsociar[];
}> {
  const usuario = await operadorActual();
  const [resPostulantes, resPostulaciones, resOfertas] = await Promise.all([
    buscarPostulantes(usuario, {}),
    verPostulacionesAdmin(usuario),
    verOfertas(usuario),
  ]);

  const rawPostulantes = resPostulantes.ok ? resPostulantes.datos : [];
  const postulaciones = resPostulaciones.ok ? resPostulaciones.datos : [];
  const ofertas = resOfertas.ok ? resOfertas.datos : [];

  const conteosPorPostulante = new Map<string, number>();
  for (const post of postulaciones) {
    conteosPorPostulante.set(post.postulante.id, (conteosPorPostulante.get(post.postulante.id) ?? 0) + 1);
  }

  const postulantes: FilaPostulante[] = rawPostulantes.map((p) => ({
    ...p,
    cantidadPostulaciones: conteosPorPostulante.get(p.id) ?? 0,
  }));

  const sel = leerParam(params, "sel");
  const postulacionesDeSel = sel ? postulaciones.filter((p) => p.postulante.id === sel) : [];
  const ofertasParaAsociarSel = sel ? ofertasParaAsociar(ofertas, postulacionesDeSel) : [];

  return { postulantes, postulacionesDeSel, ofertasParaAsociarSel };
}

/** Everything the companies screen needs: companies with offer counts and offers of the selected one. */
export async function datosEmpresas(params: ParamsBusqueda): Promise<{
  empresas: FilaEmpresa[];
  ofertasDeSel: OfertaOficina[];
}> {
  const usuario = await operadorActual();
  const [resEmpresas, resOfertas] = await Promise.all([
    buscarEmpresas(usuario, {}),
    verOfertas(usuario),
  ]);

  const rawEmpresas = resEmpresas.ok ? resEmpresas.datos : [];
  const ofertas = resOfertas.ok ? resOfertas.datos : [];

  const empresas: FilaEmpresa[] = rawEmpresas.map((e) => {
    const susOfertas = ofertas.filter((o) => o.empresaId === e.id);
    const rubros = Array.from(new Set(susOfertas.flatMap((o) => o.rubros)));
    const ofertasActivas = susOfertas.filter((o) => o.estado === "publicada").length;
    return {
      ...e,
      rubros,
      ofertasActivas,
      ofertasTotales: susOfertas.length,
    };
  });

  const sel = leerParam(params, "sel");
  const ofertasDeSel = sel ? ofertas.filter((o) => o.empresaId === sel) : [];

  return { empresas, ofertasDeSel };
}

/** Everything the application queues and register need. */
export async function datosPostulaciones(_params?: ParamsBusqueda): Promise<{
  postulaciones: PostulacionAdmin[];
}> {
  void _params;
  const usuario = await operadorActual();
  const res = await verPostulacionesAdmin(usuario);
  return { postulaciones: res.ok ? res.datos : [] };
}

