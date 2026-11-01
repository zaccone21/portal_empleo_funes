import { redirect } from "next/navigation";

import { ComoFunciona } from "@/components/inicio/ComoFunciona";
<<<<<<< HEAD
import { Confianza } from "@/components/inicio/Confianza";
=======
import { MetricasSeccion } from "@/components/inicio/MetricasSeccion";
>>>>>>> feature/aprobar-empresas
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
    // Non-blocking if migration 20261028180000 is not yet applied
  }
}

<<<<<<< HEAD
/**
 * P01: the portal's home (RF1.1.1, D-029).
 * - Full-width layout (`max-w-[1680px]`).
 * - Shows personalized `OfertasSugeridas` for logged-in applicants.
 * - Shows `OfertasRecientes` (automatic + manual carousel of up to 9 offers, never repeating suggested ones).
 * - Shows `Confianza` (with the official Municipality of Funes seal/logo), `ComoFunciona`,
 *   `RedesMunicipales` and the institutional `PieInicio` footer.
 */
=======
>>>>>>> feature/aprobar-empresas
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
<<<<<<< HEAD
        <div className="relative -mt-6 flex-1 rounded-tl-[1.5rem] bg-muted sm:-mt-8 sm:rounded-tl-[1.75rem] lg:-mt-12 lg:rounded-tl-[2.5rem]">
          <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-12 px-4 pt-8 pb-[calc(var(--alto-barra-inferior,0px)+2.5rem)] sm:px-8 lg:px-14 lg:pt-12 lg:pb-12">
            {esPostulante && <OfertasSugeridas />}
=======
        
        {/* Muestrario compacto de métricas justo antes de las ofertas */}
        <div className="mx-auto w-full max-w-6xl px-4 lg:px-10 -mt-2 mb-4 z-10">
          <MetricasSeccion />
        </div>

        <div className="relative flex-1 rounded-tl-[1.5rem] bg-muted sm:rounded-tl-[1.75rem] lg:rounded-tl-[2.5rem]">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 pt-8 pb-[calc(var(--alto-barra-inferior,0px)+2rem)] lg:px-10 lg:pt-12 lg:pb-10">
>>>>>>> feature/aprobar-empresas
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