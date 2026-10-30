import { redirect } from "next/navigation";

import { ComoFunciona } from "@/components/inicio/ComoFunciona";
import { Confianza } from "@/components/inicio/Confianza";
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

/**
 * P01: the portal's home (RF1.1.1, D-029).
 * - Full-width layout (`max-w-[1680px]`).
 * - Shows personalized `OfertasSugeridas` for logged-in applicants.
 * - Shows `OfertasRecientes` (automatic + manual carousel of up to 9 offers, never repeating suggested ones).
 * - Shows `Confianza` (with the official Municipality of Funes seal/logo), `ComoFunciona`,
 *   `RedesMunicipales` and the institutional `PieInicio` footer.
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
        <div className="relative -mt-6 flex-1 rounded-tl-[1.5rem] bg-muted sm:-mt-8 sm:rounded-tl-[1.75rem] lg:-mt-12 lg:rounded-tl-[2.5rem]">
          <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-12 px-4 pt-8 pb-[calc(var(--alto-barra-inferior,0px)+2.5rem)] sm:px-8 lg:px-14 lg:pt-12 lg:pb-12">
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
