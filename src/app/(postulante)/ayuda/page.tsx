import type { Metadata } from "next";

import { ContactoAyuda } from "@/components/ayuda/ContactoAyuda";
import { GUIAS, PREGUNTAS, type Publico } from "@/components/ayuda/contenido";
import { GuiaPasos } from "@/components/ayuda/GuiaPasos";
import { PreguntasFrecuentes } from "@/components/ayuda/PreguntasFrecuentes";
import { SelectorPublico } from "@/components/ayuda/SelectorPublico";
import { Seccion } from "@/components/marca/Seccion";
import { getCurrentUser } from "@/lib/dal/auth";

export const metadata: Metadata = { title: "Ayuda" };

/**
 * P20: help for applicants and companies (D-057). Public, so it also helps
 * before creating an account. `?para=empresa` shows the company's guide;
 * without it, a logged-in company starts on its own guide and everyone else on
 * the applicant's.
 */
export default async function AyudaPage(props: { searchParams: Promise<{ para?: string }> }) {
  const { para } = await props.searchParams;
  const usuario = await getCurrentUser();
  const publico: Publico = para === "empresa" || (!para && usuario?.rol === "empresa") ? "empresa" : "postulante";

  return (
    <Seccion titulo="Ayuda" bajada="Guías paso a paso y respuestas a las preguntas de todos los días.">
      <div className="flex flex-col gap-10">
        <SelectorPublico elegido={publico} />
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-12">
          <GuiaPasos
            titulo={publico === "empresa" ? "Cómo encontrar personal" : "Cómo buscar trabajo"}
            pasos={GUIAS[publico]}
          />
          <PreguntasFrecuentes preguntas={PREGUNTAS[publico]} />
        </div>
        <ContactoAyuda />
      </div>
    </Seccion>
  );
}
