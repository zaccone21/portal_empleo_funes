import type { Metadata } from "next";

import { Dashboard, type TareaPendiente } from "@/components/admin/dashboard";
import { nombreCompleto } from "@/components/admin/celdas";
import { operadorActual } from "@/lib/admin/datos";
import {
  getConteosAdmin,
  verDerivadasSinRespuesta,
  verIndicadoresAdmin,
  verOfertas,
  verPostulacionesAdmin,
  verPostulantesConTresRechazos,
} from "@/lib/use-cases/oficina";

export const metadata: Metadata = { title: "Dashboard · Oficina de Empleo" };

export default async function AdminDashboardPage() {
  const usuario = await operadorActual();

  const [conteos, resIndicadores, resOfertas, resPostulaciones, resSinRespuesta, resTresRechazos] = await Promise.all([
    getConteosAdmin(usuario),
    verIndicadoresAdmin(usuario),
    verOfertas(usuario),
    verPostulacionesAdmin(usuario),
    verDerivadasSinRespuesta(usuario),
    verPostulantesConTresRechazos(usuario),
  ]);

  const ofertas = resOfertas.ok ? resOfertas.datos : [];
  const postulaciones = resPostulaciones.ok ? resPostulaciones.datos : [];
  const sinRespuesta = resSinRespuesta.ok ? resSinRespuesta.datos : [];
  const postulantesTresRechazos = resTresRechazos.ok ? resTresRechazos.datos : [];

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
        fecha: p.actualizadaEl ?? p.postuladoEl,
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
        fecha: p.actualizadaEl ?? p.postuladoEl,
        enlace: "/admin/por-comunicar",
      });
    }
  }

  // 5. Referred applications the company has not answered (D-054), dated by the referral
  for (const p of sinRespuesta) {
    const postulante = nombreCompleto(p.postulante) ?? "Postulante";
    tareas.push({
      id: p.id,
      tipo: "sin_respuesta",
      titulo: p.oferta.titulo,
      subtitulo: `${postulante} → ${p.oferta.empresa?.razonSocial ?? "Empresa"}`,
      fecha: p.derivadaEl ?? p.actualizadaEl ?? p.postuladoEl,
      enlace: `/admin/postulaciones/${p.id}`,
    });
  }

  // 6. Applicants with 3 or more company rejections waiting for course referral
  for (const r of postulantesTresRechazos) {
    if (r.cursosAsignados.length === 0) {
      const postulante = nombreCompleto(r) ?? "Postulante";
      tareas.push({
        id: r.postulanteId,
        tipo: "tres_rechazos",
        titulo: `${postulante} (${r.cantidadRechazos} rechazos)`,
        subtitulo: "Ofrecer curso de capacitación",
        fecha: r.ultimoRechazoEl,
        enlace: `/admin/cursos`,
      });
    }
  }

  // Most recent actions first so newer items never appear below older ones
  tareas.sort((a, b) => b.fecha.localeCompare(a.fecha));

  return (
    <Dashboard
      conteos={conteos}
      postulantesTresRechazos={postulantesTresRechazos.length}
      indicadores={resIndicadores.ok ? resIndicadores.datos : null}
      tareasPendientes={tareas}
      emailOperador={usuario.email}
    />
  );
}
