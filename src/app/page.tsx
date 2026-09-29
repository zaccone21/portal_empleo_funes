import { ComoFunciona } from "@/components/inicio/ComoFunciona";
import { OfertasRecientes } from "@/components/inicio/OfertasRecientes";
import { ParaEmpresas } from "@/components/inicio/ParaEmpresas";
import { PieInicio } from "@/components/inicio/PieInicio";
import { PortadaInicio } from "@/components/inicio/PortadaInicio";
import { MarcoArea } from "@/components/marca/MarcoArea";

/**
 * P01: the portal's home (RF1.1.1, D-029). It belongs to the applicant area
 * (most visitors look for work), so it has the applicant menu, and it leads
 * each audience to its place:
 * - job seekers: search and trade shortcuts (PortadaInicio), the newest
 *   offers and how applying works;
 * - companies: their own block with registration and login;
 * - the Office: a discreet link in the footer.
 */
export default function Home() {
  return (
    <MarcoArea area="applicant">
      <main id="contenido" className="flex flex-1 flex-col">
        <PortadaInicio />
        <div className="relative -mt-6 flex-1 rounded-tl-[1.5rem] bg-muted sm:-mt-8 sm:rounded-tl-[1.75rem] lg:-mt-12 lg:rounded-tl-[2.5rem]">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 pt-8 pb-[calc(var(--alto-barra-inferior,0px)+2rem)] lg:px-10 lg:pt-12 lg:pb-10">
            <OfertasRecientes />
            <ComoFunciona />
            <ParaEmpresas />
            <PieInicio />
          </div>
        </div>
      </main>
    </MarcoArea>
  );
}
