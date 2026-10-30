import { redirect } from "next/navigation";

import { ComoFunciona } from "@/components/inicio/ComoFunciona";
import { MetricasSeccion } from "@/components/inicio/MetricasSeccion";
import { OfertasRecientes } from "@/components/inicio/OfertasRecientes";
import { ParaEmpresas } from "@/components/inicio/ParaEmpresas";
import { PieInicio } from "@/components/inicio/PieInicio";
import { PortadaInicio } from "@/components/inicio/PortadaInicio";
import { MarcoArea } from "@/components/marca/MarcoArea";
import { getCurrentUser } from "@/lib/dal/auth";

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
        
        {/* Muestrario compacto de métricas justo antes de las ofertas */}
        <div className="mx-auto w-full max-w-6xl px-4 lg:px-10 -mt-2 mb-4 z-10">
          <MetricasSeccion />
        </div>

        <div className="relative flex-1 rounded-tl-[1.5rem] bg-muted sm:rounded-tl-[1.75rem] lg:rounded-tl-[2.5rem]">
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