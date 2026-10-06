import { MiCv } from "@/components/cv/MiCv";
import { Seccion } from "@/components/marca/Seccion";
import { PerfilPostulante } from "@/components/postulante/PerfilPostulante";

export const metadata = {
  title: "Mi perfil — Portal de Empleo",
};

export default async function PaginaPerfilPostulante({ searchParams }: PageProps<"/postulante/perfil">) {
  const { oferta } = await searchParams;

  return (
    <Seccion titulo="Mi perfil" bajada="Tus datos personales, tu currículum y los rubros en los que buscás trabajo.">
      <div className="flex flex-col gap-10">
        <PerfilPostulante />
        
        <div id="cv" className="scroll-mt-24">
          <h2 className="mb-6 font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Curriculum vitae
          </h2>
          <MiCv ofertaId={typeof oferta === "string" ? oferta : undefined} />
        </div>
      </div>
    </Seccion>
  );
}
