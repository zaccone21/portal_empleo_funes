import "server-only";

import { redirect } from "next/navigation";

import { getCurrentUser, type CurrentUser } from "@/lib/dal/auth";
import { buscarEmpresas, buscarPostulantes, verOfertas, verPostulacionesAdmin } from "@/lib/use-cases/oficina";
import type { ParamsBusqueda } from "@/lib/admin/url";
import type { FilaEmpresa } from "@/lib/admin/empresas";
import type { FilaPostulante } from "@/lib/admin/postulantes";
import type { OfertaOficina, PostulacionAdmin } from "@/lib/validation/oficina";

/** The logged-in operator, or a redirect to the Office login (the layout already checks, this is the typed guard). */
export async function operadorActual(): Promise<CurrentUser> {
  const usuario = await getCurrentUser();
  if (!usuario || usuario.rol !== "admin") redirect("/admin/ingresar");
  return usuario;
}

/** Everything the offer screens need: every offer (each screen filters by its mode and the URL). */
export async function datosOfertas(): Promise<{ ofertas: OfertaOficina[] }> {
  const usuario = await operadorActual();
  const resultado = await verOfertas(usuario);
  return { ofertas: resultado.ok ? resultado.datos : [] };
}

/** Everything the applicants screen needs: applicants with their application counts. */
export async function datosPostulantes(): Promise<{ postulantes: FilaPostulante[] }> {
  const usuario = await operadorActual();
  const [resPostulantes, resPostulaciones] = await Promise.all([
    buscarPostulantes(usuario, {}),
    verPostulacionesAdmin(usuario),
  ]);

  const rawPostulantes = resPostulantes.ok ? resPostulantes.datos : [];
  const postulaciones = resPostulaciones.ok ? resPostulaciones.datos : [];

  const conteosPorPostulante = new Map<string, number>();
  for (const post of postulaciones) {
    conteosPorPostulante.set(post.postulante.id, (conteosPorPostulante.get(post.postulante.id) ?? 0) + 1);
  }

  const postulantes: FilaPostulante[] = rawPostulantes.map((p) => ({
    ...p,
    cantidadPostulaciones: conteosPorPostulante.get(p.id) ?? 0,
  }));

  return { postulantes };
}

/** Everything the companies screens need: companies with their offer counts, and the offers themselves. */
export async function datosEmpresas(): Promise<{
  empresas: FilaEmpresa[];
  ofertas: OfertaOficina[];
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

  return { empresas, ofertas };
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

