import { redirect } from "next/navigation";

import { ComoFunciona } from "@/components/inicio/ComoFunciona";
import { Confianza } from "@/components/inicio/Confianza";
import { MetricasSeccion } from "@/components/inicio/MetricasSeccion";
import { OfertasRecientes } from "@/components/inicio/OfertasRecientes";
import { PieInicio } from "@/components/inicio/PieInicio";
import { PortadaInicio } from "@/components/inicio/PortadaInicio";
import { RedesMunicipales } from "@/components/inicio/RedesMunicipales";
import { MarcoArea } from "@/components/marca/MarcoArea";
import { OfertasSugeridas } from "@/components/ofertas/OfertasSugeridas";
import { getCurrentUser } from "@/lib/dal/auth";
import { createClient } from "@/lib/supabase/server";

async function registrarVisitaSilenciosa() {
  try {
    const supabase = await createClient();
    await supabase.rpc("registrar_visita_diaria");
  } catch {
    // Non-blocking if migration is not yet applied
  }
}

/**
 * P01: la portada del portal.
 * - Incluye OfertasSugeridas para postulantes logueados.
 * - Muestra MetricasSeccion, OfertasRecientes, ComoFunciona, Confianza y RedesMunicipales.
 */
export default async function Home() {
  const [usuario] = await Promise.all([
    getCurrentUser(),
    registrarVisitaSilenciosa(),
  ]);

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
            {esPostulante && <OfertasSugeridas />}
            <OfertasRecientes />
            {!esPostulante && <ComoFunciona />}
            <Confianza />
            <RedesMunicipales />
          </div>
        </div>
        <PieInicio />
      </main>
    </MarcoArea>
  );
}