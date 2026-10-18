import type { Metadata } from "next";

import { Dashboard, type TareaPendiente } from "@/components/admin/dashboard";
import { nombreCompleto } from "@/components/admin/celdas";
import { operadorActual } from "@/lib/admin/datos";
import {
  getConteosAdmin,
  verOfertas,
  verPostulacionesAdmin,
} from "@/lib/use-cases/oficina";

export const metadata: Metadata = { title: "Dashboard · Oficina de Empleo" };

export default async function AdminDashboardPage() {
  const usuario = await operadorActual();

  const [conteos, resOfertas, resPostulaciones] = await Promise.all([
    getConteosAdmin(usuario),
    verOfertas(usuario),
    verPostulacionesAdmin(usuario),
  ]);

  const ofertas = resOfertas.ok ? resOfertas.datos : [];
  const postulaciones = resPostulaciones.ok ? resPostulaciones.datos : [];

  const tareas: TareaPendiente[] = [];

  // 1. Pending offers
  for (const o of ofertas) {
    if (o.estado === "pendiente") {
      tareas.push({
        id: o.id,
        tipo: "oferta_pendiente",
        titulo: o.titulo,
        subtitulo: o.empresa?.razonSocial ?? "Empresa",
        fecha: o.creadaEl,
        enlace: `/admin/ofertas/por-revisar?sel=${o.id}`,
      });
    }
  }

  // 2. Close requests
  for (const o of ofertas) {
    if (o.estado === "publicada" && o.cierreSolicitado) {
      tareas.push({
        id: o.id,
        tipo: "cierre_solicitado",
        titulo: o.titulo,
        subtitulo: o.empresa?.razonSocial ?? "Empresa",
        fecha: o.creadaEl,
        enlace: `/admin/ofertas/cierres-solicitados?sel=${o.id}`,
      });
    }
  }

  // 3. New applications
  for (const p of postulaciones) {
    if (p.estado === "postulado") {
      const postulante = nombreCompleto(p.postulante) ?? "Postulante";
      tareas.push({
        id: p.id,
        tipo: "postulacion_nueva",
        titulo: p.oferta.titulo,
        subtitulo: `${postulante} · ${p.oferta.empresa?.razonSocial ?? "Empresa"}`,
        fecha: p.postuladoEl,
        enlace: `/admin/postulaciones/${p.id}`,
      });
    }
  }

  // 4. Preselected applications waiting to be communicated
  for (const p of postulaciones) {
    if (p.estado === "preseleccionado") {
      const postulante = nombreCompleto(p.postulante) ?? "Postulante";
      tareas.push({
        id: p.id,
        tipo: "por_comunicar",
        titulo: p.oferta.titulo,
        subtitulo: `${postulante} → ${p.oferta.empresa?.razonSocial ?? "Empresa"}`,
        fecha: p.postuladoEl,
        enlace: "/admin/por-comunicar",
      });
    }
  }

  // Oldest first for urgent resolution
  tareas.sort((a, b) => a.fecha.localeCompare(b.fecha));

  return (
    <Dashboard
      conteos={conteos}
      tareasPendientes={tareas}
      emailOperador={usuario.email}
    />
  );
}
