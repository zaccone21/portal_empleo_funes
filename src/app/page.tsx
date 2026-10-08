import { redirect } from "next/navigation";

import { ComoFunciona } from "@/components/inicio/ComoFunciona";
import { OfertasRecientes } from "@/components/inicio/OfertasRecientes";
import { ParaEmpresas } from "@/components/inicio/ParaEmpresas";
import { PieInicio } from "@/components/inicio/PieInicio";
import { PortadaInicio } from "@/components/inicio/PortadaInicio";
import { MarcoArea } from "@/components/marca/MarcoArea";
import { getCurrentUser } from "@/lib/dal/auth";

/**
 * P01: the portal's home (RF1.1.1, D-029).
 * - Companies and the Office are redirected to their own homes.
 * - Applicants and visitors stay here. Visitors see the whole landing page,
 *   while logged-in applicants see a cleaner version (no "How to apply" or
 *   "For companies").
 */
export default async function Home() {
  const usuario = await getCurrentUser();

  if (usuario?.rol === "admin") {
    redirect("/admin");
  }

  if (usuario?.rol === "empresa") {
    redirect("/empresa");
  }

  const esPostulante = usuario?.rol === "postulante";

  return (
    <MarcoArea area="postulante">
      <main id="contenido" className="flex flex-1 flex-col">
        <PortadaInicio />
        <div className="relative -mt-6 flex-1 rounded-tl-[1.5rem] bg-muted sm:-mt-8 sm:rounded-tl-[1.75rem] lg:-mt-12 lg:rounded-tl-[2.5rem]">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 pt-8 pb-[calc(var(--alto-barra-inferior,0px)+2rem)] lg:px-10 lg:pt-12 lg:pb-10">
            <OfertasRecientes />
            {!esPostulante && (
              <>
                <ComoFunciona />
                <ParaEmpresas />
              </>
            )}
            <PieInicio />
          </div>
        </div>
      </main>
    </MarcoArea>
  );
}
