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
 * P20: help for applicants and companies (D-057).
 * - If the logged-in user is `postulante`, strictly shows ONLY applicant help (hiding the selector).
 * - If the logged-in user is `empresa`, strictly shows ONLY company help (hiding the selector).
 * - Visitors without a session (or Office staff) can switch between both guides using `SelectorPublico`.
 * - On mobile: FAQs appear first (order-1), with the step-by-step guide below (order-2) peeking into view.
 */
export default async function AyudaPage(props: { searchParams: Promise<{ para?: string }> }) {
  const { para } = await props.searchParams;
  const usuario = await getCurrentUser();

  const rolFijo: Publico | null =
    usuario?.rol === "postulante"
      ? "postulante"
      : usuario?.rol === "empresa"
        ? "empresa"
        : null;

  const publico: Publico = rolFijo ?? (para === "empresa" ? "empresa" : "postulante");

  const bajada =
    rolFijo === "postulante"
      ? "Guía paso a paso y respuestas rápidas para postularte a ofertas de trabajo en Funes."
      : rolFijo === "empresa"
        ? "Guía paso a paso y respuestas frecuentes para publicar búsquedas y recibir candidatos."
        : "Guías paso a paso y respuestas a las preguntas de todos los días.";

  return (
    <Seccion titulo="Ayuda" bajada={bajada}>
      <div className="flex flex-col gap-10">
        {!rolFijo && <SelectorPublico elegido={publico} />}
        <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-start lg:gap-12">
          <div className="order-2 lg:order-1">
            <GuiaPasos
              titulo={publico === "empresa" ? "Cómo encontrar personal" : "Cómo buscar trabajo"}
              pasos={GUIAS[publico]}
            />
          </div>
          <div className="order-1 lg:order-2">
            <PreguntasFrecuentes preguntas={PREGUNTAS[publico]} />
          </div>
        </div>
        <ContactoAyuda />
      </div>
    </Seccion>
  );
}
