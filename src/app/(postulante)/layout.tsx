import type { ReactNode } from "react";

import { EncabezadoPortal } from "@/components/marca/EncabezadoPortal";

/**
 * Shell of the applicant's screens: the green top bar with the main
 * navigation. Each page brings its own header and content (Seccion).
 * /ofertas is public (RF1.4.1); "Mis postulaciones" asks to log in when there
 * is no session.
 */
export default function PostulanteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-1 flex-col bg-brand-deep">
      <EncabezadoPortal
        enlaces={[
          { href: "/ofertas", texto: "Ofertas" },
          { href: "/postulante/postulaciones", texto: "Mis postulaciones" },
          { href: "/postulante/cv", texto: "Mi CV" },
        ]}
      />
      {children}
    </div>
  );
}
