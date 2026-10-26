import { Seccion } from "@/components/marca/Seccion";
import { PerfilPostulante } from "@/components/postulante/PerfilPostulante";
import { SeccionCv } from "@/components/postulante/SeccionCv";

export const metadata = {
  title: "Mi perfil",
};

export default async function PaginaPerfilPostulante({ searchParams }: PageProps<"/postulante/perfil">) {
  const { oferta } = await searchParams;
  const ofertaId = typeof oferta === "string" ? oferta : undefined;

  return (
    <Seccion titulo="Mi perfil" bajada="Tus datos personales, tu currículum y los rubros en los que buscás trabajo.">
      <div className="flex flex-col gap-10">
        <PerfilPostulante ofertaId={ofertaId} />
        <SeccionCv ofertaId={ofertaId} />
      </div>
    </Seccion>
  );
}
